"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

type CheckoutMethod = "ach" | "card";
type CheckoutAccount = {
  id: string;
  display_name: string;
  legal_name: string | null;
  email: string | null;
  billing_email: string | null;
  stripe_customer_id: string | null;
  account_type: "private" | "business";
};

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function paymentRedirect(invoiceNumber: string, status: string): never {
  redirect(`/portal/invoices/${encodeURIComponent(invoiceNumber)}?payment=${status}`);
}

const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const threeDecimalCurrencies = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

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

function getSiteOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredOrigin) return null;
  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return null;
  }
}

export async function createInvoiceCheckout(formData: FormData) {
  const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();
  const method = String(formData.get("paymentMethod") ?? "") as CheckoutMethod;

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(invoiceNumber) || !["ach", "card"].includes(method)) {
    paymentRedirect(invoiceNumber || "invoice", "invalid");
  }

  const supabase = await createClient();
  const stripe = getStripe();
  const admin = createAdminClient();
  const siteOrigin = getSiteOrigin();
  if (!supabase || !stripe || !admin || !siteOrigin) paymentRedirect(invoiceNumber, "unavailable");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect(`/portal/login?next=/portal/invoices/${encodeURIComponent(invoiceNumber)}`);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, client_account_id, invoice_number, status, amount_due, currency, stripe_customer_id, updated_at, client_accounts(id, display_name, legal_name, email, billing_email, stripe_customer_id, account_type)")
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();

  if (invoiceError || !invoice) paymentRedirect(invoiceNumber, "not-found");
  if (!["sent", "partially_paid", "overdue"].includes(invoice.status) || Number(invoice.amount_due) <= 0) {
    paymentRedirect(invoiceNumber, "not-payable");
  }
  if (method === "ach" && invoice.currency !== "USD") paymentRedirect(invoiceNumber, "ach-unavailable");

  const account = firstRelation(invoice.client_accounts as CheckoutAccount | CheckoutAccount[] | null);
  if (!account) paymentRedirect(invoiceNumber, "unavailable");

  let checkoutUrl: string;
  try {
    let customerId = invoice.stripe_customer_id ?? account.stripe_customer_id;
    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) throw new Error("The stored Stripe customer is no longer active");
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: account.legal_name ?? account.display_name,
        email: account.billing_email ?? account.email ?? undefined,
        metadata: {
          aprism_client_account_id: account.id,
          aprism_account_type: account.account_type,
        },
      }, { idempotencyKey: `aprism:customer:${account.id}` });
      customerId = customer.id;

      const { error: customerUpdateError } = await admin.from("client_accounts").update({ stripe_customer_id: customerId }).eq("id", account.id);
      if (customerUpdateError) throw customerUpdateError;
    }

    const amount = amountToMinorUnits(invoice.amount_due, invoice.currency);
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = method === "ach" ? ["us_bank_account"] : ["card"];
    const invoicePath = `/portal/invoices/${encodeURIComponent(invoice.invoice_number)}`;
    const metadata = {
      aprism_invoice_id: invoice.id,
      aprism_invoice_number: invoice.invoice_number,
      aprism_client_account_id: invoice.client_account_id,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: invoice.id,
      payment_method_types: paymentMethodTypes,
      billing_address_collection: "required",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: amount,
          product_data: {
            name: `APRISM invoice ${invoice.invoice_number}`,
            description: `Balance due to APRISM · ${account.display_name}`,
          },
        },
      }],
      metadata,
      payment_intent_data: {
        description: `APRISM invoice ${invoice.invoice_number}`,
        metadata,
      },
      success_url: `${siteOrigin}${invoicePath}?payment=processing`,
      cancel_url: `${siteOrigin}${invoicePath}?payment=cancelled`,
    }, {
      idempotencyKey: `aprism:checkout:${invoice.id}:${method}:${amount}`,
    });

    if (!session.url) throw new Error("Stripe Checkout did not return a hosted URL");

    const { error: invoiceUpdateError } = await admin
      .from("invoices")
      .update({ stripe_customer_id: customerId, stripe_checkout_session_id: session.id })
      .eq("id", invoice.id)
      .eq("client_account_id", invoice.client_account_id);
    if (invoiceUpdateError) throw invoiceUpdateError;

    checkoutUrl = session.url;
  } catch (error) {
    console.error("[invoice-checkout] Hosted Checkout creation failed", {
      invoiceId: invoice.id,
      method,
      message: error instanceof Error ? error.message : "Unknown checkout error",
    });
    paymentRedirect(invoiceNumber, "unavailable");
  }

  redirect(checkoutUrl);
}
