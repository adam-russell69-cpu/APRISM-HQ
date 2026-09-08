import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
type PaymentMethod = "ach" | "card" | "other";
type PaymentEvent = {
  invoiceId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  amountMinor: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
};

const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const threeDecimalCurrencies = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

function minorAmountToDecimal(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const exponent = zeroDecimalCurrencies.has(normalizedCurrency) ? 0 : threeDecimalCurrencies.has(normalizedCurrency) ? 3 : 2;
  const factor = 10 ** exponent;
  return (amount / factor).toFixed(exponent);
}

function isUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function paymentMethodFromIntent(intent: Stripe.PaymentIntent): PaymentMethod {
  const attachedMethod = intent.payment_method;
  const type = typeof attachedMethod === "object" && attachedMethod ? attachedMethod.type : intent.payment_method_types[0];
  if (type === "us_bank_account") return "ach";
  if (type === "card") return "card";
  return "other";
}

function chargeIdFromIntent(intent: Stripe.PaymentIntent) {
  return typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id ?? null;
}

async function retrievePaymentIntent(stripe: Stripe, value: string | Stripe.PaymentIntent | null) {
  if (!value) return null;
  return typeof value === "string" ? stripe.paymentIntents.retrieve(value) : value;
}

async function normalizePaymentEvent(stripe: Stripe, event: Stripe.Event): Promise<PaymentEvent | null> {
  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled" || event.type === "payment_intent.processing") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const status: PaymentStatus = event.type === "payment_intent.succeeded"
      ? "succeeded"
      : event.type === "payment_intent.payment_failed"
        ? "failed"
        : event.type === "payment_intent.canceled"
          ? "cancelled"
          : "pending";
    return {
      invoiceId: intent.metadata.aprism_invoice_id ?? null,
      paymentIntentId: intent.id,
      chargeId: chargeIdFromIntent(intent),
      amountMinor: status === "succeeded" ? intent.amount_received : intent.amount,
      currency: intent.currency,
      method: paymentMethodFromIntent(intent),
      status,
      paidAt: status === "succeeded" ? new Date(event.created * 1000).toISOString() : null,
    };
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const intent = await retrievePaymentIntent(stripe, session.payment_intent as string | Stripe.PaymentIntent | null);
    if (!intent) return null;
    const status: PaymentStatus = event.type === "checkout.session.async_payment_failed"
      ? "failed"
      : event.type === "checkout.session.async_payment_succeeded" || session.payment_status === "paid"
        ? "succeeded"
        : "pending";
    return {
      invoiceId: intent.metadata.aprism_invoice_id ?? session.metadata?.aprism_invoice_id ?? null,
      paymentIntentId: intent.id,
      chargeId: chargeIdFromIntent(intent),
      amountMinor: status === "succeeded" ? intent.amount_received : (session.amount_total ?? intent.amount),
      currency: intent.currency,
      method: paymentMethodFromIntent(intent),
      status,
      paidAt: status === "succeeded" ? new Date(event.created * 1000).toISOString() : null,
    };
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const intent = await retrievePaymentIntent(stripe, charge.payment_intent as string | Stripe.PaymentIntent | null);
    if (!intent) return null;
    return {
      invoiceId: intent.metadata.aprism_invoice_id ?? null,
      paymentIntentId: intent.id,
      chargeId: charge.id,
      amountMinor: charge.amount,
      currency: charge.currency,
      method: paymentMethodFromIntent(intent),
      status: charge.refunded ? "refunded" : "succeeded",
      paidAt: new Date(charge.created * 1000).toISOString(),
    };
  }

  return null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  const admin = createAdminClient();
  if (!stripe || !webhookSecret || !admin) {
    return Response.json({ error: "Stripe webhook processing is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing Stripe signature" }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  try {
    const payment = await normalizePaymentEvent(stripe, event);
    if (!payment) return Response.json({ received: true, result: "ignored" });
    if (!isUuid(payment.invoiceId)) {
      console.warn("[stripe-webhook] Verified event did not contain a valid APRISM invoice ID", { eventId: event.id, type: event.type });
      return Response.json({ received: true, result: "ignored" });
    }

    const { data, error } = await admin.rpc("process_stripe_payment_event", {
      p_stripe_event_id: event.id,
      p_stripe_event_type: event.type,
      p_stripe_object_id: payment.paymentIntentId,
      p_stripe_created_at: new Date(event.created * 1000).toISOString(),
      p_target_invoice_id: payment.invoiceId,
      p_payment_intent_id: payment.paymentIntentId,
      p_charge_id: payment.chargeId,
      p_payment_amount: minorAmountToDecimal(payment.amountMinor, payment.currency),
      p_payment_currency: payment.currency.toUpperCase(),
      p_payment_method: payment.method,
      p_payment_status: payment.status,
      p_payment_paid_at: payment.paidAt,
    });
    if (error) throw error;

    return Response.json({ received: true, result: data });
  } catch (error) {
    console.error("[stripe-webhook] Verified event processing failed", {
      eventId: event.id,
      type: event.type,
      message: error instanceof Error ? error.message : "Unknown processing error",
    });
    return Response.json({ error: "Verified Stripe event could not be processed" }, { status: 500 });
  }
}
