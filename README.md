# APRISM Website + Client Portal MVP

APRISM is a luxury asset stewardship company serving Park City, Deer Valley, Promontory, Summit County, and the Wasatch Back. This repository contains the public marketing site, the first client-portal experience, and the secure Supabase schema that will support live property records.

> Luxury Asset Stewardship. Managing What Matters.

## What is included

- Mobile-first marketing site with service, membership, about, service-area, and property-assessment routes
- Premium dark charcoal, warm gold, editorial design system
- Client portal concepts for property health, inspections, maintenance, issues, documents, vendors, photographs, and service requests
- Unified private/business client accounts, work orders, invoices, payments, and a Mountain Time Homes pilot
- Stripe-hosted ACH/card Checkout boundary with signature-verified, idempotent webhooks
- Next.js App Router, React 19, TypeScript, Tailwind CSS 4, and ESLint
- Supabase SSR clients and Next.js 16 `proxy.ts` session refresh/auth boundary
- Initial PostgreSQL migration with UUID primary keys, timestamps, indexes, least-privilege grants, and RLS on all exposed tables
- Route metadata, sitemap, robots rules, structured data, manifest, and branded Open Graph image

See [docs/ROUTES.md](docs/ROUTES.md) for the route inventory and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design.

## Local setup

Requirements:

- Node.js 22 or newer (Supabase client libraries dropped Node.js 20 support in 2026)
- npm 10 or newer

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase credentials, the public site and portal sample data work in preview mode. The portal login screen links to the sample dashboard. No inquiry or portal request data is persisted in preview mode.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For live portal | URL of the new APRISM Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For live portal | Publishable browser-safe key for that project |
| `NEXT_PUBLIC_SITE_URL` | Before deployment | Trusted canonical origin for metadata, sitemap, and auth |
| `SUPABASE_SECRET_KEY` | Live payments/PDFs | Server-only key for verified webhook writes and signed invoice downloads |
| `STRIPE_SECRET_KEY` | Live payments | Server-only Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Live payments | Server-only signing secret for `/api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client readiness | Browser-safe key reserved for a future Elements flow; hosted Checkout does not require it |

Never place a Supabase secret key, legacy `service_role` key, Stripe secret key, or Stripe webhook secret in a `NEXT_PUBLIC_*` variable. Server secrets are used only by `server-only` modules.

## Supabase setup

1. Create a new APRISM Supabase project. Do not reuse the CackleMap project.
2. Install the current Supabase CLI and run `supabase link --project-ref <aprism-project-ref>`.
3. Review and apply `supabase/migrations/20260828182825_initial_aprism_schema.sql`.
4. Run `supabase db advisors` and `supabase test db` against a local or preview database.
5. Create Auth users, insert their `profiles` rows, and provision property access through `property_members` or account access through `client_account_members`.
6. Add the public project URL and publishable key to `.env.local` and the Vercel project environment.
7. Configure the allowed Site URL and redirect URLs in Supabase Auth.
8. Configure Stripe sandbox credentials and the signed `/api/stripe/webhook` endpoint before testing payments.

The database intentionally gives clients no ability to create or edit `property_members`. Client access is always provisioned administratively and enforced by RLS.

## Verification

```bash
npm run lint
npm run build
```

For final release checks, follow [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).

## Vercel deployment

The project is Vercel-ready but is not deployed from this branch.

1. Import the repository into Vercel.
2. Set the Supabase, site-origin, and Stripe variables listed above in the appropriate Preview and Production scopes.
3. Verify Supabase Auth redirect URLs against the Vercel Preview and production domains.
4. Run the launch checklist on a Preview deployment.
5. Promote only after production credentials, form delivery, legal content, and client data onboarding are approved.

## MVP status

Complete in this branch:

- Marketing routes and responsive visual system
- Membership pricing and labor disclosure
- Property assessment form with validated placeholder Server Action
- Portal UI and realistic sample property record
- Supabase-ready SSR/auth boundary and secure initial schema
- Business-client portal, unified invoicing, exact payment ledger, and admin billing view
- Server-only Stripe Checkout/customer boundary and verified idempotent webhook processing
- Documentation, SEO, lint/build verification, and browser-acceptance checklist

Still required for a live launch:

- New APRISM Supabase credentials and production Auth configuration
- Real property/client records and storage buckets
- Live Stripe credentials, webhook registration, ACH/card sandbox evidence, and reconciliation sign-off
- Final inquiry delivery destination (Supabase table, CRM, or email workflow)
- Production domain, analytics/consent decisions, legal/privacy copy, and deployment approval
