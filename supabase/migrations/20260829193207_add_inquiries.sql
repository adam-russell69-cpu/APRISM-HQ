-- Public property-assessment inquiries.
-- Visitors may submit a tightly constrained row but cannot read, update, or
-- delete inquiry records through the Data API.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (char_length(phone) between 7 and 40),
  property_location text not null check (char_length(property_location) between 2 and 240),
  property_type text not null check (property_type in (
    'Single-family residence',
    'Condominium / townhome',
    'Estate / compound',
    'Multiple properties',
    'Specialty asset collection'
  )),
  residency text not null check (residency in ('Primary residence', 'Second home')),
  home_size text not null check (home_size in (
    'Under 3,000 sq. ft.',
    '3,000–5,000 sq. ft.',
    '5,000–8,000 sq. ft.',
    '8,000–12,000 sq. ft.',
    '12,000+ sq. ft.'
  )),
  services text[] not null check (
    cardinality(services) between 1 and 5
    and services <@ array[
      'Property Services',
      'Estate Management',
      'Home Watch',
      'New Home Stewardship',
      'APRISM Moto'
    ]::text[]
  ),
  preferred_contact_method text not null check (preferred_contact_method in ('Email', 'Phone', 'Text message')),
  preferred_time text check (preferred_time is null or char_length(preferred_time) <= 120),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  source text not null default 'website' check (source = 'website'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

revoke all on table public.inquiries from public, anon, authenticated;
grant insert (
  name,
  email,
  phone,
  property_location,
  property_type,
  residency,
  home_size,
  services,
  preferred_contact_method,
  preferred_time,
  message
) on table public.inquiries to anon, authenticated;
grant select, insert, update, delete on table public.inquiries to service_role;

create policy "inquiries_submit_only"
on public.inquiries
for insert
to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and char_length(name) between 2 and 120
  and char_length(email) between 5 and 254
  and char_length(phone) between 7 and 40
  and char_length(property_location) between 2 and 240
  and char_length(message) between 10 and 4000
);
