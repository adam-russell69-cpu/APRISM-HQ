create or replace function aprism_private.create_work_order_from_service_request()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_account_id uuid;
  v_source text := 'resident';
  v_visibility text := 'resident';
  v_work_order_id uuid;
begin
  select p.client_account_id
    into v_account_id
  from public.properties p
  where p.id = new.property_id;

  if v_account_id is null then
    raise exception 'Property % is not linked to a client account', new.property_id;
  end if;

  if exists (
    select 1 from public.client_account_members cam
    where cam.client_account_id = v_account_id
      and cam.user_id = new.requested_by
      and cam.active = true
      and cam.role in ('manager','admin')
  ) then
    v_source := 'property_manager';
    v_visibility := 'customer';
  elsif exists (
    select 1 from public.property_members pm
    where pm.property_id = new.property_id
      and pm.user_id = new.requested_by
      and pm.role = 'owner'
  ) then
    v_source := 'homeowner';
    v_visibility := 'resident';
  end if;

  insert into public.work_orders (
    client_account_id,
    property_id,
    service_request_id,
    title,
    description,
    status,
    priority,
    requested_by,
    source,
    visibility
  ) values (
    v_account_id,
    new.property_id,
    new.id,
    new.title,
    new.description,
    'requested',
    'routine',
    new.requested_by,
    v_source,
    v_visibility
  )
  returning id into v_work_order_id;

  insert into public.work_order_activity (
    work_order_id,
    actor_user_id,
    event_type,
    details,
    visibility
  ) values (
    v_work_order_id,
    new.requested_by,
    'request_created',
    jsonb_build_object('service_request_id', new.id, 'source', v_source),
    v_visibility
  );

  return new;
end;
$function$;

update public.work_orders
set visibility = 'resident'
where id = 'f57ba5ee-d9a7-49cb-9272-f0ab0b5689da'
  and source = 'homeowner';

update public.work_order_activity
set visibility = 'resident'
where work_order_id = 'f57ba5ee-d9a7-49cb-9272-f0ab0b5689da'
  and event_type = 'request_created';
