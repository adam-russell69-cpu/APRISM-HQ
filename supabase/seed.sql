-- Development-only pilot records. No payment rows are seeded.
-- Link a real auth user to the Mountain Time Homes account separately through
-- client_account_members when validating the live portal locally.

insert into public.client_accounts (
  id,
  account_type,
  display_name,
  legal_name,
  email,
  phone,
  billing_email,
  billing_address,
  payment_terms_days,
  status
) values (
  '40000000-0000-4000-8000-000000000001',
  'business',
  'Mountain Time Homes',
  'Mountain Time Homes',
  'operations@example.invalid',
  null,
  'billing@example.invalid',
  '{"city":"Park City","state":"UT","postal_code":"84060"}'::jsonb,
  15,
  'active'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  legal_name = excluded.legal_name,
  payment_terms_days = excluded.payment_terms_days,
  status = excluded.status;

insert into public.business_locations (
  id,
  client_account_id,
  location_name,
  address_line_1,
  city,
  state,
  postal_code,
  notes,
  active
) values
  (
    '41000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    'Deer Valley Residence',
    null,
    'Park City',
    'UT',
    '84060',
    'Development demo location; street and resident details intentionally omitted.',
    true
  ),
  (
    '41000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    'Old Town Residence',
    null,
    'Park City',
    'UT',
    '84060',
    'Development demo location; street and resident details intentionally omitted.',
    true
  )
on conflict (id) do update set
  location_name = excluded.location_name,
  notes = excluded.notes,
  active = excluded.active;

insert into public.work_orders (
  id,
  client_account_id,
  business_location_id,
  title,
  description,
  status,
  priority,
  scheduled_at,
  completed_at,
  notes
) values
  (
    '42000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001',
    'Arrival preparation and property systems check',
    'Prepare the managed residence for arrival and verify priority systems.',
    'invoiced',
    'priority',
    '2026-08-28 15:00:00+00',
    '2026-08-28 18:15:00+00',
    'Development demo work order. No tenant or resident information is included.'
  ),
  (
    '42000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000002',
    'Seasonal exterior readiness review',
    'Review exterior access, drainage, and pre-winter readiness items.',
    'scheduled',
    'routine',
    '2026-09-10 16:00:00+00',
    null,
    'Development demo work order.'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  scheduled_at = excluded.scheduled_at,
  completed_at = excluded.completed_at;

insert into public.invoices (
  id,
  client_account_id,
  work_order_id,
  invoice_number,
  status,
  issue_date,
  due_date,
  tax,
  currency,
  payment_terms_days,
  notes
) values (
  '43000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001',
  'DEMO-MTH-2026-001',
  'sent',
  '2026-09-01',
  '2026-09-16',
  68.00,
  'USD',
  15,
  'DEVELOPMENT DEMO — not a request for payment.'
)
on conflict (id) do update set
  status = excluded.status,
  issue_date = excluded.issue_date,
  due_date = excluded.due_date,
  tax = excluded.tax,
  payment_terms_days = excluded.payment_terms_days,
  notes = excluded.notes;

insert into public.invoice_items (
  id,
  invoice_id,
  description,
  quantity,
  unit,
  unit_price,
  service_date,
  work_order_id
) values
  (
    '44000000-0000-4000-8000-000000000001',
    '43000000-0000-4000-8000-000000000001',
    'Property stewardship and arrival preparation',
    2.5,
    'hour',
    185.00,
    '2026-08-28',
    '42000000-0000-4000-8000-000000000001'
  ),
  (
    '44000000-0000-4000-8000-000000000002',
    '43000000-0000-4000-8000-000000000001',
    'Whole-property systems and access check',
    1,
    'service',
    325.00,
    '2026-08-28',
    '42000000-0000-4000-8000-000000000001'
  ),
  (
    '44000000-0000-4000-8000-000000000003',
    '43000000-0000-4000-8000-000000000001',
    'Guest-readiness supplies and coordination',
    1,
    'allowance',
    150.00,
    '2026-08-28',
    '42000000-0000-4000-8000-000000000001'
  )
on conflict (id) do update set
  description = excluded.description,
  quantity = excluded.quantity,
  unit = excluded.unit,
  unit_price = excluded.unit_price,
  service_date = excluded.service_date,
  work_order_id = excluded.work_order_id;

select public.recalculate_invoice_balance('43000000-0000-4000-8000-000000000001');
