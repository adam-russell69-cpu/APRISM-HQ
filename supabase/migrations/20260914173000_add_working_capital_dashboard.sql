-- APRISM working-capital control panel.
-- Cash is entered deliberately by staff rather than inferred from invoices or Stripe balances.

create table public.working_capital (
  singleton_id smallint primary key default 1 check (singleton_id = 1),
  operating_cash numeric(12,2) not null default 0 check (operating_cash >= 0),
  owner_paid_unreimbursed numeric(12,2) not null default 0 check (owner_paid_unreimbursed >= 0),
  client_advances numeric(12,2) not null default 0 check (client_advances >= 0),
  upcoming_commitments numeric(12,2) not null default 0 check (upcoming_commitments >= 0),
  minimum_reserve_target numeric(12,2) not null default 2500 check (minimum_reserve_target > 0),
  stability_reserve_target numeric(12,2) not null default 5000 check (stability_reserve_target >= minimum_reserve_target),
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.working_capital (singleton_id) values (1)
on conflict (singleton_id) do nothing;

create trigger working_capital_set_updated_at
before update on public.working_capital
for each row execute function public.set_updated_at();

alter table public.working_capital enable row level security;

revoke all on table public.working_capital from anon;
grant select, insert, update on table public.working_capital to authenticated;
grant all on table public.working_capital to service_role;

create policy "working_capital_staff_select"
on public.working_capital for select to authenticated
using ((select public.is_aprism_staff()));

create policy "working_capital_staff_insert"
on public.working_capital for insert to authenticated
with check ((select public.is_aprism_staff()) and singleton_id = 1);

create policy "working_capital_staff_update"
on public.working_capital for update to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()) and singleton_id = 1);
