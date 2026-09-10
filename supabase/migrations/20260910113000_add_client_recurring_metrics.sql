alter table public.client_accounts
  add column if not exists recurring_active boolean not null default false,
  add column if not exists expected_monthly_value numeric(12,2);

alter table public.client_accounts
  drop constraint if exists client_accounts_expected_monthly_value_check;

alter table public.client_accounts
  add constraint client_accounts_expected_monthly_value_check
  check (expected_monthly_value is null or expected_monthly_value >= 0);

comment on column public.client_accounts.recurring_active is
  'True only when APRISM has an explicitly recognized ongoing recurring client relationship.';

comment on column public.client_accounts.expected_monthly_value is
  'Expected monthly recurring revenue for an active recurring client relationship; null when not established.';
