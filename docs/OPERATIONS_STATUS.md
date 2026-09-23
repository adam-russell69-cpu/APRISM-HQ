# APRISM HQ Operations Status

Last reviewed: September 23, 2026

## Current operating picture

APRISM HQ is a live operating platform supporting the public website, staff administration, client relationships, property assessments, property records, billing, payments, and the client portal.

## Proof Mode

### Currently visible
- Active clients
- Recurring clients
- Monthly invoiced revenue
- Expected recurring revenue
- Qualified leads
- Completed assessments
- Open accounts receivable
- Cash collected
- Properties under stewardship
- Assessments in progress
- Open service requests
- Priority issues
- Working-capital inputs and reserve targets

### Still to add to the operating scorecard
These metrics should not be derived or estimated until their source data is explicitly captured:

- Lead-to-assessment conversion rate
- Assessment-to-recurring-client conversion rate
- Direct job costs
- Gross margin
- Field hours
- Cash reserve versus target as a dashboard KPI
- Outreach source / partner attribution
- Referral-partner pipeline activity

## Relationship workflow

The Clients & Leads area is the source of truth for:
1. New inquiries
2. Contacted leads
3. Qualified opportunities
4. Assessment scheduling
5. Client-account creation
6. Recurring-client designation
7. Expected monthly recurring value

B2B referral outreach to realtors, builders, property managers, and private-client insurance contacts is not yet represented as a first-class pipeline in APRISM HQ. Add that only when the data model includes named partner contacts, touch dates, next action, source category, and outcome.

## Repository housekeeping

### Keep
- `src/` application code
- `supabase/` migrations and database tests
- `docs/` current operating documentation
- `public/documents/` client-facing documents
- `private-documents/` staff-only assessment templates

### Legacy reference material
The root-level `APRISM_01_...` through `APRISM_06_...` PDFs are legacy planning artifacts. They are retained for reference but are not the current source of truth.

### Avoid
- New loose documents at repository root
- Duplicate assessment templates
- Demo/test records in production data
- Parallel sources of pricing or service definitions

## Cleanup completed in this branch

- Reordered admin navigation around daily operating workflow
- Added relationship metrics to Clients & Leads
- Added recurring-client and expected-MRR visibility to the client table
- Refreshed the README to describe the live operating platform
- Refreshed the route inventory
- Documented missing Proof Mode metrics instead of displaying guessed values

## Next build priorities

1. Add referral/outreach partner pipeline
2. Add job-cost and field-time capture
3. Calculate gross margin from actual captured costs
4. Add conversion-rate metrics
5. Add cash-reserve status directly to Proof Mode
6. Continue production-data cleanup after records are reviewed
