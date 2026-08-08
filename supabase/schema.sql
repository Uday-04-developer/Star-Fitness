-- Star Fitness — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Then create an Auth user (email/password) for Lokesh Verma manually.
-- Confirm Storage → Buckets shows `member-selfies` as PRIVATE (signed URLs only).

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  email text,
  gender text,
  date_of_birth date,
  address text,
  selfie_url text,
  plan_type text not null,
  plan_duration_days integer not null,
  plan_start_date date not null,
  paid_duration_months integer not null
    check (paid_duration_months in (1, 2, 3, 6, 12)),
  current_period_end date not null,
  plan_amount numeric,
  payment_status text not null default 'paid',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists members_current_period_end_idx
  on public.members (current_period_end);

create table if not exists public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  sent_at timestamptz not null default now(),
  channel text not null default 'whatsapp'
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — members
-- ---------------------------------------------------------------------------

alter table public.members enable row level security;

drop policy if exists "public_can_register" on public.members;
create policy "public_can_register"
on public.members for insert
to anon
with check (true);

drop policy if exists "authenticated_full_access" on public.members;
create policy "authenticated_full_access"
on public.members for all
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- Row Level Security — reminder_log
-- ---------------------------------------------------------------------------

alter table public.reminder_log enable row level security;

drop policy if exists "authenticated_can_insert_reminders" on public.reminder_log;
create policy "authenticated_can_insert_reminders"
on public.reminder_log for insert
to authenticated
with check (true);

drop policy if exists "authenticated_can_select_reminders" on public.reminder_log;
create policy "authenticated_can_select_reminders"
on public.reminder_log for select
to authenticated
using (true);

-- ---------------------------------------------------------------------------
-- Storage — member-selfies (PRIVATE bucket — Fix 01)
-- Anon may INSERT only (registration upload). Authenticated may SELECT
-- (signed URLs for dashboard). No public/anon SELECT → no list/enumeration.
--
-- MIGRATION NOTE (existing data — do NOT auto-mutate without owner approval):
-- Older rows may store full public URLs in members.selfie_url, e.g.
--   https://<project>.supabase.co/storage/v1/object/public/member-selfies/<uuid>.jpg
-- New inserts store the object path only: <uuid>.jpg
-- The app resolves both shapes client-side when creating signed URLs.
-- Optional one-time path normalization (run manually when ready):
--   update public.members
--   set selfie_url = regexp_replace(
--     selfie_url,
--     '^.*\/member-selfies\/',
--     ''
--   )
--   where selfie_url like '%/member-selfies/%';
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('member-selfies', 'member-selfies', false)
on conflict (id) do update set public = false;

drop policy if exists "public_can_upload_selfie" on storage.objects;
create policy "public_can_upload_selfie"
on storage.objects for insert
to anon
with check (bucket_id = 'member-selfies');

-- Remove public/anon read (closes list + public GET enumeration hole)
drop policy if exists "public_can_read_selfie" on storage.objects;

drop policy if exists "authenticated_can_read_selfie" on storage.objects;
create policy "authenticated_can_read_selfie"
on storage.objects for select
to authenticated
using (bucket_id = 'member-selfies');

-- Authenticated staff can also upload/replace if needed from the dashboard later
drop policy if exists "authenticated_can_upload_selfie" on storage.objects;
create policy "authenticated_can_upload_selfie"
on storage.objects for insert
to authenticated
with check (bucket_id = 'member-selfies');

-- ---------------------------------------------------------------------------
-- Realtime — live dashboard updates when a member self-registers
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.members;
exception
  when duplicate_object then null;
end $$;
