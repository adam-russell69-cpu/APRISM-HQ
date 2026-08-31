-- Allow a public intake submission to receive only its newly inserted UUID.
-- The random request token is server-generated, sent in a request header, and
-- valid for a short receipt window. No intake or internal assessment data is
-- granted to anonymous visitors.

alter table public.property_assessments
add column receipt_token uuid not null default gen_random_uuid();

create unique index property_assessments_receipt_token_idx
on public.property_assessments (receipt_token);

grant select (id) on table public.property_assessments to anon;

create policy "property_assessments_anon_receipt_select"
on public.property_assessments for select to anon
using (
  receipt_token::text = (
    coalesce(
      nullif((select current_setting('request.headers', true)), ''),
      '{}'
    )::jsonb ->> 'x-aprism-receipt-token'
  )
  and status = 'intake_received'
  and created_at >= now() - interval '5 minutes'
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
