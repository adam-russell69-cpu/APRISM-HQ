begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select extensions.is((select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=any(array['motorcycles','repair_orders','service_operations','findings','recommendations','road_tests','service_history_events']) and c.relrowsecurity),7,'RLS is enabled on every Moto operational table');
select extensions.ok(not exists(select 1 from pg_policies where schemaname='public' and tablename=any(array['motorcycles','repair_orders','service_operations','findings','recommendations','road_tests','service_history_events']) and 'anon'=any(roles)),'Moto has no anonymous RLS policies');
select extensions.ok(not exists(select 1 from pg_policies where schemaname='public' and tablename=any(array['motorcycles','repair_orders','service_operations','findings','recommendations','road_tests','service_history_events']) and 'authenticated'=any(roles) and cmd in ('SELECT','INSERT','UPDATE','DELETE','ALL') and coalesce(qual,with_check,'') not ilike '%has_tenant_access%'),'Every authenticated Moto policy is tenant-scoped');
select extensions.ok(exists(select 1 from pg_constraint where conrelid='public.service_history_events'::regclass and contype='u' and conname='service_history_events_event_key_key'),'service_history_events has the required unique event_key constraint');
select extensions.ok(has_function_privilege('authenticated','public.complete_moto_repair_order(uuid,timestamptz)','EXECUTE'),'Authenticated users may call the completion RPC');
select extensions.ok(not has_function_privilege('anon','public.complete_moto_repair_order(uuid,timestamptz)','EXECUTE'),'Anonymous users cannot call the completion RPC');
select extensions.ok(has_function_privilege('authenticated','public.has_tenant_access(uuid,uuid)','EXECUTE'),'Authenticated users may evaluate tenant access');
select extensions.ok(not has_function_privilege('anon','public.has_tenant_access(uuid,uuid)','EXECUTE'),'Anonymous users cannot evaluate tenant access');
select extensions.ok(not has_table_privilege('authenticated','public.service_history_events','INSERT'),'Service history is append-only for authenticated clients');
select extensions.ok(exists(select 1 from pg_constraint where conrelid='public.repair_orders'::regclass and contype='f' and pg_get_constraintdef(oid) ilike '%motorcycles%organization_id%business_unit_id%'),'Repair orders use a tenant-preserving motorcycle foreign key');
select extensions.ok(exists(select 1 from public.organizations where slug='aprism'),'APRISM bootstrap organization exists');
select extensions.ok(exists(select 1 from public.business_units bu join public.organizations o on o.id=bu.organization_id where o.slug='aprism' and bu.slug='moto'),'Outpost Moto bootstrap business unit exists');

select * from extensions.finish();
rollback;
