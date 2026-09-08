# Launch Checklist

## Product and content

- [ ] Confirm company legal name, business address, phone, and monitored inquiry email.
- [ ] Approve all public service descriptions, pricing, membership scope, and labor disclosure.
- [ ] Confirm service-area wording and any geographic exclusions.
- [ ] Add final privacy policy, terms, accessibility contact, and required Utah business disclosures.
- [ ] Approve the inquiry success message and response-time expectation.

## Supabase

- [ ] Create a new APRISM project; do not connect CackleMap.
- [ ] Apply all committed migrations to a preview environment.
- [ ] Run `supabase db advisors` and resolve security/performance findings.
- [ ] Run `supabase test db` and confirm the RLS contract tests pass.
- [ ] Test allow/deny behavior with two real Auth users assigned to different properties.
- [ ] Confirm no user can create, modify, or delete `property_members` through the client API.
- [ ] Confirm ordinary clients cannot read or modify `staff_users` or open `/admin`.
- [ ] Confirm only reviewed owner/admin accounts can change property membership.
- [ ] Configure document storage with property-member policies before uploading client files.
- [ ] Seed production only with reviewed property/client records.
- [ ] Apply `20260903000102_add_business_client_billing.sql` and confirm every existing property was backfilled to a private client account.
- [ ] Link Mountain Time Homes users through `client_account_members`; never copy the demo `.invalid` contacts into production.
- [ ] Test two account members from different client accounts and prove cross-account locations, work orders, invoices, items, and payments return no rows.

## Authentication

- [ ] Set the Supabase Site URL and all allowed Vercel redirect URLs.
- [ ] Verify sign-in, token refresh, sign-out, expired-session redirect, and multi-tab behavior.
- [ ] Confirm portal routes never depend on `user_metadata` for authorization.
- [ ] Confirm only the publishable key is present in client-accessible environment variables.
- [ ] Set `SUPABASE_SECRET_KEY` only in server runtime environments; confirm it is absent from browser bundles and logs.
- [ ] Set an appropriate JWT expiry and decide how sensitive-session revocation is handled.

## Forms and integrations

- [ ] Connect the property-assessment Server Action to the approved CRM, email, or Supabase table.
- [ ] Add server-side abuse controls, rate limiting, and bot protection.
- [ ] Confirm service requests persist and notify the assigned steward.
- [ ] Add transactional email templates and delivery monitoring if email is selected.

## Stripe payments

- [ ] Provision a Stripe sandbox and set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel Preview.
- [ ] Register the exact HTTPS endpoint `/api/stripe/webhook` and subscribe only to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `payment_intent.processing`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, and `charge.refunded`.
- [ ] Use the Stripe CLI or Workbench sandbox to prove invalid signatures return 400, valid retries return `duplicate`, and out-of-order pending events do not downgrade a succeeded payment.
- [ ] Complete one card sandbox payment and one ACH sandbox payment; verify ACH remains pending until Stripe confirms success.
- [ ] Confirm Checkout return URLs never change payment or invoice status without a verified webhook.
- [ ] Review Stripe payment-method settings, US bank account eligibility, statement descriptor, support contact, branding, and production activation.
- [ ] Rotate from sandbox to live keys only after webhook and reconciliation sign-off. Test and live webhook secrets are different.

## Vercel and operations

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SECRET_KEY`, and Stripe variables in the correct Preview/Production scopes.
- [ ] Pin the Node.js version to 22 or newer.
- [ ] Run `npm ci`, `npm run lint`, and `npm run build` in CI.
- [ ] Review a Vercel Preview deployment before production promotion.
- [ ] Verify canonical URLs, sitemap, robots rules, Open Graph image, and search previews.
- [ ] Add error monitoring, uptime checks, analytics, and a privacy-consent approach.
- [ ] Configure the production domain and DNS only after sign-off.

## Browser acceptance

- [ ] Homepage at 1440px, 1024px, 768px, 390px, and 320px.
- [ ] Mobile navigation opens, links correctly, and closes after navigation.
- [ ] Memberships remain readable without horizontal overflow.
- [ ] Contact form validates required fields and displays its delivery state.
- [ ] Portal dashboard and property record work on desktop and mobile.
- [ ] Business dashboard, work-order list/detail, invoice list/detail, and payment CTAs work on desktop and mobile.
- [ ] Keyboard focus, color contrast, and reduced-motion behavior are acceptable.
- [ ] No console errors, hydration errors, error overlays, broken links, or unintended horizontal scroll.

## Release decision

- [ ] Product owner approves content and visual presentation.
- [ ] Security owner approves RLS test evidence.
- [ ] Operations owner approves inquiry and service-request routing.
- [ ] Production deployment is explicitly authorized.
