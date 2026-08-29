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

## Framework routes

| Route | Purpose |
| --- | --- |
| `/sitemap.xml` | Public marketing route discovery |
| `/robots.txt` | Search guidance; disallows portal crawling |
| `/manifest.webmanifest` | Application identity and theme |
| `/opengraph-image` | Branded social preview image |

`src/proxy.ts` requires a valid session for every portal route except `/portal/login`. Pilot property records are finalized during APRISM onboarding.
