create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete restrict,
  estimate_number text not null unique check (estimate_number ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  status text not null default 'draft' check (status in ('draft','sent','approved','declined','converted','expired')),
  issue_date date not null default current_date,
  valid_until date not null,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  notes text,
  approved_at timestamptz,
  declined_at timestamptz,
  converted_invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until >= issue_date)
);

create table public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit text not null default 'each',
  unit_price numeric(12,2) not null check (unit_price >= 0),
  amount numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index estimates_client_status_idx on public.estimates (client_account_id, status, issue_date desc);
create index estimate_items_estimate_idx on public.estimate_items (estimate_id);
create trigger estimates_set_updated_at before update on public.estimates for each row execute function public.set_updated_at();
create trigger estimate_items_set_updated_at before update on public.estimate_items for each row execute function public.set_updated_at();

create or replace function public.recalculate_estimate_total(target_estimate_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  calculated_subtotal numeric(12,2);
begin
  select coalesce(sum(amount),0)::numeric(12,2) into calculated_subtotal
  from public.estimate_items where estimate_id = target_estimate_id;
  update public.estimates
  set subtotal = calculated_subtotal,
      total = (calculated_subtotal + tax)::numeric(12,2)
  where id = target_estimate_id;
end;
$$;

create or replace function public.recalculate_estimate_from_child()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_estimate_total(old.estimate_id);
    return old;
  end if;
  perform public.recalculate_estimate_total(new.estimate_id);
  return new;
end;
$$;

create trigger estimate_items_recalculate_estimate
after insert or update or delete on public.estimate_items
for each row execute function public.recalculate_estimate_from_child();

alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;

grant select, insert, update, delete on table public.estimates, public.estimate_items to authenticated;
grant select, insert, update, delete on table public.estimates, public.estimate_items to service_role;

create policy "estimates_staff_manage" on public.estimates for all to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()));
create policy "estimate_items_staff_manage" on public.estimate_items for all to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()));

revoke execute on function public.recalculate_estimate_total(uuid) from public, anon, authenticated;
revoke execute on function public.recalculate_estimate_from_child() from public, anon, authenticated;
grant execute on function public.recalculate_estimate_total(uuid) to service_role;
grant execute on function public.recalculate_estimate_from_child() to service_role;
