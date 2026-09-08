-- Company-level APRISM staff authorization.
-- Client authorization remains property-scoped through property_members.

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'steward')),
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger staff_users_set_updated_at
before update on public.staff_users
for each row execute function public.set_updated_at();

alter table public.staff_users enable row level security;

revoke all on table public.staff_users from anon, authenticated;
grant select on table public.staff_users to authenticated;
grant select, insert, update, delete on table public.staff_users to service_role;

create policy "staff_users_select_own"
on public.staff_users for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.is_aprism_staff()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_users
    where user_id = (select auth.uid())
      and active
      and role in ('owner', 'admin', 'steward')
  );
$$;

create or replace function public.is_aprism_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_users
    where user_id = (select auth.uid())
      and active
      and role in ('owner', 'admin')
  );
$$;

revoke execute on function public.is_aprism_staff() from public, anon;
revoke execute on function public.is_aprism_admin() from public, anon;
grant execute on function public.is_aprism_staff() to authenticated;
grant execute on function public.is_aprism_admin() to authenticated;

-- Staff can operate property records. Only owners/admins can manage account links.
grant insert, update, delete on table public.properties, public.property_systems,
  public.inspections, public.inspection_items, public.maintenance_tasks,
  public.issues, public.service_requests, public.documents, public.vendors,
  public.property_vendors to authenticated;
grant insert, update, delete on table public.property_members to authenticated;

create policy "properties_staff_manage" on public.properties for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "property_systems_staff_manage" on public.property_systems for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "inspections_staff_manage" on public.inspections for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "inspection_items_staff_manage" on public.inspection_items for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "maintenance_tasks_staff_manage" on public.maintenance_tasks for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "issues_staff_manage" on public.issues for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "service_requests_staff_manage" on public.service_requests for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "documents_staff_manage" on public.documents for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "vendors_staff_manage" on public.vendors for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "property_vendors_staff_manage" on public.property_vendors for all to authenticated
  using ((select public.is_aprism_staff()))
  with check ((select public.is_aprism_staff()));
create policy "property_members_admin_manage" on public.property_members for all to authenticated
  using ((select public.is_aprism_admin()))
  with check ((select public.is_aprism_admin()));

-- Inquiries remain write-only for the public and become reviewable by APRISM staff.
grant select, update on table public.inquiries to authenticated;

create policy "inquiries_staff_select"
on public.inquiries for select to authenticated
using ((select public.is_aprism_staff()));

create policy "inquiries_staff_update"
on public.inquiries for update to authenticated
using ((select public.is_aprism_staff()))
with check (
  (select public.is_aprism_staff())
  and status in ('new', 'contacted', 'qualified', 'closed')
  and source = 'website'
);
