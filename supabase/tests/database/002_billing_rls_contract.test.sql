begin;

create extension if not exists pgtap with schema extensions;
select plan(21);

select extensions.is(
  (
    select count(*)::integer
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any(array[
        'client_accounts', 'client_account_members', 'business_locations',
        'work_orders', 'invoices', 'invoice_items', 'payments', 'stripe_events'
      ])
      and c.relrowsecurity
  ),
  8,
  'RLS is enabled on every billing table'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'client_accounts', 'client_account_members', 'business_locations',
        'work_orders', 'invoices', 'invoice_items', 'payments', 'stripe_events'
      ])
      and 'anon' = any(roles)
  ),
  'No billing policy grants anonymous access'
);

select extensions.ok(
  not exists (
    select 1
    from (values
      ('client_accounts'), ('business_locations'), ('work_orders'),
      ('invoices'), ('invoice_items'), ('payments')
    ) as member_table(table_name)
    where not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public'
        and p.tablename = member_table.table_name
        and p.cmd = 'SELECT'
        and 'authenticated' = any(p.roles)
        and p.qual ilike '%auth.uid%'
        and p.qual ilike '%client_account_members%'
    )
  ),
  'Every client-facing billing table has an account-member select policy'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any(array[
        'client_accounts', 'client_account_members', 'business_locations',
        'work_orders', 'invoices', 'invoice_items', 'payments', 'stripe_events'
      ])
      and 'authenticated' = any(p.roles)
      and p.cmd in ('SELECT', 'ALL')
      and (p.qual is null or lower(regexp_replace(p.qual, '\s', '', 'g')) in ('true', '(true)'))
  ),
  'No authenticated billing read policy is unrestricted'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any(array[
        'client_accounts', 'client_account_members', 'business_locations',
        'work_orders', 'invoices', 'invoice_items', 'payments'
      ])
      and 'authenticated' = any(p.roles)
      and p.cmd in ('UPDATE', 'ALL')
      and (p.qual is null or p.with_check is null)
  ),
  'Every authenticated billing update policy has USING and WITH CHECK'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any(array[
        'client_accounts', 'client_account_members', 'business_locations',
        'work_orders', 'invoices', 'invoice_items', 'payments'
      ])
      and 'authenticated' = any(p.roles)
      and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and coalesce(p.qual, p.with_check, '') !~* 'is_aprism_(staff|admin)'
  ),
  'Authenticated billing mutations are restricted to APRISM staff'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stripe_events'
      and ('anon' = any(roles) or 'authenticated' = any(roles))
  ),
  'Stripe event ledger has no client API policy'
);

select extensions.ok(
  not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'process_stripe_payment_event'
      and p.prosecdef
  ),
  'Stripe event processor is security invoker'
);

select extensions.ok(
  not has_function_privilege(
    'authenticated',
    'public.process_stripe_payment_event(text,text,text,timestamptz,uuid,text,text,numeric,text,text,text,timestamptz)',
    'EXECUTE'
  ),
  'Authenticated users cannot execute the Stripe event processor'
);

select extensions.ok(
  has_function_privilege(
    'service_role',
    'public.process_stripe_payment_event(text,text,text,timestamptz,uuid,text,text,numeric,text,text,text,timestamptz)',
    'EXECUTE'
  ),
  'Server-side service role can execute the Stripe event processor'
);

select extensions.ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(array[
        'validate_business_location_account', 'validate_work_order_account',
        'validate_invoice_account', 'validate_invoice_item_account',
        'validate_payment_account', 'recalculate_invoice_balance',
        'recalculate_invoice_from_child'
      ])
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ),
  'Authenticated users cannot invoke billing trigger helpers as RPCs'
);

select extensions.ok(
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name ~* '(card_number|cvv|cvc|bank_account|routing_number)'
  ),
  'Payment records contain no raw payment credential columns'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('invoices', 'invoice_items', 'payments')
      and column_name in ('subtotal', 'tax', 'total', 'amount_paid', 'amount_due', 'quantity', 'unit_price', 'amount')
      and data_type = 'numeric'
  ),
  9,
  'All invoice and payment amount columns use exact numeric types'
);

select extensions.is(
  (
    select count(*)::integer from information_schema.triggers
    where trigger_schema = 'public'
      and trigger_name = any(array[
        'business_locations_validate_account', 'work_orders_validate_account',
        'invoices_validate_account', 'invoice_items_validate_account',
        'payments_validate_account'
      ])
  ),
  5,
  'Cross-account relationship guards are installed'
);

select extensions.ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'client_account_members'
      and indexdef ilike '%(user_id)%'
  ),
  'Account membership lookups by user are indexed'
);

insert into public.client_accounts (id, account_type, display_name)
values
  ('50000000-0000-4000-8000-000000000001', 'business', 'Billing Test Account'),
  ('50000000-0000-4000-8000-000000000002', 'private', 'Separate Property Owner');

insert into public.properties (
  id, client_account_id, name, address_line_1, property_type
) values (
  '50000000-0000-4000-8000-000000000003',
  '50000000-0000-4000-8000-000000000002',
  'Managed Test Property',
  'Redacted',
  'residential'
);

select extensions.lives_ok(
  $$
    insert into public.business_locations (
      id, client_account_id, property_id, location_name
    ) values (
      '50000000-0000-4000-8000-000000000004',
      '50000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000003',
      'Business-managed location'
    )
  $$,
  'A business billing account may reference a separately owned APRISM property'
);

insert into public.invoices (
  id, client_account_id, invoice_number, status, issue_date, due_date, tax
) values (
  '51000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  'TEST-ACCOUNT-001',
  'sent',
  current_date,
  current_date + 15,
  5.50
);

insert into public.invoice_items (invoice_id, description, quantity, unit, unit_price)
values
  ('51000000-0000-4000-8000-000000000001', 'Service', 2, 'hour', 50.00),
  ('51000000-0000-4000-8000-000000000001', 'Materials', 1, 'allowance', 20.00);

select extensions.is(
  (select concat_ws('|', subtotal, total, amount_due) from public.invoices where id = '51000000-0000-4000-8000-000000000001'),
  '120.00|125.50|125.50',
  'Invoice totals are recalculated from exact line-item amounts'
);

select extensions.is(
  public.process_stripe_payment_event(
    'evt_aprism_test_001', 'payment_intent.succeeded', 'pi_aprism_test_001', now(),
    '51000000-0000-4000-8000-000000000001', 'pi_aprism_test_001', 'ch_aprism_test_001',
    125.50, 'USD', 'ach', 'succeeded', now()
  ),
  'processed',
  'First verified Stripe event is processed'
);

select extensions.is(
  public.process_stripe_payment_event(
    'evt_aprism_test_001', 'payment_intent.succeeded', 'pi_aprism_test_001', now(),
    '51000000-0000-4000-8000-000000000001', 'pi_aprism_test_001', 'ch_aprism_test_001',
    125.50, 'USD', 'ach', 'succeeded', now()
  ),
  'duplicate',
  'Duplicate Stripe event IDs are ignored'
);

select extensions.is(
  (select count(*)::integer from public.payments where stripe_payment_intent_id = 'pi_aprism_test_001'),
  1,
  'A Stripe PaymentIntent creates at most one payment row'
);

select extensions.is(
  (select concat_ws('|', status, amount_paid, amount_due) from public.invoices where id = '51000000-0000-4000-8000-000000000001'),
  'paid|125.50|0.00',
  'A successful verified payment updates invoice balance and status'
);

select * from extensions.finish();
rollback;
