-- APRISM initial application schema.
-- Authorization is derived only from auth.uid() and explicit property_members rows.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon;
grant execute on function public.set_updated_at() to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_contact_method text check (preferred_contact_method in ('email', 'phone', 'text')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null default 'Park City',
  state text not null default 'UT',
  postal_code text,
  property_type text not null,
  occupancy_type text check (occupancy_type in ('primary', 'second_home', 'other')),
  approximate_sq_ft integer check (approximate_sq_ft is null or approximate_sq_ft > 0),
  year_built integer check (year_built is null or year_built between 1800 and 2200),
  health_status text not null default 'Healthy' check (health_status in ('Healthy', 'Monitor', 'Action Recommended', 'Critical')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_members (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'owner', 'steward')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, user_id)
);

create table public.property_systems (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  category text not null,
  manufacturer text,
  model_number text,
  serial_number text,
  status text not null default 'Healthy' check (status in ('Healthy', 'Monitor', 'Action Recommended', 'Critical')),
  installed_on date,
  warranty_expires_on date,
  service_interval text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  inspector_id uuid references auth.users(id) on delete set null,
  inspection_type text not null default 'scheduled',
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  health_status text check (health_status in ('Healthy', 'Monitor', 'Action Recommended', 'Critical')),
  scheduled_for timestamptz not null,
  completed_at timestamptz,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  property_system_id uuid references public.property_systems(id) on delete set null,
  area text,
  title text not null,
  status text not null default 'Healthy' check (status in ('Healthy', 'Monitor', 'Action Recommended', 'Critical')),
  observation text,
  recommendation text,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text not null,
  primary_contact text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_vendors (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  scope text,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, vendor_id)
);

create table public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  property_system_id uuid references public.property_systems(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'planned' check (status in ('planned', 'scheduled', 'in_progress', 'completed', 'deferred', 'cancelled')),
  priority text not null default 'routine' check (priority in ('routine', 'priority', 'urgent')),
  due_date date,
  completed_at timestamptz,
  recurrence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  inspection_id uuid references public.inspections(id) on delete set null,
  assigned_vendor_id uuid references public.vendors(id) on delete set null,
  reported_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'monitoring', 'in_progress', 'resolved', 'closed')),
  severity text not null default 'Monitor' check (severity in ('Healthy', 'Monitor', 'Action Recommended', 'Critical')),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  category text not null,
  title text not null,
  description text not null,
  preferred_timing text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, storage_path)
);

-- Index every foreign key and the columns used by membership-based RLS.
create index property_members_user_id_idx on public.property_members (user_id);
create index property_systems_property_id_idx on public.property_systems (property_id);
create index inspections_property_scheduled_idx on public.inspections (property_id, scheduled_for desc);
create index inspections_inspector_id_idx on public.inspections (inspector_id);
create index inspection_items_inspection_id_idx on public.inspection_items (inspection_id);
create index inspection_items_property_system_id_idx on public.inspection_items (property_system_id);
create index property_vendors_vendor_id_idx on public.property_vendors (vendor_id);
create index maintenance_tasks_property_due_idx on public.maintenance_tasks (property_id, due_date);
create index maintenance_tasks_property_system_id_idx on public.maintenance_tasks (property_system_id);
create index maintenance_tasks_vendor_id_idx on public.maintenance_tasks (vendor_id);
create index issues_property_status_idx on public.issues (property_id, status);
create index issues_inspection_id_idx on public.issues (inspection_id);
create index issues_assigned_vendor_id_idx on public.issues (assigned_vendor_id);
create index issues_reported_by_idx on public.issues (reported_by);
create index service_requests_property_created_idx on public.service_requests (property_id, created_at desc);
create index service_requests_requested_by_idx on public.service_requests (requested_by);
create index documents_property_id_idx on public.documents (property_id);
create index documents_uploaded_by_idx on public.documents (uploaded_by);

-- Keep updated_at consistent without trusting clients to supply it.
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
create trigger property_members_set_updated_at before update on public.property_members for each row execute function public.set_updated_at();
create trigger property_systems_set_updated_at before update on public.property_systems for each row execute function public.set_updated_at();
create trigger inspections_set_updated_at before update on public.inspections for each row execute function public.set_updated_at();
create trigger inspection_items_set_updated_at before update on public.inspection_items for each row execute function public.set_updated_at();
create trigger vendors_set_updated_at before update on public.vendors for each row execute function public.set_updated_at();
create trigger property_vendors_set_updated_at before update on public.property_vendors for each row execute function public.set_updated_at();
create trigger maintenance_tasks_set_updated_at before update on public.maintenance_tasks for each row execute function public.set_updated_at();
create trigger issues_set_updated_at before update on public.issues for each row execute function public.set_updated_at();
create trigger service_requests_set_updated_at before update on public.service_requests for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();

-- RLS is mandatory for every table in the exposed public schema.
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_members enable row level security;
alter table public.property_systems enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_items enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.issues enable row level security;
alter table public.service_requests enable row level security;
alter table public.documents enable row level security;
alter table public.vendors enable row level security;
alter table public.property_vendors enable row level security;

revoke all on table public.profiles, public.properties, public.property_members,
  public.property_systems, public.inspections, public.inspection_items,
  public.maintenance_tasks, public.issues, public.service_requests,
  public.documents, public.vendors, public.property_vendors from anon, authenticated;

grant select on table public.profiles, public.properties, public.property_members,
  public.property_systems, public.inspections, public.inspection_items,
  public.maintenance_tasks, public.issues, public.service_requests,
  public.documents, public.vendors, public.property_vendors to authenticated;
grant insert, update on table public.profiles to authenticated;
grant insert on table public.service_requests to authenticated;

-- Profile policies: users own exactly one profile row keyed to auth.users.id.
create policy "profiles_select_own" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Membership rows are provisioned administratively; clients can only read their own links.
create policy "property_members_select_own" on public.property_members for select to authenticated
  using ((select auth.uid()) = user_id);

-- A client can see a property only through an explicit membership.
create policy "properties_select_member" on public.properties for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = properties.id
      and pm.user_id = (select auth.uid())
  ));

create policy "property_systems_select_member" on public.property_systems for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = property_systems.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "inspections_select_member" on public.inspections for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = inspections.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "inspection_items_select_member" on public.inspection_items for select to authenticated
  using (exists (
    select 1
    from public.inspections i
    join public.property_members pm on pm.property_id = i.property_id
    where i.id = inspection_items.inspection_id
      and pm.user_id = (select auth.uid())
  ));

create policy "maintenance_tasks_select_member" on public.maintenance_tasks for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = maintenance_tasks.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "issues_select_member" on public.issues for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = issues.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "service_requests_select_member" on public.service_requests for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = service_requests.property_id
      and pm.user_id = (select auth.uid())
  ));
create policy "service_requests_insert_own_member" on public.service_requests for insert to authenticated
  with check (
    requested_by = (select auth.uid())
    and exists (
      select 1 from public.property_members pm
      where pm.property_id = service_requests.property_id
        and pm.user_id = (select auth.uid())
    )
  );

create policy "documents_select_member" on public.documents for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = documents.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "property_vendors_select_member" on public.property_vendors for select to authenticated
  using (exists (
    select 1 from public.property_members pm
    where pm.property_id = property_vendors.property_id
      and pm.user_id = (select auth.uid())
  ));

create policy "vendors_select_linked_property" on public.vendors for select to authenticated
  using (exists (
    select 1
    from public.property_vendors pv
    join public.property_members pm on pm.property_id = pv.property_id
    where pv.vendor_id = vendors.id
      and pm.user_id = (select auth.uid())
  ));
