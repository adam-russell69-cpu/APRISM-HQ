# Route Inventory

## Public marketing

| Route | Purpose |
| --- | --- |
| `/` | Core positioning, services, service area, and assessment CTA |
| `/property-services` | Preventive maintenance and field-service stewardship |
| `/estate-management` | Whole-estate coordination and oversight |
| `/home-watch` | Documented vacant/second-home inspections |
| `/new-home-stewardship` | Equipment, warranty, and first-year onboarding |
| `/moto` | Motorcycle acquisition and collection stewardship |
| `/memberships` | Membership levels, pricing, field rates, and labor disclosure |
| `/about` | APRISM philosophy and operating principles |
| `/service-area` | Park City, Summit County, and Wasatch Back coverage |
| `/contact` | Property-assessment inquiry form |
| `/property-assessment/intake` | Electronic assessment intake and public fillable PDF |
| `/privacy` | Privacy notice |
| `/terms` | Website, membership, and portal terms |

## Client portal

| Route | Purpose |
| --- | --- |
| `/portal/login` | Supabase Auth sign-in |
| `/portal` | Client dashboard |
| `/portal/properties` | Client property portfolio |
| `/portal/properties/[id]` | Property detail and operating record |
| `/portal/inspections` | Inspection history and reports |
| `/portal/maintenance` | Planned and recurring maintenance |
| `/portal/issues` | Property-condition issues |
| `/portal/documents` | Client document library |
| `/portal/requests` | Service-request creation and history |
| `/portal/profile` | Client profile and access information |
| `/portal/business` | Business-account dashboard |
| `/portal/business/work-orders` | Business work orders |
| `/portal/business/work-orders/[id]` | Work-order detail |
| `/portal/invoices` | Invoice list and balances |
| `/portal/invoices/[invoiceNumber]` | Invoice detail and payment CTA |
| `/portal/invoices/[invoiceNumber]/pdf` | Authorized invoice PDF download |

## APRISM administration

| Route | Purpose |
| --- | --- |
| `/admin` | Protected operations dashboard and Proof Mode |
| `/admin/clients` | Leads and client accounts |
| `/admin/clients/new` | Create a client account |
| `/admin/clients/[id]` | Client-account detail |
| `/admin/clients/leads/[id]` | Lead detail and status management |
| `/admin/assessments` | Assessment pipeline |
| `/admin/assessments/new` | Start a new assessment |
| `/admin/assessments/[id]` | Assessment field/report workflow |
| `/admin/assessments/documents/[document]` | Staff-only assessment document boundary |
| `/admin/properties` | Property portfolio |
| `/admin/properties/new` | Add a property |
| `/admin/properties/[id]` | Property operating record |
| `/admin/requests` | Service-request queue |
| `/admin/requests/[id]` | Service-request detail |
| `/admin/issues` | Property issue queue |
| `/admin/issues/[id]` | Issue detail |
| `/admin/billing` | Estimates, invoices, A/R, work orders, and payments |
| `/admin/billing/estimates/new` | Create estimate |
| `/admin/billing/estimates/[estimateNumber]` | Estimate detail |
| `/admin/billing/invoices/[invoiceNumber]` | Invoice detail |
| `/admin/working-capital` | Operating cash and reserve tracking |
| `/admin/vendors` | Vendor records |
| `/admin/documents` | Staff document access |
| `/admin/settings` | Staff/admin settings |

## Payment API

| Route | Purpose |
| --- | --- |
| `/api/stripe/webhook` | Stripe signature verification and idempotent payment/invoice processing |

## Framework routes

| Route | Purpose |
| --- | --- |
| `/sitemap.xml` | Public route discovery |
| `/robots.txt` | Search guidance |
| `/manifest.webmanifest` | Public application identity |
| `/admin-manifest.webmanifest` | Admin application identity |
| `/opengraph-image` | Branded social preview image |

`src/proxy.ts` requires a valid session for protected portal and admin routes. The admin layout separately requires an active staff assignment; ordinary clients are routed back to the client portal.
