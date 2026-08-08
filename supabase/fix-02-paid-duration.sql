-- Phase 1 — Paid duration vs selected plan
-- Run in Supabase SQL Editor after reviewing.
--
-- Migration A (empty table): columns + constraints only; app writes values on insert.
-- Migration B (existing members): backfill assumes previously granted access matched
-- selected plan duration (same as today's derived end). Does NOT rewrite plan_start_date.

alter table public.members
  add column if not exists paid_duration_months integer,
  add column if not exists current_period_end date;

-- Backfill existing rows (Migration B). Safe no-op when already populated.
update public.members
set
  paid_duration_months = case plan_duration_days
    when 30 then 1
    when 90 then 3
    when 182 then 6
    when 365 then 12
    else 1
  end,
  current_period_end = (plan_start_date + (plan_duration_days * interval '1 day'))::date
where paid_duration_months is null
   or current_period_end is null;

alter table public.members
  alter column paid_duration_months set not null,
  alter column current_period_end set not null;

alter table public.members
  drop constraint if exists members_paid_duration_months_check;

alter table public.members
  add constraint members_paid_duration_months_check
  check (paid_duration_months in (1, 2, 3, 6, 12));

create index if not exists members_current_period_end_idx
  on public.members (current_period_end);
