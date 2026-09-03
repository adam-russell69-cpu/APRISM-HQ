# Architecture

## Overview

APRISM uses a single Next.js App Router application for the public marketing site and private client portal.

```text
Browser
  ├─ Marketing routes ──> Server Components + Server Action inquiry boundary
  ├─ Assessment intake ─> Validated write-only Supabase assessment record
  ├─ Portal routes ─────> Next.js proxy session refresh ──> Supabase Auth
  ├─ Pay invoice ───────> Authorized Server Action ───────> Stripe-hosted Checkout
  ├─ Stripe webhook ────> Signature verification ─────────> Atomic payment RPC
  └─ Admin routes ──────> Staff-role verification ────────> Assessments + Billing + Postgres RLS
```

## Application boundaries

- `src/app/(marketing)`: public pages. The route group shares the public header, footer, structured data, and brand surface without affecting URLs.
- `src/app/portal/login`: sign-in surface. When credentials are absent, it offers an explicit MVP preview link.
- `src/app/portal/(dashboard)`: portal routes wrapped by the private portal shell.
- `src/app/admin`: APRISM owner/staff console for inquiries and operating records.
- `src/app/admin/assessments`: staff-only checklist, report workflow, saved records, and protected reference-PDF delivery.
- `src/app/api/stripe/webhook`: raw-body, signature-verified Stripe event boundary.
- `src/app/portal/(dashboard)/business`: business-account dashboard and work-order record.
- `src/app/portal/(dashboard)/invoices`: private/business invoice list, detail, hosted Checkout action, and protected PDF redirect.
- `src/components/marketing`: public navigation, footer, service template, and inquiry form.
- `src/components/portal`: portal navigation, health labels, panels, and forms.
- `src/lib/supabase`: browser client, server client, configuration check, and proxy session refresh.
- `src/lib/supabase/admin.ts`: server-only secret-key client for verified webhooks and short-lived invoice-document URLs.
- `src/lib/billing-records.ts`: RLS-scoped billing data-access layer and explicit development preview.
- `src/lib/stripe/server.ts`: server-only Stripe SDK boundary.
- `src/proxy.ts`: Next.js 16 request boundary for `/portal/:path*` and `/admin/:path*`.
- `supabase/migrations`: reproducible database schema and policies.

## Rendering model

Pages are Server Components by default. Client Components are limited to responsive navigation and forms that need React Action state. This keeps the client bundle focused and avoids unnecessary browser data fetching.

## Authentication and authorization

Authentication and authorization are separate layers:

1. Supabase Auth issues cookie-backed sessions through `@supabase/ssr`.
2. `src/proxy.ts` calls `auth.getClaims()` early to refresh/validate the session and performs an optimistic redirect for portal routes.
3. Server Actions validate the session again before live writes.
4. PostgreSQL RLS is the authoritative data boundary.
5. A user can see property data only when `property_members.user_id = auth.uid()` for that property.
6. Company administration is a separate authorization layer: `staff_users` grants owner/admin/steward access and is never writable through the public client API.
7. `client_account_members` grants explicit access to private or business accounts. No billing role is read from user metadata.
8. Client users have read-only billing access. Billing mutations require an active APRISM staff row, except verified webhook writes made by the server-only Supabase secret.

The proxy is not treated as the only security boundary. The database enforces access even if a route or client query is changed.

## Preview mode

When Supabase public credentials are absent, the public site renders normally, portal routes show realistic static sample data, and form actions validate but do not persist data. The Mountain Time Homes preview is labeled development demo data, contains no personal resident details, disables payment controls, and contains no completed payment. Preview mode exists for design review and must not be mistaken for a production data workflow.

## Payment boundary

APRISM owns the invoice record; Stripe owns all payment credentials and payment confirmation.

1. A signed-in account member opens an invoice through RLS.
2. The Checkout Server Action re-fetches that invoice and accepts only its identifier and a constrained `ach` or `card` selection from the browser.
3. The server creates or reuses a Stripe Customer, then creates a hosted Checkout Session for the current database balance. ACH (`us_bank_account`) is the preferred USD flow.
4. A Checkout return URL is informational only. It never marks an invoice paid.
5. Stripe calls `/api/stripe/webhook`. The handler reads the unmodified request body and verifies the `Stripe-Signature` header.
6. The verified event is normalized and sent to `process_stripe_payment_event`. Event logging, PaymentIntent upsert, and invoice-balance recalculation run in one transaction.
7. Stripe event IDs and PaymentIntent IDs are unique. Retries and out-of-order pending events cannot duplicate or downgrade a succeeded payment.

The public publishable key is reserved for a future Stripe Elements experience. The current hosted Checkout flow does not ship the Stripe SDK or either secret into browser code.

## QuickBooks boundary

QuickBooks Online is not connected. `quickbooks_customer_id`, `quickbooks_invoice_id`, and `quickbooks_payment_id` provide stable synchronization keys for a future server-side adapter. That adapter should translate client accounts, invoices, payments, and status changes without making QuickBooks the authorization source or trusting browser-submitted accounting state.

## Vercel readiness

- Node.js runtime is used by default.
- Metadata, sitemap, robots, manifest, and Open Graph routes are generated by Next.js.
- `NEXT_PUBLIC_SITE_URL` establishes a trusted canonical origin.
- No host header is trusted to construct metadata or auth origins.
- Security headers are returned from `next.config.ts`.
- No service-role credential is present in the repository or browser bundle. A Supabase secret is required only in server runtime environment variables for verified payment processing and signed invoice-document delivery.
- Only the client Intake PDF is static/public. Internal checklist and report PDFs remain outside `public/` and are delivered by a staff-authorized Node.js route handler with private, no-store caching.
