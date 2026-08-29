# Database and Security Model

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Client contact preferences, keyed to `auth.users.id` |
| `properties` | Property identity, location, occupancy, size, and current health |
| `property_members` | Explicit user-to-property authorization and role |
| `property_systems` | HVAC, water, automation, exterior, and other tracked systems |
| `inspections` | Scheduled/completed property inspections |
| `inspection_items` | Individual observations, recommendations, and photo paths |
| `maintenance_tasks` | Planned, scheduled, recurring, and completed maintenance |
| `issues` | Condition changes and resolution workflow |
| `service_requests` | Client-originated requests |
| `documents` | Metadata for property files stored outside the table |
| `vendors` | Approved vendor directory |
| `property_vendors` | Property-specific vendor relationships and preferred scope |
| `inquiries` | Write-only public property-assessment requests for APRISM review |
| `staff_users` | Company-level owner/admin/steward authorization, keyed to `auth.users.id` |

All application primary keys are UUIDs. All mutable records include `created_at` and `updated_at` timestamps. Foreign keys and high-value property/status/date lookups are indexed.

## Property Health

The schema constrains health fields to `Healthy`, `Monitor`, `Action Recommended`, and `Critical`.

## Authorization contract

- Every application table in `public` has RLS enabled.
- `anon` receives no property or portal privileges. It may insert only validated columns into `inquiries` and cannot read, update, or delete those records.
- `authenticated` receives read privileges, but policies limit results to explicit property membership.
- Client users can insert only their own profile and their own service requests for properties where they are members.
- Clients cannot create, update, or delete `property_members`.
- Clients cannot create, update, or delete `staff_users`; authenticated users can read only their own staff assignment.
- Active APRISM staff can operate property records, while only owner/admin roles can manage property membership.
- APRISM staff can read and update inquiry workflow status; anonymous visitors remain unable to read inquiries.
- The profile update policy includes both `USING` and `WITH CHECK`.
- No policy uses `user_metadata`, `raw_user_meta_data`, or a client-controlled role claim.
- No application code or environment template contains a service-role secret.

`property_members` remains the source of truth for client-to-property access. `staff_users` is the separate source of truth for company operations access. Neither authorization table is writable by ordinary client accounts, and no role decision uses user-editable metadata.

## Applying the schema

```bash
supabase link --project-ref <aprism-project-ref>
supabase db push
supabase db advisors
```

For local testing:

```bash
supabase start
supabase db reset
supabase test db
```

The pgTAP contract in `supabase/tests/database/001_rls_contract.test.sql` checks the property-data RLS contract. The inquiry migration adds a deliberately narrow anonymous insert policy with no anonymous read access.

Before production, add integration tests using two real Auth users and two properties to prove both positive access and cross-property denial through the Supabase Data API.

## Storage

The `documents` table stores metadata and an object path only. Create a private Supabase Storage bucket before live uploads. Storage policies must derive property access from the same membership model and support every operation the product enables. Do not make client documents public.
