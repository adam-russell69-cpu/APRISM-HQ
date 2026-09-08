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
| `property_assessments` | Write-only public intake plus staff-only field notes, findings, report drafts, and stewardship recommendations |
| `client_accounts` | Shared billing/customer abstraction for private and business relationships |
| `client_account_members` | Explicit user-to-account authorization and account role |
| `business_locations` | Business service locations, optionally linked to a property |
| `work_orders` | Account-level work that may reference a business location, property, both, or neither |
| `invoices` | Private/business invoice header, exact totals, terms, document reference, and external IDs |
| `invoice_items` | Quantity, unit, unit price, generated exact amount, service date, and optional work order |
| `payments` | Non-sensitive payment ledger updated from verified providers |
| `stripe_events` | Server-only idempotency ledger for verified event IDs |

All application primary keys are UUIDs. All mutable records include `created_at` and `updated_at` timestamps. Foreign keys and high-value property/status/date lookups are indexed. Money uses `numeric`, never floating point; invoice item amounts are generated from quantity and unit price, and triggers recalculate invoice subtotal, total, paid amount, balance, and derived payment status.

## Client account model

`client_accounts` is the shared parent for billing. Existing properties are backfilled one-to-one into private accounts, and their `property_members` rows are copied to `client_account_members`. The original property authorization remains in place for backward compatibility. New account membership policies also allow an explicitly authorized account member to reach property records assigned to that same account.

Business accounts can contain several `business_locations`. A location can point at an existing `properties` row owned by a different private account, but the work order and invoice continue to belong to the hiring company account. That link never grants the business user access to the owner’s property portal; property access still requires its own explicit membership. Cross-row validation keeps locations, work orders, invoices, items, and payments aligned to the correct billing account while allowing this intentional business-to-managed-property boundary.

Mountain Time Homes is represented in `supabase/seed.sql` as a development-only business account with two redacted locations, two work orders, and one clearly marked demo invoice. The seed creates no payments. A test Auth user must be linked explicitly through `client_account_members` before exercising the live portal.

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
- Public intake submissions may insert only a constrained `intake_received` assessment row with every internal field empty. A server-generated receipt token allows the anonymous submission request to return only its new UUID for five minutes; no intake data or internal assessment columns are granted for public reads.
- Active APRISM staff can select, insert, update, and delete assessment records. The UPDATE policy includes both `USING` and `WITH CHECK`.
- Client property membership does not expose assessment field notes or draft reports. A future published view must explicitly select client-safe fields.
- The profile update policy includes both `USING` and `WITH CHECK`.
- No policy uses `user_metadata`, `raw_user_meta_data`, or a client-controlled role claim.
- No application code or environment template contains a real service-role or Supabase secret value.
- Account members can select only rows connected to their active `client_account_members` record. They receive no direct billing mutation policy.
- Staff mutation policies include both `USING` and `WITH CHECK` for update-capable policies. General billing operations use `is_aprism_staff()`; account-membership changes require `is_aprism_admin()`.
- `stripe_events` has RLS enabled and no anonymous or authenticated policies.
- The Stripe event RPC is `SECURITY INVOKER`, revoked from anonymous/authenticated roles, and granted only to `service_role`.
- The server-only Supabase secret is never exposed under `NEXT_PUBLIC_*` and is used only after route-level authorization or Stripe signature verification.

`property_members` remains a source of truth for legacy property-level access. `client_account_members` is the source of truth for shared account and billing access. `staff_users` is the separate source of truth for company operations access. None of these authorization tables is writable by ordinary client accounts, and no role decision uses user-editable metadata.

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

The pgTAP contracts in `supabase/tests/database/001_rls_contract.test.sql` and `002_billing_rls_contract.test.sql` check the property/account policies, secret-only Stripe RPC, exact invoice balance calculation, and event/PaymentIntent idempotency.

Before production, add integration tests using two real Auth users and two properties to prove both positive access and cross-property denial through the Supabase Data API.

## Storage

The `documents` table stores metadata and an object path only. The billing migration provisions a private `invoice-documents` bucket. Invoice PDFs are returned through a server route that first performs an RLS-authorized invoice lookup and then issues a 60-second signed download URL with the server-only secret. Do not make client documents public.
