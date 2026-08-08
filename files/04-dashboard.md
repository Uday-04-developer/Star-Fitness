# Prompt 04 — Dashboard

## Objective
Build the full authenticated admin `Dashboard.jsx`: minimal admin header, `StatCard` summary row, `FilterBar` + `SearchInput`, and `MemberTable` with `MemberRow`. Use **mock/local placeholder data** in this prompt (a hardcoded array of sample members) — real Supabase wiring happens in Prompt 07. This lets UI and interaction logic be built and verified independently of backend correctness.

## Files to Read
- `docs/01-design.md`
- `docs/04-rules.md`
- `docs/06-supabase.md` (schema shape + status calculation algorithm — needed even though Supabase itself isn't wired yet, so mock data matches the real shape)
- `docs/07-components.md` (`MemberTable`, `MemberRow`, `StatCard`, `FilterBar`, `SearchInput`, `WhatsAppButton`)
- `docs/08-pages.md` (`Dashboard.jsx` section)

## Files to Modify
Create:
- `src/pages/Dashboard.jsx`
- `src/components/dashboard/MemberTable/MemberTable.jsx` + `.module.css`
- `src/components/dashboard/MemberRow/MemberRow.jsx` + `.module.css`
- `src/components/dashboard/StatCard/StatCard.jsx` + `.module.css`
- `src/components/dashboard/FilterBar/FilterBar.jsx` + `.module.css`
- `src/components/dashboard/SearchInput/SearchInput.jsx` + `.module.css`
- `src/components/dashboard/WhatsAppButton/WhatsAppButton.jsx` + `.module.css`
- `src/components/common/Badge/Badge.jsx` + `.module.css` (if not already created)
- `src/utils/date.js` — implement `getMembershipStatus(member)` and `getPlanEndDate(member)` exactly per the algorithm in `docs/06-supabase.md`
- `src/utils/whatsapp.js` — `buildWhatsAppLink(phoneNumber, message)` and a reminder message template function
- A temporary `src/lib/mockMembers.js` with ~12 realistic sample member objects matching the exact `members` table shape from `docs/06-supabase.md` (include a mix of active, expiring_soon, and expired dates relative to today so all UI states are visible)

## Rules
- No GSAP, no Lenis on this page — per `docs/05-animation.md`, dashboard uses CSS transitions only.
- `Dashboard.jsx` reads from `mockMembers.js` directly for now via a temporary local `useState` — do NOT build `useMembers.js` yet (that's Prompt 07's job, once Supabase exists). Structure the component so swapping the data source later is a small, contained change (e.g., isolate the `members` array assignment near the top of the component).
- Filtering (`FilterBar`) and search (`SearchInput`, debounced 300ms) must combine correctly (AND logic — e.g., searching "raj" while filtered to "expired" shows only expired members matching "raj").
- Status must always be computed via `getMembershipStatus()`, never inline in `MemberRow`.
- Follow `docs/04-rules.md` for loading/empty/error states — even with mock data, implement the loading skeleton and empty-state UI paths (can be triggered via a temporary dev toggle or just built correctly and verified by temporarily emptying the mock array).

## Expected Result
A fast, data-dense, premium dark dashboard: top stat cards (Total, Active, Expiring Soon, Expired counts computed from the member list), a filter/search row, and a member table with status badges and a WhatsApp reminder button per row — all using mock data but fully functional end-to-end interaction-wise.

## Definition of Done
- [ ] Stat counts are mathematically correct against the mock data set.
- [ ] Filter + search combine correctly.
- [ ] Status badges match `docs/01-design.md` semantic colors exactly.
- [ ] `WhatsAppButton` opens a correctly formatted `wa.me` link with the member's number and a pre-filled message.
- [ ] Table has working loading skeleton and empty states (verified manually).
- [ ] No GSAP/Lenis code present anywhere in the dashboard component tree.
- [ ] Fully usable at desktop widths (1024px+); acceptable degraded (not broken) experience down to tablet width — mobile optimization of the dashboard itself is not required per `docs/00-project.md` (dashboard is desktop-first).
- [ ] Zero console errors/warnings.

## Stop Condition
Stop after the dashboard UI is complete and verified with mock data. Do NOT connect Supabase yet — that is explicitly Prompt 07's responsibility. Report completion and wait for approval.
