import "server-only";

import Stripe from "stripe";

const DEFAULT_EXPECTED_STRIPE_ACCOUNT_ID = "acct_1UBO7cGmTuaDVWSq";

let stripeClient: Stripe | null = null;
let verifiedStripeAccountId: string | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  stripeClient ??= new Stripe(secretKey, {
    maxNetworkRetries: 2,
    typescript: true,
  });

  return stripeClient;
}

export async function assertExpectedStripeAccount(stripe: Stripe) {
  const expectedAccountId = process.env.STRIPE_EXPECTED_ACCOUNT_ID?.trim() || DEFAULT_EXPECTED_STRIPE_ACCOUNT_ID;
  if (verifiedStripeAccountId === expectedAccountId) return;

  const account = await stripe.accounts.retrieve();
  if (account.id !== expectedAccountId) {
    throw new Error(`[stripe-account-guard] Refusing payment operation: configured Stripe account ${account.id} does not match expected APRISM account ${expectedAccountId}`);
  }

  verifiedStripeAccountId = account.id;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
