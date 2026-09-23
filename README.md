# APRISM HQ

APRISM HQ is the operating platform for APRISM Luxury Asset Stewardship, serving Park City, Summit County, and the Wasatch Back.

> Luxury Asset Stewardship. Managing What Matters.

This repository contains the public website, protected staff operations console, client portal, property-assessment workflow, billing and payment records, and the Supabase-backed property/client data model.

## Current platform

### Public website
- Luxury stewardship marketing site
- Property Services, Estate Management, Home Watch, New Home Stewardship, APRISM Moto, Memberships, About, Service Area, and Contact
- Electronic Property Assessment intake
- SEO metadata, sitemap, robots, structured data, analytics hooks, and branded social preview assets

### APRISM Operations
- Protected staff dashboard at `/admin`
- Proof Mode metrics
- Clients and leads
- Property assessments and field reporting
- Property records
- Service requests and issues
- Estimates, invoices, payments, and accounts receivable
- Working-capital tracking
- Vendor and document views

### Client portal
- Authenticated client access
- Property health and records
- Business-account work orders
- Invoices and payment links
- Service requests
- Documents and maintenance history

### Platform
- Next.js App Router, React 19, TypeScript, Tailwind CSS 4
- Supabase Auth/Postgres/RLS
- Stripe-hosted Checkout and verified webhooks
- Vercel deployment
- Mobile-first admin and portal interfaces
- Offline-aware field assessment support

## Operating priorities

APRISM HQ is now an operating system rather than an MVP prototype. Current development should prioritize:

1. Reliable field use and clean client records
2. Proof Gate visibility and revenue metrics
3. Assessment-to-recurring-client conversion
4. Billing/reconciliation accuracy
5. Mobile admin speed and clarity
6. Removal or archival of obsolete prototype material

See [docs/OPERATIONS_STATUS.md](docs/OPERATIONS_STATUS.md) for the current cleanup status and [docs/ROUTES.md](docs/ROUTES.md) for the route inventory.

## Local setup

Requirements:

- Node.js 22 or newer
- npm 10 or newer

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | APRISM Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Supabase publishable key |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical public origin |
| `SUPABASE_SECRET_KEY` | Server only | Privileged server operations |
| `STRIPE_SECRET_KEY` | Server only | Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-safe | Stripe client configuration |

Never place a Supabase secret key, legacy `service_role` key, Stripe secret key, or webhook secret in a `NEXT_PUBLIC_*` variable.

## Verification

Before merging application changes:

```bash
npm ci
npm run lint
npm run build
```

Database changes should also pass the committed Supabase contract tests.

## Data boundary

APRISM uses its own Supabase project. Do not reuse or connect the CackleMap project.

Client access is enforced with RLS and account/property membership. Staff/admin access is separately authorized. Payment state must only be updated from verified Stripe events or reviewed administrative workflows.

## Repository housekeeping

The root-level `APRISM_01_...` through `APRISM_06_...` PDFs are legacy planning artifacts. They remain retained for reference but are not the operating source of truth. Current operating documentation belongs under `docs/`, and current assessment templates live under the dedicated public/private document directories.
