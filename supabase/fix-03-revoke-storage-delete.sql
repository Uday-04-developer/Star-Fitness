-- Fix 03 — Revoke Storage DELETE policies (do NOT grant DELETE)
-- Run in Supabase SQL Editor if fix-03 DELETE grants were ever applied,
-- or to ensure production matches the Edge Function architecture.
-- Safe to re-run. Does NOT change bucket public flag (remains private).
--
-- Intended model:
--   anon / authenticated → NO Storage DELETE
--   Privileged Storage delete → Edge Functions with service role only

drop policy if exists "authenticated_can_delete_selfie" on storage.objects;
drop policy if exists "anon_can_delete_selfie" on storage.objects;
drop policy if exists "public_can_delete_selfie" on storage.objects;
