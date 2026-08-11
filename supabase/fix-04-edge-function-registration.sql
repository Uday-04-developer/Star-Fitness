-- Fix 04 — Registration via Edge Function (service role)
-- Run ONLY AFTER deploying and verifying:
--   supabase functions deploy register-member
--   (delete-member can already be deployed; not required for this SQL)
--
-- Removes the old direct registration permissions:
--   - anon INSERT on public.members
--   - anon INSERT on storage.objects for member-selfies
--
-- Keeps:
--   - private member-selfies bucket
--   - authenticated SELECT (signed URLs)
--   - authenticated INSERT on Storage (optional staff upload)
--
-- Note: authenticated members INSERT/DELETE are handled by Fix 05
-- (least-privilege SELECT + UPDATE). Fix 04 does not change those.
--
-- Safe to re-run. Does NOT make the bucket public.
-- Does NOT grant Storage DELETE to anon or authenticated.

drop policy if exists "public_can_register" on public.members;

drop policy if exists "public_can_upload_selfie" on storage.objects;

-- Defense in depth: ensure no Storage DELETE for client roles
drop policy if exists "authenticated_can_delete_selfie" on storage.objects;
drop policy if exists "anon_can_delete_selfie" on storage.objects;
drop policy if exists "public_can_delete_selfie" on storage.objects;
