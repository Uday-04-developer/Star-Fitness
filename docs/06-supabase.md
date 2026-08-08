# 06 — Supabase Architecture

## Purpose
Defines the complete backend data model: tables, columns, types, relationships, Row Level Security (RLS) policies, Storage buckets, Auth setup, and the exact membership date-calculation logic. This is the most business-critical document — errors here mean incorrect membership status, which directly affects the client's revenue and trust in the tool.

## Responsibilities
- Define database schema (tables + columns + constraints)
- Define RLS policies (who can read/write what)
- Define Supabase Storage bucket structure for selfies
- Define Auth strategy for the owner/staff login
- Define the exact membership status calculation algorithm

## Auth Strategy
- Supabase Auth, **email + password**, single admin account (Lokesh Verma) created manually in the Supabase dashboard for v1 — no public sign-up flow.
- The `Login.jsx` page authenticates via `supabase.auth.signInWithPassword`.
- `Dashboard.jsx` and `MemberCard.jsx` (owner-facing views) are protected routes — wrapped by a route guard reading `AuthContext`, redirecting unauthenticated users to `/login`.
- `Register.jsx` (member self-registration, reached via QR code) is **public, unauthenticated** — it must be reachable by any member scanning the QR code without logging in. Its Supabase writes are permitted via RLS as an explicit, narrow `insert`-only policy (see below), not by exposing the admin account.

## Database Schema

### Table: `members`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `full_name` | `text` | not null | |
| `phone_number` | `text` | not null, unique | Used for WhatsApp deep link and lookup |
| `email` | `text` | nullable | Optional |
| `gender` | `text` | nullable | `'male' \| 'female' \| 'other'` enforced in app validation, not DB enum (keeps schema flexible) |
| `date_of_birth` | `date` | nullable | |
| `address` | `text` | nullable | |
| `selfie_url` | `text` | nullable | Public URL from Supabase Storage |
| `plan_type` | `text` | not null | `'monthly' \| 'quarterly' \| 'half_yearly' \| 'yearly'` — selected package |
| `plan_duration_days` | `integer` | not null | Advertised package length from `PLAN_DURATIONS` (metadata only) |
| `plan_start_date` | `date` | not null | Original join date — **immutable after registration** |
| `paid_duration_months` | `integer` | not null, check in (1,2,3,6,12) | Last paid chunk (calendar months) |
| `current_period_end` | `date` | not null | **Sole source of truth for access expiry** |
| `plan_amount` | `numeric` | nullable | Amount paid, manually entered — no payment gateway in v1 |
| `payment_status` | `text` | not null, default `'paid'` | `'paid' \| 'pending'` — flag only; does not move dates |
| `notes` | `text` | nullable | Free-text staff notes |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `updated_at` | `timestamptz` | not null, default `now()` | Updated via trigger on row update |

**Explicitly NOT stored:** membership `status` (Active/Expiring/Expired) — computed from `current_period_end` vs today. Do not derive access from `plan_start_date + plan_duration_days`.

### Table: `reminder_log` (lightweight, optional but recommended)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `member_id` | `uuid` | FK → `members.id`, on delete cascade | |
| `sent_at` | `timestamptz` | not null, default `now()` | |
| `channel` | `text` | not null, default `'whatsapp'` | Future-proofs for SMS/email channels |

This table exists purely so the dashboard can show "last reminded 2 days ago" — it is written to when the owner clicks the WhatsApp button (an insert, not an actual message-send confirmation, since v1 WhatsApp is a manual deep-link, not an API).

### Updated-at Trigger
```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger members_set_updated_at
before update on members
for each row execute function set_updated_at();
```

## Row Level Security (RLS)

RLS must be **enabled** on both tables. Policies:

### `members` table
1. **Public insert (registration):**
```sql
create policy "public_can_register"
on members for insert
to anon
with check (true);
```
   This allows the unauthenticated `/register` page to create a member row. It is intentionally narrow: `insert` only, no `select`/`update`/`delete` for `anon`.

2. **Authenticated full access (dashboard):**
```sql
create policy "authenticated_full_access"
on members for all
to authenticated
using (true)
with check (true);
```
   The logged-in owner account can read/update/delete all members.

### `reminder_log` table
- `insert`: `authenticated` only (reminders are triggered from the dashboard, which is an authenticated surface).
- `select`: `authenticated` only.
- No `anon` policy at all on this table.

**Constraint:** Never disable RLS "to make development easier." If Cursor is blocked by an RLS policy during testing, the fix is to correct the policy, never to turn RLS off.

## Supabase Storage

### Bucket: `member-selfies`
- **Public bucket** (read access public, so `selfie_url` can be rendered directly as an `<img src>` without signed URLs — acceptable since selfies are non-sensitive, low-stakes gym ID photos, not confidential documents).
- **Upload policy:** `anon` role permitted to `insert` only, path-scoped if desired (e.g., filename must be a UUID, not user-controlled, to prevent overwrite/enumeration abuse):
```sql
create policy "public_can_upload_selfie"
on storage.objects for insert
to anon
with check (bucket_id = 'member-selfies');
```
- File naming convention: `{uuid}.jpg` generated client-side at upload time — never use the raw member name as a filename (privacy + collision safety).
- Client-side resize: selfie captured via `SelfieCapture` component must be resized to max 800px on the longest edge and compressed to JPEG quality ~0.8 before upload (via canvas), keeping storage costs and load times low per `04-rules.md` performance rules.

## Membership Status Calculation

This logic lives in `src/utils/date.js` and must be used **everywhere** status is displayed (dashboard table, member card, filters) — never recalculated ad hoc in a component.

### Plan Duration Mapping (`src/lib/constants.js`)
```js
export const PLAN_DURATIONS = {
  monthly: 30,
  quarterly: 90,
  half_yearly: 182,
  yearly: 365,
};
```

### Algorithm
```
expiry = current_period_end   (stored; sole source of truth)
days_remaining = expiry - today (in days, Asia/Kolkata date-only)

if days_remaining < 0:      status = "expired"
else if days_remaining <= 3: status = "expiring_soon"
else:                        status = "active"
```

Renewal (does not change `plan_start_date`):
```
base = current_period_end if still active/expiring today, else today
current_period_end = addCalendarMonths(base, paid_duration_months)
```

- `today` is computed via `new Date()` normalized to midnight in the gym's local timezone context (`Asia/Kolkata`) — never compare raw `Date` objects with time-of-day components, always normalize to date-only before subtracting, to avoid off-by-one bugs near midnight.
- The "expiring soon" threshold (`3` days) is a named constant `EXPIRING_SOON_THRESHOLD_DAYS` in `src/lib/constants.js`, not a magic number — the gym owner may want to adjust this later.
- Paid duration uses **calendar months** with month-end clamp (see `addCalendarMonths` in `src/utils/date.js`).

## Folder References
- Client setup: `src/lib/supabaseClient.js`
- Date/status logic: `src/utils/date.js`
- Plan constants: `src/lib/constants.js`
- Data hooks: `src/hooks/useMembers.js`, `src/hooks/useMemberForm.js`

## Best Practices
- Always select only the columns a view needs (`.select('id, full_name, phone_number, plan_start_date, plan_duration_days')` on the dashboard list) rather than `select('*')` everywhere — smaller payloads, faster table.
- Use Supabase's realtime subscription (`supabase.channel(...)`) on the dashboard so new registrations from the QR flow appear live without a manual refresh — this is a strong "wow" moment for a non-technical client watching a member self-register.
- Validate `phone_number` format client-side before insert (10-digit Indian mobile pattern) to keep WhatsApp deep links functional.

## Acceptance Criteria
- [ ] RLS is enabled on all tables with no overly-broad policies.
- [ ] A member can complete `/register` while fully logged out.
- [ ] Dashboard cannot be reached without authentication.
- [ ] Membership status is identical whether computed on the dashboard, the member card, or any filter — because it always flows through the single `getMembershipStatus()` util.
- [ ] Selfie uploads are resized client-side before reaching Storage.

## Common Mistakes
- Storing `status` as a static column that gets stale the moment time passes without a manual update.
- Using `service_role` key anywhere in frontend code — this bypasses RLS entirely and is a severe security hole.
- Comparing dates as strings (`"2026-01-01" > "2025-12-31"`) instead of proper `Date` math — works by coincidence in ISO format but is fragile and error-prone practice.
- Forgetting to normalize timezones, causing a member to flip from "active" to "expired" a day early/late depending on server vs. browser timezone.

## Future Expansion
Phase 2 can add a `payments` table (one-to-many with `members`) once Razorpay/Stripe integration is scoped, replacing the single `plan_amount`/`payment_status` columns with a proper ledger — this schema is intentionally simple now to avoid premature complexity.
