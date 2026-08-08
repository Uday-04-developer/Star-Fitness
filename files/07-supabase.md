# Prompt 07 — Supabase Integration

## Objective
Wire the entire application to a real Supabase backend: create the schema, RLS policies, storage bucket, auth, and replace ALL mock data (dashboard, member card, registration form) with real Supabase reads/writes. This is the most critical, highest-risk prompt in the sequence — proceed carefully and verify each piece before moving to the next.

## Files to Read
- `docs/06-supabase.md` (the entire document — schema, RLS, storage, auth, status calculation)
- `docs/04-rules.md` (async state handling, error handling rules)
- `docs/03-folder-structure.md` (`hooks/`, `lib/`, `context/`)

## Files to Modify
Create:
- `src/hooks/useMembers.js` — fetches all members, subscribes to Supabase Realtime for live inserts/updates, exposes `{ members, isLoading, error, refetch }`
- `src/context/AuthContext.jsx` — wraps `supabase.auth`, exposes `{ session, isLoading, signIn, signOut }`
- `src/components/common/ProtectedRoute/ProtectedRoute.jsx` — route guard reading `AuthContext`

Modify:
- `src/lib/supabaseClient.js` — confirm correct env var usage (should already exist from Prompt 00)
- `src/pages/Dashboard.jsx` — replace `mockMembers.js` usage with `useMembers()`
- `src/pages/MemberCard.jsx` — replace mock lookup with a real fetch-by-id (either via `useMembers` + client-side find, or a dedicated single-row query — prefer reusing `useMembers`'s already-fetched list to avoid an extra round trip, falling back to a direct query only if the member isn't in the current cached list)
- `src/pages/Register.jsx` / `useMemberForm.js` — replace mock submit with a real Supabase insert into `members`, plus a Storage upload for the selfie Blob (if present) before or alongside the insert, storing the resulting public URL in `selfie_url`
- `src/pages/Login.jsx` — wire to `AuthContext.signIn`
- `src/App.jsx` — wrap protected routes (`/dashboard`, `/dashboard/member/:id`) with `ProtectedRoute`
- `src/components/dashboard/WhatsAppButton/WhatsAppButton.jsx` — add the `reminder_log` insert on click (fire-and-forget, must not block the `wa.me` link opening)

Also produce (as SQL, to be run manually by the human in the Supabase SQL editor — Cursor should output this as a `supabase/schema.sql` file, not attempt to execute it):
- `supabase/schema.sql` containing: `members` table DDL, `reminder_log` table DDL, `updated_at` trigger, all RLS policies, and storage bucket + policy SQL — exactly as specified in `docs/06-supabase.md`.

## Rules
- Never use the Supabase `service_role` key anywhere in frontend code — `anon` key only, per `docs/02-tech-stack.md` and `docs/06-supabase.md`.
- Every Supabase call wrapped in proper try/catch with plain-language user-facing error messages per `docs/04-rules.md` — raw Postgres errors must never reach the UI.
- `getMembershipStatus()` and related date utils from earlier prompts must be reused as-is — do not duplicate status logic inside `useMembers.js`.
- Realtime subscription in `useMembers.js` must be cleaned up (`.unsubscribe()` / `supabase.removeChannel()`) on unmount.
- Selfie upload: generate a `crypto.randomUUID()`-based filename, upload to the `member-selfies` bucket, only proceed to insert the `members` row (or handle gracefully if selfie was skipped) — the member record must still be created successfully even if the selfie upload fails (never lose a registration over a photo upload error; log the error, insert the member without `selfie_url`, and surface a soft warning to the user, not a hard failure).
- `ProtectedRoute` must preserve the originally-requested path and redirect back after successful login.

## Expected Result
The full application (Home, About, Register, Login, Dashboard, Member Card) is now backed by a real Supabase project: registrations write real rows and upload real selfies, the dashboard reads and live-updates from real data, and `/dashboard` routes are genuinely protected by Supabase Auth.

## Definition of Done
- [ ] `supabase/schema.sql` exists and matches `docs/06-supabase.md` exactly.
- [ ] A member registered via `/register` (fully logged out) appears live on `/dashboard` without a manual refresh.
- [ ] `/dashboard` and `/dashboard/member/:id` redirect to `/login` when unauthenticated, and back to the originally requested page after login.
- [ ] Selfie images are visible on the Member Card page via their public Storage URL.
- [ ] WhatsApp reminder click both opens the `wa.me` link and writes a `reminder_log` row.
- [ ] No `service_role` key present anywhere in the repository.
- [ ] All error paths (network failure, RLS rejection, invalid data) show a plain-language message, never a raw stack trace or Postgres error string.
- [ ] Zero console errors/warnings in normal operation.

## Stop Condition
Stop after Supabase integration is complete, `supabase/schema.sql` has been provided for the human to run manually, and all Definition of Done items are verified against a real Supabase project. Do NOT proceed to animation polish. Explicitly flag to the human: "Please run `supabase/schema.sql` in your Supabase project's SQL editor and confirm the `member-selfies` bucket is created before testing." Wait for explicit approval before continuing.
