-- Secure invoice/work-order attachments for APRISM billing records.

create table public.billing_attachments (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references public.client_accounts(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete cascade,
  kind text not null default 'photo' check (kind in ('photo', 'receipt', 'document', 'other')),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  caption text,
  client_visible boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (invoice_id is not null or work_order_id is not null)
);

create index billing_attachments_account_idx on public.billing_attachments (client_account_id, created_at desc);
create index billing_attachments_invoice_idx on public.billing_attachments (invoice_id, created_at);
create index billing_attachments_work_order_idx on public.billing_attachments (work_order_id, created_at);

create or replace function public.validate_billing_attachment_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invoice_account_id uuid;
  work_order_account_id uuid;
begin
  if new.invoice_id is not null then
    select client_account_id into invoice_account_id
    from public.invoices
    where id = new.invoice_id;

    if invoice_account_id is distinct from new.client_account_id then
      raise exception 'Attachment invoice must belong to the same client account';
    end if;
  end if;

  if new.work_order_id is not null then
    select client_account_id into work_order_account_id
    from public.work_orders
    where id = new.work_order_id;

    if work_order_account_id is distinct from new.client_account_id then
      raise exception 'Attachment work order must belong to the same client account';
    end if;
  end if;

  return new;
end;
$$;

create trigger billing_attachments_validate_account
before insert or update on public.billing_attachments
for each row execute function public.validate_billing_attachment_account();

alter table public.billing_attachments enable row level security;

grant select, insert, update, delete on table public.billing_attachments to authenticated;
grant select, insert, update, delete on table public.billing_attachments to service_role;

create policy "billing_attachments_member_select" on public.billing_attachments
for select to authenticated
using (
  client_visible
  and exists (
    select 1
    from public.client_account_members cam
    where cam.client_account_id = billing_attachments.client_account_id
      and cam.user_id = (select auth.uid())
      and cam.active
  )
);

create policy "billing_attachments_staff_manage" on public.billing_attachments
for all to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()));

revoke execute on function public.validate_billing_attachment_account() from public, anon, authenticated;
grant execute on function public.validate_billing_attachment_account() to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'billing-attachments',
  'billing-attachments',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
