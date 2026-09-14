create table public.property_assessment_photos (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.property_assessments(id) on delete cascade,
  area text,
  storage_path text not null unique,
  original_name text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.property_assessment_photos enable row level security;

revoke all on table public.property_assessment_photos from anon, authenticated;
grant select, insert, delete on table public.property_assessment_photos to authenticated;
grant select, insert, update, delete on table public.property_assessment_photos to service_role;

create policy "assessment_photos_staff_select"
on public.property_assessment_photos for select to authenticated
using ((select public.is_aprism_staff()));

create policy "assessment_photos_staff_insert"
on public.property_assessment_photos for insert to authenticated
with check (
  (select public.is_aprism_staff())
  and created_by = (select auth.uid())
);

create policy "assessment_photos_staff_delete"
on public.property_assessment_photos for delete to authenticated
using ((select public.is_aprism_staff()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-photos',
  'assessment-photos',
  false,
  12582912,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "assessment_photo_objects_staff_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'assessment-photos'
  and (select public.is_aprism_staff())
);

create policy "assessment_photo_objects_staff_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'assessment-photos'
  and (select public.is_aprism_staff())
);

create policy "assessment_photo_objects_staff_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'assessment-photos'
  and (select public.is_aprism_staff())
);
