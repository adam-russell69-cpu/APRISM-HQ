-- Unified private/business client accounts, work orders, invoicing, and payments.
-- Existing property memberships remain valid and are backfilled into private accounts.

create table public.client_accounts (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('private', 'business')),
  display_name text not null,
  legal_name text,
  email text,
  phone text,
  billing_email text,
  billing_address jsonb not null default '{}'::jsonb check (jsonb_typeof(billing_address) = 'object'),
  payment_terms_days integer not null default 15 check (payment_terms_days between 0 and 365),
  status text not null default 'active' check (status in ('prospect', 'active', 'inactive')),
  stripe_customer_id text unique,
  quickbooks_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_account_members (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'manager', 'billing', 'member')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_account_id, user_id)
);

alter table public.properties
  add column client_account_id uuid references public.client_accounts(id) on delete restrict;

-- One private account per existing property keeps the current property-level authorization intact.
insert into public.client_accounts (id, account_type, display_name, legal_name, status, created_at, updated_at)
select p.id, 'private', p.name, p.name, 'active', p.created_at, p.updated_at
from public.properties p
on conflict (id) do nothing;

update public.properties
set client_account_id = id
where client_account_id is null;

insert into public.client_account_members (client_account_id, user_id, role, created_at, updated_at)
select
  pm.property_id,
  pm.user_id,
  case pm.role when 'owner' then 'owner' when 'steward' then 'manager' else 'member' end,
  pm.created_at,
  pm.updated_at
from public.property_members pm
on conflict (client_account_id, user_id) do nothing;

create table public.business_locations (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  location_name text not null,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_account_id, location_name)
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  business_location_id uuid references public.business_locations(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled', 'invoiced')),
  priority text not null default 'routine' check (priority in ('routine', 'priority', 'urgent')),
  requested_by uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  notes text,
  quickbooks_item_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  work_order_id uuid references public.work_orders(id) on delete set null,
  invoice_number text not null unique check (invoice_number ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  status text not null default 'draft' check (status in ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void', 'cancelled')),
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  amount_due numeric(12,2) not null default 0 check (amount_due >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  payment_terms_days integer not null default 15 check (payment_terms_days between 0 and 365),
  notes text,
  pdf_storage_path text,
  stripe_customer_id text,
  stripe_invoice_id text unique,
  stripe_payment_link_id text unique,
  stripe_checkout_session_id text,
  quickbooks_invoice_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= issue_date)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit text not null default 'each',
  unit_price numeric(12,2) not null check (unit_price >= 0),
  amount numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  service_date date,
  work_order_id uuid references public.work_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  payment_method text not null check (payment_method in ('ach', 'card', 'other')),
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  quickbooks_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Server-only ledger of verified Stripe deliveries. Raw event payloads are intentionally not stored.
create table public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  object_id text,
  processing_status text not null default 'processing' check (processing_status in ('processing', 'processed', 'ignored')),
  stripe_created_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Foreign-key and tenant-filter indexes.
create index properties_client_account_id_idx on public.properties (client_account_id);
create index client_account_members_user_id_idx on public.client_account_members (user_id);
create index business_locations_client_account_id_idx on public.business_locations (client_account_id);
create index business_locations_property_id_idx on public.business_locations (property_id);
create index work_orders_account_status_idx on public.work_orders (client_account_id, status);
create index work_orders_business_location_id_idx on public.work_orders (business_location_id);
create index work_orders_property_id_idx on public.work_orders (property_id);
create index work_orders_requested_by_idx on public.work_orders (requested_by);
create index work_orders_assigned_to_idx on public.work_orders (assigned_to);
create index invoices_account_status_due_idx on public.invoices (client_account_id, status, due_date);
create index invoices_work_order_id_idx on public.invoices (work_order_id);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index invoice_items_work_order_id_idx on public.invoice_items (work_order_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_client_account_id_idx on public.payments (client_account_id);
create index stripe_events_type_object_idx on public.stripe_events (event_type, object_id);

create trigger client_accounts_set_updated_at before update on public.client_accounts for each row execute function public.set_updated_at();
create trigger client_account_members_set_updated_at before update on public.client_account_members for each row execute function public.set_updated_at();
create trigger business_locations_set_updated_at before update on public.business_locations for each row execute function public.set_updated_at();
create trigger work_orders_set_updated_at before update on public.work_orders for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger invoice_items_set_updated_at before update on public.invoice_items for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();

-- Cross-row tenant guards keep billing records aligned while allowing an intentional
-- business-account link to a separately authorized managed property.
create or replace function public.validate_business_location_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_account_type text;
begin
  select account_type into linked_account_type
  from public.client_accounts
  where id = new.client_account_id;

  if linked_account_type is distinct from 'business' then
    raise exception 'Business locations require a business client account';
  end if;

  return new;
end;
$$;

create or replace function public.validate_work_order_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_account_id uuid;
  location_property_id uuid;
  work_order_account_type text;
begin
  select account_type into work_order_account_type
  from public.client_accounts
  where id = new.client_account_id;

  if new.business_location_id is not null then
    select client_account_id, property_id into linked_account_id, location_property_id
    from public.business_locations
    where id = new.business_location_id;

    if linked_account_id is distinct from new.client_account_id then
      raise exception 'Work order location must belong to the same client account';
    end if;

    if new.property_id is not null and location_property_id is not null and new.property_id <> location_property_id then
      raise exception 'Work order property must match the linked business location property';
    end if;
  end if;

  if new.property_id is not null then
    select client_account_id into linked_account_id
    from public.properties
    where id = new.property_id;

    -- A business can be billed for work at a separately owned APRISM property.
    -- Private-account work orders remain confined to their own property account.
    if work_order_account_type = 'private'
      and linked_account_id is distinct from new.client_account_id then
      raise exception 'Private work order property must belong to the same client account';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.validate_invoice_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_account_id uuid;
begin
  if new.work_order_id is not null then
    select client_account_id into linked_account_id
    from public.work_orders
    where id = new.work_order_id;

    if linked_account_id is distinct from new.client_account_id then
      raise exception 'Invoice work order must belong to the same client account';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.validate_invoice_item_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invoice_account_id uuid;
  work_order_account_id uuid;
begin
  if new.work_order_id is null then
    return new;
  end if;

  select client_account_id into invoice_account_id from public.invoices where id = new.invoice_id;
  select client_account_id into work_order_account_id from public.work_orders where id = new.work_order_id;

  if invoice_account_id is distinct from work_order_account_id then
    raise exception 'Invoice item work order must belong to the invoice client account';
  end if;

  return new;
end;
$$;

create or replace function public.validate_payment_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invoice_account_id uuid;
  invoice_currency text;
begin
  select client_account_id, currency into invoice_account_id, invoice_currency
  from public.invoices
  where id = new.invoice_id;

  if invoice_account_id is distinct from new.client_account_id then
    raise exception 'Payment must belong to the invoice client account';
  end if;

  if invoice_currency is distinct from new.currency then
    raise exception 'Payment currency must match the invoice currency';
  end if;

  return new;
end;
$$;

create trigger business_locations_validate_account before insert or update on public.business_locations for each row execute function public.validate_business_location_account();
create trigger work_orders_validate_account before insert or update on public.work_orders for each row execute function public.validate_work_order_account();
create trigger invoices_validate_account before insert or update on public.invoices for each row execute function public.validate_invoice_account();
create trigger invoice_items_validate_account before insert or update on public.invoice_items for each row execute function public.validate_invoice_item_account();
create trigger payments_validate_account before insert or update on public.payments for each row execute function public.validate_payment_account();

create or replace function public.recalculate_invoice_balance(target_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  calculated_subtotal numeric(12,2);
  calculated_paid numeric(12,2);
  calculated_total numeric(12,2);
  calculated_due numeric(12,2);
begin
  select coalesce(sum(amount), 0)::numeric(12,2)
  into calculated_subtotal
  from public.invoice_items
  where invoice_id = target_invoice_id;

  select coalesce(sum(amount), 0)::numeric(12,2)
  into calculated_paid
  from public.payments
  where invoice_id = target_invoice_id
    and status = 'succeeded';

  select (calculated_subtotal + tax)::numeric(12,2)
  into calculated_total
  from public.invoices
  where id = target_invoice_id;

  if not found then
    return;
  end if;

  calculated_due := greatest(calculated_total - calculated_paid, 0)::numeric(12,2);

  update public.invoices
  set
    subtotal = calculated_subtotal,
    total = calculated_total,
    amount_paid = calculated_paid,
    amount_due = calculated_due,
    status = case
      when status in ('draft', 'void', 'cancelled') then status
      when calculated_total > 0 and calculated_due = 0 then 'paid'
      when calculated_paid > 0 then 'partially_paid'
      when due_date < current_date then 'overdue'
      when status in ('paid', 'partially_paid', 'overdue') then 'sent'
      else status
    end
  where id = target_invoice_id;
end;
$$;

create or replace function public.recalculate_invoice_from_child()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_invoice_balance(old.invoice_id);
    return old;
  end if;

  perform public.recalculate_invoice_balance(new.invoice_id);
  return new;
end;
$$;

create trigger invoice_items_recalculate_invoice
after insert or update or delete on public.invoice_items
for each row execute function public.recalculate_invoice_from_child();

create trigger payments_recalculate_invoice
after insert or update or delete on public.payments
for each row execute function public.recalculate_invoice_from_child();

-- Called only with the server-side Supabase secret after Stripe signature verification.
-- The event log, payment upsert, and invoice recalculation commit as one transaction.
create or replace function public.process_stripe_payment_event(
  p_stripe_event_id text,
  p_stripe_event_type text,
  p_stripe_object_id text,
  p_stripe_created_at timestamptz,
  p_target_invoice_id uuid,
  p_payment_intent_id text,
  p_charge_id text,
  p_payment_amount numeric,
  p_payment_currency text,
  p_payment_method text,
  p_payment_status text,
  p_payment_paid_at timestamptz
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  event_row_id uuid;
  target_account_id uuid;
begin
  if p_payment_method not in ('ach', 'card', 'other') then
    raise exception 'Unsupported payment method';
  end if;

  if p_payment_status not in ('pending', 'succeeded', 'failed', 'refunded', 'cancelled') then
    raise exception 'Unsupported payment status';
  end if;

  insert into public.stripe_events (
    stripe_event_id, event_type, object_id, stripe_created_at
  ) values (
    p_stripe_event_id, p_stripe_event_type, p_stripe_object_id, p_stripe_created_at
  )
  on conflict (stripe_event_id) do nothing
  returning id into event_row_id;

  if event_row_id is null then
    return 'duplicate';
  end if;

  if p_target_invoice_id is null or p_payment_intent_id is null then
    update public.stripe_events
    set processing_status = 'ignored', processed_at = now()
    where id = event_row_id;
    return 'ignored';
  end if;

  select client_account_id into target_account_id
  from public.invoices
  where id = p_target_invoice_id;

  if target_account_id is null then
    raise exception 'Stripe event references an unknown invoice';
  end if;

  insert into public.payments (
    invoice_id,
    client_account_id,
    amount,
    currency,
    payment_method,
    status,
    stripe_payment_intent_id,
    stripe_charge_id,
    paid_at
  ) values (
    p_target_invoice_id,
    target_account_id,
    p_payment_amount,
    upper(p_payment_currency),
    p_payment_method,
    p_payment_status,
    p_payment_intent_id,
    p_charge_id,
    p_payment_paid_at
  )
  on conflict (stripe_payment_intent_id) do update
  set
    amount = excluded.amount,
    currency = excluded.currency,
    payment_method = excluded.payment_method,
    stripe_charge_id = coalesce(excluded.stripe_charge_id, public.payments.stripe_charge_id),
    status = case
      when public.payments.status = 'refunded' or excluded.status = 'refunded' then 'refunded'
      when public.payments.status = 'succeeded' then 'succeeded'
      when excluded.status = 'succeeded' then 'succeeded'
      else excluded.status
    end,
    paid_at = coalesce(excluded.paid_at, public.payments.paid_at);

  update public.stripe_events
  set processing_status = 'processed', processed_at = now()
  where id = event_row_id;

  return 'processed';
end;
$$;

-- RLS and least-privilege grants for every new exposed table.
alter table public.client_accounts enable row level security;
alter table public.client_account_members enable row level security;
alter table public.business_locations enable row level security;
alter table public.work_orders enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.stripe_events enable row level security;

revoke all on table public.client_accounts, public.client_account_members,
  public.business_locations, public.work_orders, public.invoices,
  public.invoice_items, public.payments, public.stripe_events
from anon, authenticated;

grant select on table public.client_accounts, public.client_account_members,
  public.business_locations, public.work_orders, public.invoices,
  public.invoice_items, public.payments
to authenticated;

grant insert, update, delete on table public.client_accounts, public.client_account_members,
  public.business_locations, public.work_orders, public.invoices,
  public.invoice_items, public.payments
to authenticated;

grant select, insert, update, delete on table public.client_accounts, public.client_account_members,
  public.business_locations, public.work_orders, public.invoices,
  public.invoice_items, public.payments, public.stripe_events
to service_role;

grant execute on function public.set_updated_at() to service_role;

create policy "client_accounts_member_select" on public.client_accounts for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = client_accounts.id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "client_accounts_staff_manage" on public.client_accounts for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

create policy "client_account_members_select_own" on public.client_account_members for select to authenticated
  using (user_id = (select auth.uid()) and active);
create policy "client_account_members_admin_manage" on public.client_account_members for all to authenticated
  using ((select public.is_aprism_admin()))
  with check ((select public.is_aprism_admin()));

create policy "business_locations_member_select" on public.business_locations for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = business_locations.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "business_locations_staff_manage" on public.business_locations for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

create policy "work_orders_member_select" on public.work_orders for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = work_orders.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "work_orders_staff_manage" on public.work_orders for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

create policy "invoices_member_select" on public.invoices for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = invoices.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "invoices_staff_manage" on public.invoices for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

create policy "invoice_items_member_select" on public.invoice_items for select to authenticated
  using (exists (
    select 1
    from public.invoices i
    join public.client_account_members cam on cam.client_account_id = i.client_account_id
    where i.id = invoice_items.invoice_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "invoice_items_staff_manage" on public.invoice_items for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

create policy "payments_member_select" on public.payments for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = payments.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "payments_staff_manage" on public.payments for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));

-- Account memberships extend the existing property portal without replacing property_members.
create policy "properties_select_account_member" on public.properties for select to authenticated
  using (exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = properties.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "property_systems_select_account_member" on public.property_systems for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = property_systems.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "inspections_select_account_member" on public.inspections for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = inspections.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "inspection_items_select_account_member" on public.inspection_items for select to authenticated
  using (exists (
    select 1
    from public.inspections i
    join public.properties p on p.id = i.property_id
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where i.id = inspection_items.inspection_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "maintenance_tasks_select_account_member" on public.maintenance_tasks for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = maintenance_tasks.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "issues_select_account_member" on public.issues for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = issues.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "service_requests_select_account_member" on public.service_requests for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = service_requests.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "documents_select_account_member" on public.documents for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = documents.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "property_vendors_select_account_member" on public.property_vendors for select to authenticated
  using (exists (
    select 1 from public.properties p
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where p.id = property_vendors.property_id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));
create policy "vendors_select_account_property" on public.vendors for select to authenticated
  using (exists (
    select 1
    from public.property_vendors pv
    join public.properties p on p.id = pv.property_id
    join public.client_account_members cam on cam.client_account_id = p.client_account_id
    where pv.vendor_id = vendors.id
      and cam.user_id = (select auth.uid())
      and cam.active
  ));

-- Trigger/RPC functions are not client APIs. Trigger invocation does not require a
-- Data API execute grant; only the server-side service role may invoke helpers directly.
revoke execute on function public.validate_business_location_account() from public, anon, authenticated;
revoke execute on function public.validate_work_order_account() from public, anon, authenticated;
revoke execute on function public.validate_invoice_account() from public, anon, authenticated;
revoke execute on function public.validate_invoice_item_account() from public, anon, authenticated;
revoke execute on function public.validate_payment_account() from public, anon, authenticated;
revoke execute on function public.recalculate_invoice_balance(uuid) from public, anon, authenticated;
revoke execute on function public.recalculate_invoice_from_child() from public, anon, authenticated;
revoke execute on function public.process_stripe_payment_event(text, text, text, timestamptz, uuid, text, text, numeric, text, text, text, timestamptz) from public, anon, authenticated;

grant execute on function public.validate_business_location_account() to service_role;
grant execute on function public.validate_work_order_account() to service_role;
grant execute on function public.validate_invoice_account() to service_role;
grant execute on function public.validate_invoice_item_account() to service_role;
grant execute on function public.validate_payment_account() to service_role;
grant execute on function public.recalculate_invoice_balance(uuid) to service_role;
grant execute on function public.recalculate_invoice_from_child() to service_role;
grant execute on function public.process_stripe_payment_event(text, text, text, timestamptz, uuid, text, text, numeric, text, text, text, timestamptz) to service_role;

-- Private bucket. Clients receive short-lived signed URLs only after an RLS-authorized invoice lookup.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoice-documents', 'invoice-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
