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
- `Register.jsx` (member self-registration, reached via QR code) is **public, unauthenticated**. Registration writes go through the Edge Function `register-member` (service role server-side). The browser never receives a service-role/secret key.

## Edge Functions (selfie lifecycle)

| Function | Auth | Purpose |
|----------|------|---------|
| `register-member` | Public (`verify_jwt = false`) | Validate input, upload JPEG, insert member; on INSERT failure delete **only** the object this request uploaded |
| `delete-member` | Owner JWT (`verify_jwt = true`) + `OWNER_USER_IDS` allowlist | Delete member by `memberId`; load `selfie_url` from DB; DB delete first, then exact Storage cleanup. Any authenticated non-owner → **403**. |
| `export-members-backup` | Owner JWT (`verify_jwt = true`) + `OWNER_USER_IDS` allowlist | Read-only export: members + selfie path/availability metadata (no ZIP, no image bytes, no URLs). Non-owner → **403**. |

Privileged Storage deletion uses `SUPABASE_SERVICE_ROLE_KEY` **only inside** Edge Functions. Never put service/secret keys in `VITE_*` env vars.

**Owner authorization:** set Edge Function secret `OWNER_USER_IDS` to a comma-separated list of Supabase Auth user UUIDs for the gym owner account(s). Do not hardcode owner identities in the repo. If the secret is missing/empty, `delete-member` fails closed (403).

**Remaining hardening:** no application-level rate limiting yet on `register-member` (payload size limits only). Add rate limiting before heavy public traffic.

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
| `selfie_url` | `text` | nullable | Storage object path (e.g. `{uuid}.jpg`); legacy full URLs may exist |
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

**Indexes:** `phone_number` (unique), `current_period_end`, and `created_at DESC` (Dashboard pagination — see `fix-06-members-created-at-index.sql`).

**Dashboard list pagination (Priority 4.1):** `useMembers` loads members with `.range()` in pages of **50** (`created_at` DESC). StatCards use a separate lean `select('id, current_period_end')` over the whole table — not the loaded page. **Server search (4.1b):** non-empty name/phone query uses `ilike` across the whole table (limit 50); clearing search restores paginated browse. Status filter remains client-side on the current result set. Export Backup still uses Edge Function `export-members-backup` for the full dataset and must never read paginated React state.

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
1. **No anon insert.** Registration is performed by Edge Function `register-member` with the service role (bypasses RLS). Do not recreate `public_can_register` unless intentionally reverting to direct client inserts.

2. **Authenticated least privilege (dashboard):**
```sql
create policy "authenticated_can_select_members"
on members for select
to authenticated
using (true);

create policy "authenticated_can_update_members"
on members for update
to authenticated
using (true)
with check (true);
```
   - SELECT ✅ — dashboard list / member detail  
   - UPDATE ✅ — payment, plan, renew, expiry corrections  
   - INSERT ❌ — registration uses `register-member` (service role)  
   - DELETE ❌ — deletion uses Edge Function `delete-member` (service role + selfie cleanup). Browser Data API DELETE must fail under RLS.

### `reminder_log` table
- `insert`: `authenticated` only (reminders are triggered from the dashboard, which is an authenticated surface).
- `select`: `authenticated` only.
- No `anon` policy at all on this table.

**Constraint:** Never disable RLS "to make development easier." If Cursor is blocked by an RLS policy during testing, the fix is to correct the policy, never to turn RLS off.

## Supabase Storage

### Bucket: `member-selfies`
- **Private bucket** (`public = false`). Dashboard renders photos via time-limited **signed URLs** (`createSelfieSignedUrl` / `getCachedSelfieSignedUrl` in `src/utils/selfie.js`). Grid cards sign lazily near viewport (`useSignedSelfieUrl` + IntersectionObserver) and reuse an **in-memory** path→URL cache for the TTL (never stored in DB). Anonymous clients cannot list or read objects.
- `members.selfie_url` stores the **Storage object path** (e.g. `{uuid}.jpg`), not the image binary. Legacy rows may still hold a full public URL; the app normalizes both shapes with `getSelfieObjectPath`.
- **Upload:** performed by Edge Function `register-member` (service role). Browser does **not** upload directly. Anon Storage INSERT is not part of the intended model.
- **Read policy:** `authenticated` may `select` on this bucket (for signed URLs). No anon SELECT.
- **Delete:** **none** for `anon` or `authenticated`. Privileged Storage delete happens only in Edge Functions (`register-member` cleanup on failed INSERT; `delete-member` after DB delete). The browser must never call `storage.remove()`.
- File naming convention: `{uuid}.jpg` generated **server-side** in `register-member` — never trust a client-supplied filename.
- Client-side resize: selfie captured via `SelfieCapture` is resized to max 800px / JPEG ~0.8 as an optimization. Server still enforces JPEG magic bytes and a max size (~2 MB).
- **Lifecycle:** successful register → member row + Storage object. Failed INSERT → server deletes only the object created in that request. Owner delete → DB row first, then exact selfie path from the row (best-effort). Historical orphans are not auto-scanned.

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
- Edge Functions: `supabase/functions/register-member`, `supabase/functions/delete-member`

## Best Practices
- Always select only the columns a view needs (`.select('id, full_name, phone_number, plan_start_date, plan_duration_days')` on the dashboard list) rather than `select('*')` everywhere — smaller payloads, faster table.
- Use Supabase's realtime subscription (`supabase.channel(...)`) on the dashboard so new registrations from the QR flow appear live without a manual refresh — this is a strong "wow" moment for a non-technical client watching a member self-register.
- Validate `phone_number` format client-side before insert (10-digit Indian mobile pattern) to keep WhatsApp deep links functional.

## Acceptance Criteria
- [ ] RLS is enabled on all tables; anon cannot insert members or read/delete Storage objects.
- [ ] A member can complete `/register` while fully logged out via `register-member`.
- [ ] Dashboard cannot be reached without authentication.
- [ ] Membership status is identical whether computed on the dashboard, the member card, or any filter — because it always flows through the single `getMembershipStatus()` util.
- [ ] Selfie uploads are resized client-side; server validates JPEG + size; filenames are server-generated.
- [ ] Failed registration cleans up only the selfie uploaded in that request (server-side).
- [ ] Owner member deletion uses `delete-member` (DB then Storage); browser never calls Storage `.remove()`.

## Common Mistakes
- Storing `status` as a static column that gets stale the moment time passes without a manual update.
- Using `service_role` key anywhere in frontend code — this bypasses RLS entirely and is a severe security hole.
- Comparing dates as strings (`"2026-01-01" > "2025-12-31"`) instead of proper `Date` math — works by coincidence in ISO format but is fragile and error-prone practice.
- Forgetting to normalize timezones, causing a member to flip from "active" to "expired" a day early/late depending on server vs. browser timezone.

## Future Expansion
Phase 2 can add a `payments` table (one-to-many with `members`) once Razorpay/Stripe integration is scoped, replacing the single `plan_amount`/`payment_status` columns with a proper ledger — this schema is intentionally simple now to avoid premature complexity.
