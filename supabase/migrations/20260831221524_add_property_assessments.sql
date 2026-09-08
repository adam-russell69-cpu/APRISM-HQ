-- APRISM Property Assessment workflow.
-- Public clients may submit an intake, but only staff can read or manage records.

create table public.property_assessments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  assessment_date date,
  status text not null default 'intake_received'
    check (status in ('intake_received', 'scheduled', 'field_draft', 'report_draft', 'completed', 'published', 'cancelled')),
  intake_data jsonb not null default '{}'::jsonb check (jsonb_typeof(intake_data) = 'object'),
  field_notes jsonb not null default '{}'::jsonb check (jsonb_typeof(field_notes) = 'object'),
  findings jsonb not null default '[]'::jsonb check (jsonb_typeof(findings) = 'array'),
  report_data jsonb not null default '{}'::jsonb check (jsonb_typeof(report_data) = 'object'),
  stewardship_recommendation text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index property_assessments_property_date_idx on public.property_assessments (property_id, assessment_date desc);
create index property_assessments_inquiry_id_idx on public.property_assessments (inquiry_id);
create index property_assessments_status_created_idx on public.property_assessments (status, created_at desc);
create index property_assessments_created_by_idx on public.property_assessments (created_by);

create trigger property_assessments_set_updated_at
before update on public.property_assessments
for each row execute function public.set_updated_at();

alter table public.property_assessments enable row level security;

revoke all on table public.property_assessments from anon, authenticated;
grant insert on table public.property_assessments to anon, authenticated;
grant select, update, delete on table public.property_assessments to authenticated;

-- Website intake submissions are write-only and cannot set internal fields.
create policy "property_assessments_public_intake_insert"
on public.property_assessments for insert to anon, authenticated
with check (
  status = 'intake_received'
  and property_id is null
  and inquiry_id is null
  and assessment_date is null
  and field_notes = '{}'::jsonb
  and findings = '[]'::jsonb
  and report_data = '{}'::jsonb
  and stewardship_recommendation is null
  and published_at is null
  and created_by is null
);

-- Internal notes and draft reports remain staff-only. No client/member select
-- policy exists; a future published client view must expose only explicit fields.
create policy "property_assessments_staff_manage"
on public.property_assessments for all to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()));
