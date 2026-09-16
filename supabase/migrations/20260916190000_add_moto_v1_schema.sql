-- APRISM HQ Moto V1.
-- Every operational row is tenant-scoped by organization_id + business_unit_id.
-- Cross-table composite foreign keys prevent records from being attached across tenants.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Bootstrap the current APRISM staff into the first tenant. This is intentionally
-- data-driven rather than hard-coding a user UUID.
insert into public.organizations (name, slug)
values ('APRISM LLC', 'aprism')
on conflict (slug) do nothing;

insert into public.business_units (organization_id, name, slug)
select id, 'Outpost Moto', 'moto'
from public.organizations where slug = 'aprism'
on conflict (organization_id, slug) do nothing;

insert into public.organization_members (organization_id, user_id, role, active)
select o.id, s.user_id,
  case when s.role = 'owner' then 'owner' when s.role = 'admin' then 'admin' else 'staff' end,
  s.active
from public.organizations o
join public.staff_users s on true
where o.slug = 'aprism'
on conflict (organization_id, user_id) do update
set role = excluded.role, active = excluded.active;

create or replace function public.has_tenant_access(p_organization_id uuid, p_business_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.business_units bu
      on bu.organization_id = om.organization_id
     and bu.id = p_business_unit_id
     and bu.active
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
      and om.active
  );
$$;

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  vin text not null check (length(vin) between 5 and 32),
  year integer not null check (year between 1900 and 2200),
  make text not null,
  model text not null,
  trim text,
  engine text,
  color text,
  license_plate text,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  front_tire_size text,
  rear_tire_size text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_unit_id, organization_id) references public.business_units(id, organization_id) on delete restrict,
  unique (organization_id, business_unit_id, vin),
  unique (id, organization_id, business_unit_id)
);

create table public.repair_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  motorcycle_id uuid not null,
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  technician_id uuid not null references auth.users(id) on delete restrict,
  ro_number text not null check (ro_number ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  status text not null default 'draft' check (status in ('draft','dropped_off','in_service','waiting_approval','waiting_parts','ready','completed','cancelled')),
  service_name text not null,
  mileage_in integer not null check (mileage_in >= 0),
  mileage_out integer check (mileage_out is null or mileage_out >= mileage_in),
  customer_request text,
  technician_notes text,
  labor_type text not null default 'flat_rate' check (labor_type in ('flat_rate','actual_time')),
  labor_rate numeric(10,2) not null default 0 check (labor_rate >= 0),
  estimated_labor_hours numeric(8,2) not null default 0 check (estimated_labor_hours >= 0),
  actual_labor_hours numeric(8,2) check (actual_labor_hours is null or actual_labor_hours >= 0),
  customer_supplied_fluids boolean not null default false,
  customer_supplied_parts boolean not null default false,
  payment_preference text not null default 'unknown' check (payment_preference in ('cash','card','ach','other','unknown')),
  dropped_off_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_unit_id, organization_id) references public.business_units(id, organization_id) on delete restrict,
  foreign key (motorcycle_id, organization_id, business_unit_id) references public.motorcycles(id, organization_id, business_unit_id) on delete restrict,
  unique (organization_id, business_unit_id, ro_number),
  unique (id, organization_id, business_unit_id)
);

create table public.service_operations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  repair_order_id uuid not null,
  technician_id uuid not null references auth.users(id) on delete restrict,
  category text not null,
  component text not null,
  operation text not null,
  required boolean not null default true,
  status text not null default 'not_started' check (status in ('not_started','in_progress','checked','adjusted','replaced','completed','na')),
  specification text,
  measurements jsonb not null default '[]'::jsonb check (jsonb_typeof(measurements) = 'array'),
  fluid jsonb check (fluid is null or jsonb_typeof(fluid) = 'object'),
  technician_note text,
  media_ids uuid[] not null default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete cascade,
  unique (id, organization_id, business_unit_id)
);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  repair_order_id uuid not null,
  motorcycle_id uuid not null,
  technician_id uuid not null references auth.users(id) on delete restrict,
  category text not null,
  component text not null,
  description text not null,
  severity text not null default 'information' check (severity in ('information','monitor','service_soon','immediate')),
  status text not null default 'open' check (status in ('open','corrected','deferred','converted_to_recommendation')),
  measurement jsonb check (measurement is null or jsonb_typeof(measurement) = 'object'),
  technician_note text,
  customer_visible_note text,
  corrected_during_service boolean not null default false,
  corrective_action text,
  corrected_at timestamptz,
  media_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete cascade,
  foreign key (motorcycle_id, organization_id, business_unit_id) references public.motorcycles(id, organization_id, business_unit_id) on delete restrict,
  unique (id, organization_id, business_unit_id),
  check (not corrected_during_service or (status = 'corrected' and corrective_action is not null and btrim(corrective_action) <> ''))
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  motorcycle_id uuid not null,
  source_repair_order_id uuid not null,
  finding_id uuid,
  component text not null,
  description text not null,
  priority text not null default 'monitor' check (priority in ('monitor','next_service','soon','immediate')),
  status text not null default 'open' check (status in ('open','approved','deferred','completed','declined')),
  created_mileage integer not null check (created_mileage >= 0),
  recommended_by_mileage integer check (recommended_by_mileage is null or recommended_by_mileage >= created_mileage),
  recommended_by_date timestamptz,
  technician_note text,
  customer_visible_note text,
  estimated_labor_hours numeric(8,2) check (estimated_labor_hours is null or estimated_labor_hours >= 0),
  estimated_parts_amount numeric(12,2) check (estimated_parts_amount is null or estimated_parts_amount >= 0),
  media_ids uuid[] not null default '{}',
  completed_repair_order_id uuid,
  completed_mileage integer check (completed_mileage is null or completed_mileage >= created_mileage),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (motorcycle_id, organization_id, business_unit_id) references public.motorcycles(id, organization_id, business_unit_id) on delete cascade,
  foreign key (source_repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete restrict,
  foreign key (finding_id, organization_id, business_unit_id) references public.findings(id, organization_id, business_unit_id) on delete set null,
  foreign key (completed_repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete set null,
  unique (id, organization_id, business_unit_id)
);

create table public.road_tests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  repair_order_id uuid not null,
  technician_id uuid not null references auth.users(id) on delete restrict,
  started_at timestamptz,
  completed_at timestamptz,
  start_mileage integer check (start_mileage is null or start_mileage >= 0),
  end_mileage integer check (end_mileage is null or end_mileage >= start_mileage),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  overall_result text check (overall_result is null or overall_result in ('pass','fail','not_performed')),
  not_performed_reason text,
  technician_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete cascade,
  unique (repair_order_id),
  unique (id, organization_id, business_unit_id),
  check (overall_result <> 'not_performed' or (not_performed_reason is not null and btrim(not_performed_reason) <> ''))
);

create table public.service_history_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  business_unit_id uuid not null,
  motorcycle_id uuid not null,
  repair_order_id uuid,
  event_key text not null,
  event_type text not null check (event_type in ('service','repair','adjustment','finding','recommendation','road_test')),
  event_date timestamptz not null default now(),
  mileage integer not null check (mileage >= 0),
  title text not null,
  summary text,
  source_entity_type text check (source_entity_type is null or source_entity_type in ('repair_order','service_operation','finding','recommendation','road_test')),
  source_entity_id uuid,
  created_at timestamptz not null default now(),
  foreign key (motorcycle_id, organization_id, business_unit_id) references public.motorcycles(id, organization_id, business_unit_id) on delete cascade,
  foreign key (repair_order_id, organization_id, business_unit_id) references public.repair_orders(id, organization_id, business_unit_id) on delete set null,
  constraint service_history_events_event_key_key unique (event_key)
);

create index organization_members_user_idx on public.organization_members (user_id, active);
create index business_units_org_idx on public.business_units (organization_id, active);
create index motorcycles_tenant_customer_idx on public.motorcycles (organization_id, business_unit_id, client_account_id);
create index repair_orders_tenant_status_idx on public.repair_orders (organization_id, business_unit_id, status, created_at desc);
create index repair_orders_motorcycle_idx on public.repair_orders (motorcycle_id, created_at desc);
create index service_operations_ro_idx on public.service_operations (repair_order_id);
create index findings_ro_status_idx on public.findings (repair_order_id, status);
create index recommendations_motorcycle_status_idx on public.recommendations (motorcycle_id, status, priority);
create index road_tests_ro_idx on public.road_tests (repair_order_id);
create index service_history_motorcycle_date_idx on public.service_history_events (motorcycle_id, event_date desc);
create index service_history_ro_idx on public.service_history_events (repair_order_id);

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger business_units_set_updated_at before update on public.business_units for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members for each row execute function public.set_updated_at();
create trigger motorcycles_set_updated_at before update on public.motorcycles for each row execute function public.set_updated_at();
create trigger repair_orders_set_updated_at before update on public.repair_orders for each row execute function public.set_updated_at();
create trigger service_operations_set_updated_at before update on public.service_operations for each row execute function public.set_updated_at();
create trigger findings_set_updated_at before update on public.findings for each row execute function public.set_updated_at();
create trigger recommendations_set_updated_at before update on public.recommendations for each row execute function public.set_updated_at();
create trigger road_tests_set_updated_at before update on public.road_tests for each row execute function public.set_updated_at();

-- Tenant-safe completion RPC. Authorization is derived from auth.uid() inside the
-- database. The caller never supplies a trusted tenant identity or technician identity.
-- event_key makes history insertion idempotent if a request is retried.
create or replace function public.complete_moto_repair_order(
  p_repair_order_id uuid,
  p_expected_updated_at timestamptz default null
)
returns public.repair_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.repair_orders;
  rt public.road_tests;
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into target
  from public.repair_orders
  where id = p_repair_order_id
  for update;

  if target.id is null then
    raise exception 'Repair order not found';
  end if;

  if not public.has_tenant_access(target.organization_id, target.business_unit_id) then
    raise exception 'Not authorized for this repair order tenant' using errcode = '42501';
  end if;

  if p_expected_updated_at is not null and target.updated_at is distinct from p_expected_updated_at then
    raise exception 'Repair order changed; refresh before completing' using errcode = '40001';
  end if;

  if target.status = 'cancelled' then
    raise exception 'Cancelled repair orders cannot be completed';
  end if;

  if target.mileage_out is null then
    raise exception 'Final mileage is required';
  end if;

  if exists (
    select 1 from public.service_operations so
    where so.repair_order_id = target.id
      and so.organization_id = target.organization_id
      and so.business_unit_id = target.business_unit_id
      and so.required
      and (
        so.status not in ('checked','adjusted','replaced','completed','na')
        or (so.status = 'na' and coalesce(btrim(so.technician_note), '') = '')
        or (so.fluid is not null and so.status <> 'na' and coalesce((so.fluid->>'finalLevelVerified')::boolean, false) = false)
      )
  ) then
    raise exception 'Required service operations are incomplete';
  end if;

  if exists (
    select 1 from public.findings f
    where f.repair_order_id = target.id
      and f.organization_id = target.organization_id
      and f.business_unit_id = target.business_unit_id
      and f.status = 'open'
  ) then
    raise exception 'Open findings require a disposition';
  end if;

  select * into rt
  from public.road_tests
  where repair_order_id = target.id;

  if rt.id is null or rt.overall_result is null then
    raise exception 'Road test must be completed or documented as not performed';
  end if;

  if rt.overall_result = 'fail' then
    raise exception 'A failed road test blocks repair order completion';
  end if;

  update public.repair_orders
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where id = target.id
  returning * into target;

  update public.motorcycles
  set current_mileage = greatest(current_mileage, target.mileage_out)
  where id = target.motorcycle_id
    and organization_id = target.organization_id
    and business_unit_id = target.business_unit_id;

  insert into public.service_history_events (
    organization_id, business_unit_id, motorcycle_id, repair_order_id,
    event_key, event_type, event_date, mileage, title, summary,
    source_entity_type, source_entity_id
  ) values (
    target.organization_id, target.business_unit_id, target.motorcycle_id, target.id,
    'repair_order:' || target.id::text || ':completed', 'service',
    coalesce(target.completed_at, now()), target.mileage_out,
    target.service_name,
    'Repair order ' || target.ro_number || ' completed.',
    'repair_order', target.id
  ) on conflict (event_key) do nothing;

  return target;
end;
$$;

alter table public.organizations enable row level security;
alter table public.business_units enable row level security;
alter table public.organization_members enable row level security;
alter table public.motorcycles enable row level security;
alter table public.repair_orders enable row level security;
alter table public.service_operations enable row level security;
alter table public.findings enable row level security;
alter table public.recommendations enable row level security;
alter table public.road_tests enable row level security;
alter table public.service_history_events enable row level security;

revoke all on table public.organizations, public.business_units, public.organization_members,
  public.motorcycles, public.repair_orders, public.service_operations, public.findings,
  public.recommendations, public.road_tests, public.service_history_events
from anon, authenticated;

grant select on table public.organizations, public.business_units, public.organization_members,
  public.motorcycles, public.repair_orders, public.service_operations, public.findings,
  public.recommendations, public.road_tests, public.service_history_events
to authenticated;

grant insert, update, delete on table public.motorcycles, public.repair_orders,
  public.service_operations, public.findings, public.recommendations, public.road_tests
to authenticated;

grant select, insert, update, delete on table public.organizations, public.business_units,
  public.organization_members, public.motorcycles, public.repair_orders,
  public.service_operations, public.findings, public.recommendations, public.road_tests,
  public.service_history_events
to service_role;

-- Organization administration is deliberately narrower than Moto operations.
create policy "organizations_member_select" on public.organizations for select to authenticated
using (exists (select 1 from public.organization_members om where om.organization_id = organizations.id and om.user_id = (select auth.uid()) and om.active));
create policy "business_units_member_select" on public.business_units for select to authenticated
using (public.has_tenant_access(organization_id, id));
create policy "organization_members_select_own" on public.organization_members for select to authenticated
using (user_id = (select auth.uid()) and active);

-- Moto policies always require both organization and business-unit authorization.
create policy "motorcycles_tenant_select" on public.motorcycles for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "motorcycles_tenant_insert" on public.motorcycles for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "motorcycles_tenant_update" on public.motorcycles for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "motorcycles_tenant_delete" on public.motorcycles for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "repair_orders_tenant_select" on public.repair_orders for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "repair_orders_tenant_insert" on public.repair_orders for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id) and technician_id = (select auth.uid()));
create policy "repair_orders_tenant_update" on public.repair_orders for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "repair_orders_tenant_delete" on public.repair_orders for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "service_operations_tenant_select" on public.service_operations for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "service_operations_tenant_insert" on public.service_operations for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id) and technician_id = (select auth.uid()));
create policy "service_operations_tenant_update" on public.service_operations for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "service_operations_tenant_delete" on public.service_operations for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "findings_tenant_select" on public.findings for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "findings_tenant_insert" on public.findings for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id) and technician_id = (select auth.uid()));
create policy "findings_tenant_update" on public.findings for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "findings_tenant_delete" on public.findings for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "recommendations_tenant_select" on public.recommendations for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "recommendations_tenant_insert" on public.recommendations for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "recommendations_tenant_update" on public.recommendations for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "recommendations_tenant_delete" on public.recommendations for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "road_tests_tenant_select" on public.road_tests for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));
create policy "road_tests_tenant_insert" on public.road_tests for insert to authenticated with check (public.has_tenant_access(organization_id, business_unit_id) and technician_id = (select auth.uid()));
create policy "road_tests_tenant_update" on public.road_tests for update to authenticated using (public.has_tenant_access(organization_id, business_unit_id)) with check (public.has_tenant_access(organization_id, business_unit_id));
create policy "road_tests_tenant_delete" on public.road_tests for delete to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

create policy "service_history_tenant_select" on public.service_history_events for select to authenticated using (public.has_tenant_access(organization_id, business_unit_id));

-- History is append-only through trusted database/server paths. Clients cannot edit it.
revoke insert, update, delete on table public.service_history_events from authenticated;

revoke execute on function public.has_tenant_access(uuid, uuid) from public, anon;
grant execute on function public.has_tenant_access(uuid, uuid) to authenticated, service_role;

revoke execute on function public.complete_moto_repair_order(uuid, timestamptz) from public, anon;
grant execute on function public.complete_moto_repair_order(uuid, timestamptz) to authenticated, service_role;
