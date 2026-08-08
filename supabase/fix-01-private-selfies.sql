-- Fix 01 — Private member-selfies bucket (run in Supabase SQL Editor)
-- Closes anon list/GET enumeration. Safe to re-run.

insert into storage.buckets (id, name, public)
values ('member-selfies', 'member-selfies', false)
on conflict (id) do update set public = false;

drop policy if exists "public_can_upload_selfie" on storage.objects;
create policy "public_can_upload_selfie"
on storage.objects for insert
to anon
with check (bucket_id = 'member-selfies');

drop policy if exists "public_can_read_selfie" on storage.objects;

drop policy if exists "authenticated_can_read_selfie" on storage.objects;
create policy "authenticated_can_read_selfie"
on storage.objects for select
to authenticated
using (bucket_id = 'member-selfies');

drop policy if exists "authenticated_can_upload_selfie" on storage.objects;
create policy "authenticated_can_upload_selfie"
on storage.objects for insert
to authenticated
with check (bucket_id = 'member-selfies');
