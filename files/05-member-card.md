# Prompt 05 — Member Card Page

## Objective
Build `MemberCard.jsx` (route `/dashboard/member/:id`): the digital member card view plus a details panel and action buttons (Edit placeholder, Send WhatsApp Reminder, Delete with confirmation). Continue using mock data (extend `mockMembers.js` if needed) — real Supabase wiring is still Prompt 07.

## Files to Read
- `docs/01-design.md`
- `docs/05-animation.md` (Member Card entrance animation spec)
- `docs/07-components.md` (`Modal`, `WhatsAppButton`)
- `docs/08-pages.md` (`MemberCard.jsx` section)

## Files to Modify
Create:
- `src/pages/MemberCard.jsx`
- A `MemberCardVisual` component (the actual visual "ID card" element) under `src/components/dashboard/` (e.g., `MemberCardVisual/MemberCardVisual.jsx` + `.module.css`) — kept separate from the page itself so it could later be reused (e.g., print view) without pulling in page-level routing logic
- `src/components/common/Modal/Modal.jsx` + `.module.css` (if not already created) — used here for the delete confirmation

Modify:
- `src/App.jsx` if `/dashboard/member/:id` still points to a placeholder.
- `mockMembers.js` only if an additional field is needed for card display (e.g., ensure `selfie_url` has a placeholder image path or a generated avatar fallback).

## Rules
- Read `member_id` via React Router's `useParams`, find the matching mock member (later replaced by a real Supabase fetch by ID in Prompt 07 — keep the lookup isolated so that swap is small).
- If no member matches the ID, render a clear "Member not found" state with a button back to `/dashboard` — never a blank page or crash.
- Card visual: selfie (or fallback initials avatar if no selfie), full name, status `Badge`, plan type, membership end date, member-since date — styled as a premium glass "ID card," per `docs/01-design.md`.
- This card gets ONE GSAP entrance animation on mount (scoped with `gsap.context`, cleaned up on unmount) per `docs/05-animation.md` — the only GSAP usage permitted on an otherwise dashboard-domain page, explicitly because this is a "moment," not a data-table.
- Delete action opens the `Modal` for confirmation before removing (for now, removes from local mock state only — real deletion via Supabase is Prompt 07).
- "Edit" button can be a visible but disabled/placeholder button in this prompt if full edit functionality isn't in v1 scope confusion — check `docs/09-roadmap.md`: full inline edit is Phase 2. For v1, "Edit" may be omitted entirely or shown as a simple field-level edit for correcting typos (owner discretion) — default to omitting a full edit UI in this prompt and note it as a Phase 2 item in a code comment, to stay aligned with `docs/09-roadmap.md`.
- WhatsApp reminder button reuses `WhatsAppButton` from Prompt 04 exactly — do not fork a new implementation.

## Expected Result
A polished, single-member detail view reachable by clicking any row in the dashboard table, with a satisfying entrance animation on the card, clear status display, and working reminder/delete actions against mock data.

## Definition of Done
- [ ] Navigating from a `MemberRow` click correctly routes to and loads the right member's card.
- [ ] Invalid/missing ID shows a graceful not-found state, not a crash.
- [ ] Delete requires confirmation via `Modal` and correctly updates the (mock) list, reflected back on `/dashboard` on return.
- [ ] GSAP entrance animation plays once, cleans up correctly on unmount/navigation.
- [ ] Zero console errors/warnings.

## Stop Condition
Stop after Member Card page is complete and verified. Do NOT connect Supabase. Report completion and wait for approval.
