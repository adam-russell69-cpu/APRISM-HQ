alter table public.inquiries drop constraint if exists inquiries_source_check;
alter table public.inquiries add constraint inquiries_source_check check (source in ('website','facebook','nextdoor','google','referral','other'));

grant insert (source) on table public.inquiries to anon, authenticated;

drop policy if exists "inquiries_submit_only" on public.inquiries;
create policy "inquiries_submit_only"
on public.inquiries
for insert
to anon, authenticated
with check (
  status = 'new'
  and source in ('website','facebook','nextdoor','google','referral','other')
  and char_length(name) between 2 and 120
  and char_length(email) between 5 and 254
  and char_length(phone) between 7 and 40
  and char_length(property_location) between 2 and 240
  and char_length(message) between 10 and 4000
);
