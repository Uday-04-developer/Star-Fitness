-- Fix 05 — Revoke authenticated DELETE (and INSERT) on public.members
-- Prerequisites:
--   1. App deletes via Edge Function `delete-member` (already true in code).
--   2. `delete-member` is deployed + OWNER_USER_IDS is set.
--   3. Prefer running AFTER Fix 03 and Fix 04, once register-member is live
--      (keeps production cutover ordered and easy to verify).
--
-- Before: authenticated_full_access FOR ALL (SELECT/INSERT/UPDATE/DELETE)
-- After:
--   authenticated SELECT ✅
--   authenticated UPDATE ✅
--   authenticated INSERT ❌
--   authenticated DELETE ❌
--
-- Registration INSERT is service-role (register-member), not authenticated.
-- Safe to re-run.

drop policy if exists "authenticated_full_access" on public.members;

drop policy if exists "authenticated_can_select_members" on public.members;
create policy "authenticated_can_select_members"
on public.members for select
to authenticated
using (true);

drop policy if exists "authenticated_can_update_members" on public.members;
create policy "authenticated_can_update_members"
on public.members for update
to authenticated
using (true)
with check (true);
