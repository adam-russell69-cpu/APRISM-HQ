-- Fail closed: payable invoices may not enter a customer-facing state without a persisted Stripe payment URL.
alter table public.invoices
  add column if not exists stripe_payment_url text;

alter table public.invoices
  add column if not exists stripe_payment_url_verified_at timestamptz;

alter table public.invoices
  add constraint invoices_sent_requires_payment_url
  check (
    amount_due <= 0
    or status not in ('sent','partially_paid','overdue')
    or (
      stripe_payment_url is not null
      and stripe_payment_url ~ '^https://(checkout|buy)\\.stripe\\.com/'
      and stripe_payment_url_verified_at is not null
    )
  ) not valid;

comment on column public.invoices.stripe_payment_url is
  'Persisted Stripe-hosted payment URL. Required before a payable invoice can become sent/partially_paid/overdue.';
comment on column public.invoices.stripe_payment_url_verified_at is
  'Timestamp when APRISM successfully obtained and persisted the Stripe-hosted payment URL.';

-- Existing legacy invoices are intentionally not validated here. New/updated rows are protected immediately.
