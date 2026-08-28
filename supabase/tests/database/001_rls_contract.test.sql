begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

select extensions.is(
  (
    select count(*)::integer
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any(array[
        'profiles', 'properties', 'property_members', 'property_systems',
        'inspections', 'inspection_items', 'maintenance_tasks', 'issues',
        'service_requests', 'documents', 'vendors', 'property_vendors'
      ])
      and c.relrowsecurity
  ),
  12,
  'RLS is enabled on every APRISM public table'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and 'anon' = any(roles)
      and tablename = any(array[
        'profiles', 'properties', 'property_members', 'property_systems',
        'inspections', 'inspection_items', 'maintenance_tasks', 'issues',
        'service_requests', 'documents', 'vendors', 'property_vendors'
      ])
  ),
  'No APRISM data policy grants anonymous access'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and cmd = 'UPDATE'
      and with_check is null
  ),
  'Every update policy includes WITH CHECK'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and cmd = 'UPDATE'
      and qual is null
  ),
  'Every update policy includes USING'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and coalesce(qual, '') || coalesce(with_check, '') ilike '%user_metadata%'
  ),
  'No authorization policy uses user_metadata'
);

select extensions.ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'property_members'
      and cmd in ('INSERT', 'UPDATE', 'DELETE')
  ),
  'Clients cannot provision or change property memberships'
);

select extensions.ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'service_requests'
      and cmd = 'INSERT'
      and with_check ilike '%property_members%'
      and with_check ilike '%auth.uid%'
  ),
  'Service requests require both user identity and property membership'
);

select * from extensions.finish();
rollback;
