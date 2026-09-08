-- Keep one permissive policy per role/action while preserving public intake
-- submission and staff-only access to internal assessment content.

drop policy if exists "property_assessments_public_intake_insert" on public.property_assessments;
drop policy if exists "property_assessments_staff_manage" on public.property_assessments;

create policy "property_assessments_anon_intake_insert"
on public.property_assessments for insert to anon
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

create policy "property_assessments_authenticated_insert"
on public.property_assessments for insert to authenticated
with check (
  (select public.is_aprism_staff())
  or (
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
  )
);

create policy "property_assessments_staff_select"
on public.property_assessments for select to authenticated
using ((select public.is_aprism_staff()));

create policy "property_assessments_staff_update"
on public.property_assessments for update to authenticated
using ((select public.is_aprism_staff()))
with check ((select public.is_aprism_staff()));

create policy "property_assessments_staff_delete"
on public.property_assessments for delete to authenticated
using ((select public.is_aprism_staff()));
