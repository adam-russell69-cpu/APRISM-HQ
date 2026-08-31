# Route Inventory

## Public marketing

| Route | Purpose |
| --- | --- |
| `/` | Core positioning, services, Property Health, service area, assessment CTA |
| `/property-services` | Preventive maintenance and field-service stewardship |
| `/estate-management` | Whole-estate coordination and oversight |
| `/home-watch` | Documented vacant/second-home inspections |
| `/new-home-stewardship` | Equipment, warranty, and first-year onboarding |
| `/moto` | Motorcycle acquisition and collection stewardship |
| `/memberships` | Membership levels, pricing, field rates, labor disclosure |
| `/about` | APRISM philosophy and operating principles |
| `/service-area` | Park City, Deer Valley, Promontory, and Summit County coverage |
| `/contact` | Premium property-assessment inquiry form |
| `/property-assessment/intake` | Scheduled-client electronic property assessment intake and public fillable PDF |
| `/privacy` | Website and portal privacy notice |
| `/terms` | Website, membership, and portal terms |

## Client portal

| Route | Purpose |
| --- | --- |
| `/portal/login` | Supabase Auth sign-in |
| `/portal` | Property health dashboard and current operating picture |
| `/portal/properties` | Client property portfolio |
| `/portal/properties/[id]` | Overview, systems, equipment, history, documents, vendors, photos, calendar |
| `/portal/inspections` | Documented inspection history and reports |
| `/portal/maintenance` | Planned and recurring maintenance |
| `/portal/issues` | Condition changes through resolution |
| `/portal/documents` | Property document library |
| `/portal/requests` | Service-request creation and history |
| `/portal/profile` | Contact preferences and authorized memberships |

## APRISM administration

| Route | Purpose |
| --- | --- |
| `/admin` | Protected owner/staff console for inquiries, properties, requests, and issues |
| `/admin/assessments` | Protected field checklist, report builder, saved assessment records, and staff-only PDF references |
| `/admin/assessments/documents/[document]` | Authenticated staff download boundary for internal assessment PDFs |

## Framework routes

| Route | Purpose |
| --- | --- |
| `/sitemap.xml` | Public marketing route discovery |
| `/robots.txt` | Search guidance; disallows portal crawling |
| `/manifest.webmanifest` | Application identity and theme |
| `/opengraph-image` | Branded social preview image |

`src/proxy.ts` requires a valid session for every portal and admin route except `/portal/login`. The `/admin` layout then requires an active `staff_users` assignment; ordinary clients are returned to the client portal.
