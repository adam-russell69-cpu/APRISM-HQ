"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

type CheckoutMethod = "ach" | "card";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const threeDecimalCurrencies = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

function paymentRedirect(invoiceId: string, status: string): never {
  redirect(`/pay/${encodeURIComponent(invoiceId)}?payment=${status}`);
}

function amountToMinorUnits(value: number | string, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const exponent = zeroDecimalCurrencies.has(normalizedCurrency) ? 0 : threeDecimalCurrencies.has(normalizedCurrency) ? 3 : 2;
  const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value));
  const fractionalDigits = (match?.[2] ?? "").replace(/0+$/, "");
  if (!match || fractionalDigits.length > exponent) throw new Error("Invoice balance is not valid for its currency");
  const factor = 10 ** exponent;
  const result = Number(match[1]) * factor + Number(fractionalDigits.padEnd(exponent, "0"));
  if (!Number.isSafeInteger(result) || result <= 0) throw new Error("Invoice balance is outside the supported range");
  return result;
}

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return null;
  try {
    return new URL(configured).origin;
  } catch {
    return null;
  }
}

export async function createPublicInvoiceCheckout(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const method = String(formData.get("paymentMethod") ?? "") as CheckoutMethod;
  if (!uuidPattern.test(invoiceId) || !["ach", "card"].includes(method)) paymentRedirect(invoiceId || "invoice", "invalid");

  const admin = createAdminClient();
  const stripe = getStripe();
  const origin = siteOrigin();
  if (!admin || !stripe || !origin) paymentRedirect(invoiceId, "unavailable");

  const { data: invoice, error } = await admin.from("invoices")
    .select("id, client_account_id, invoice_number, status, amount_due, currency, stripe_customer_id, client_accounts(id, display_name, legal_name, email, billing_email, stripe_customer_id, account_type)")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error || !invoice) paymentRedirect(invoiceId, "not-found");
  if (!["sent", "partially_paid", "overdue"].includes(invoice.status) || Number(invoice.amount_due) <= 0) paymentRedirect(invoiceId, "not-payable");
  if (method === "ach" && invoice.currency !== "USD") paymentRedirect(invoiceId, "ach-unavailable");

  const relation = invoice.client_accounts as {
    id: string;
    display_name: string;
    legal_name: string | null;
    email: string | null;
    billing_email: string | null;
    stripe_customer_id: string | null;
    account_type: "private" | "business";
  } | {
    id: string;
    display_name: string;
    legal_name: string | null;
    email: string | null;
    billing_email: string | null;
    stripe_customer_id: string | null;
    account_type: "private" | "business";
  }[] | null;
  const account = Array.isArray(relation) ? relation[0] : relation;
  if (!account) paymentRedirect(invoiceId, "unavailable");

  let checkoutUrl: string;
  try {
    let customerId = invoice.stripe_customer_id ?? account.stripe_customer_id;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) customerId = null;
      } catch (customerLookupError) {
        const stripeError = customerLookupError as Stripe.errors.StripeError;
        if (stripeError?.code === "resource_missing" && stripeError?.param === "id") {
          customerId = null;
        } else {
          throw customerLookupError;
        }
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: account.legal_name ?? account.display_name,
        email: account.billing_email ?? account.email ?? undefined,
        metadata: { aprism_client_account_id: account.id, aprism_account_type: account.account_type },
      }, { idempotencyKey: `aprism:customer:${account.id}` });
      customerId = customer.id;
      const { error: customerUpdateError } = await admin.from("client_accounts").update({ stripe_customer_id: customerId }).eq("id", account.id);
      if (customerUpdateError) throw customerUpdateError;
    }

    const amount = amountToMinorUnits(invoice.amount_due, invoice.currency);
    const metadata = {
      aprism_invoice_id: invoice.id,
      aprism_invoice_number: invoice.invoice_number,
      aprism_client_account_id: invoice.client_account_id,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: invoice.id,
      managed_payments: { enabled: false },
      payment_method_types: method === "ach" ? ["us_bank_account"] : ["card"],
      billing_address_collection: "required",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: amount,
          product_data: { name: `APRISM invoice ${invoice.invoice_number}`, description: `Balance due to APRISM · ${account.display_name}` },
        },
      }],
      metadata,
      payment_intent_data: { description: `APRISM invoice ${invoice.invoice_number}`, metadata },
      success_url: `${origin}/pay/${invoice.id}?payment=processing`,
      cancel_url: `${origin}/pay/${invoice.id}?payment=cancelled`,
    }, { idempotencyKey: `aprism:public-checkout:${invoice.id}:${method}:${amount}` });

    if (!session.url) throw new Error("Stripe Checkout did not return a hosted URL");
    const { error: updateError } = await admin.from("invoices").update({
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
    }).eq("id", invoice.id);
    if (updateError) throw updateError;
    checkoutUrl = session.url;
  } catch (checkoutError) {
    console.error("[public-invoice-checkout] Hosted Checkout creation failed", {
      invoiceId,
      method,
      message: checkoutError instanceof Error ? checkoutError.message : "Unknown checkout error",
    });
    paymentRedirect(invoiceId, "unavailable");
  }

  redirect(checkoutUrl);
}
