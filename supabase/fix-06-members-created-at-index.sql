-- Priority 4.1 — index for Dashboard member pagination (created_at DESC).
-- Safe / idempotent. Does not change RLS or Storage policies.
-- Run in Supabase SQL Editor when ready.

create index if not exists members_created_at_idx
  on public.members (created_at desc);
