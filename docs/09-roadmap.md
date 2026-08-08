# 09 — Roadmap

## Purpose
Defines the phased delivery plan so v1 stays focused and every future idea has a documented, intentional home rather than leaking into the current build.

## Responsibilities
- Define what ships in v1 (mapped to the `prompts/` sequence)
- Define Phase 2, 3, 4 candidate features
- Provide a place to park ideas without scope-creeping the current build

## Phase 0 — Foundation (this documentation set)
All of `docs/00` through `docs/08`. No code written yet. This phase's Definition of Done is: the human owner (or a technical reviewer) has read and approved this documentation before Cursor begins execution.

## Phase 1 — v1 Build (mapped to `prompts/00` – `prompts/09`)
1. Project setup, tooling, folder scaffold, design tokens (`prompts/00-setup.md`)
2. Home page (`prompts/01-home.md`)
3. Navbar (`prompts/02-navbar.md`)
4. About page (`prompts/03-about.md`)
5. Dashboard shell + member table + stats (`prompts/04-dashboard.md`)
6. Member Card page (`prompts/05-member-card.md`)
7. Registration flow incl. selfie capture (`prompts/06-registration.md`)
8. Supabase integration — schema, RLS, storage, auth wiring (`prompts/07-supabase.md`)
9. Motion polish pass (`prompts/08-polish.md`)
10. Full review and QA pass (`prompts/09-review.md`)

**v1 exit criteria:** all Acceptance Criteria across `docs/00`–`08` are checked off; app is deployed live on Vercel; owner can register a member end-to-end and see it reflected instantly on the dashboard.

## Phase 2 — Revenue & Automation (post-v1, not started until explicitly requested)
- Payment gateway integration (Razorpay recommended for India) with a proper `payments` ledger table
- Automated WhatsApp reminders via WhatsApp Business API (requires Meta Business verification — a real operational lift, deliberately deferred)
- Owner-configurable settings page (expiring-soon threshold, message templates, plan pricing defaults)
- Editable member records directly from `MemberCard.jsx` (v1 supports create + view + delete; full inline edit is a Phase 2 nicety)
- CSV export of member list

## Phase 3 — Multi-Branch & Staff
- Multiple staff accounts with role-based permissions (owner vs. front-desk-only)
- Multi-branch support (a `branches` table, `members.branch_id` foreign key, branch-scoped RLS)
- Branch-level analytics comparison

## Phase 4 — Engagement & Retention
- Attendance / check-in tracking (QR check-in at the door, separate from registration QR)
- Basic diet/workout plan attachment per member
- Member-facing self-service portal (view own membership status, renew online)
- Native mobile wrapper (e.g., Capacitor) if the owner wants an app-store presence

## Explicitly Parked Ideas (not committed to any phase yet)
- Loyalty/referral program
- SMS fallback for members without WhatsApp
- Biometric/fingerprint check-in hardware integration

## Folder References
This document has no direct code mapping — it governs prioritization of `prompts/` files across time.

## Best Practices
- Do not begin Phase 2+ work inside a Phase 1 prompt session, even if it feels like "just one more small feature."
- Re-evaluate this roadmap with the client after v1 ships, based on real usage feedback, not assumptions made pre-launch.

## Acceptance Criteria
- [ ] No Phase 2+ feature appears in the v1 codebase.
- [ ] Every `prompts/` file traces to exactly one Phase 1 numbered item above.

## Common Mistakes
- Scope creep disguised as polish (e.g., quietly adding a payments field beyond the simple `plan_amount`/`payment_status` columns already scoped in `06-supabase.md`).
- Skipping the Phase 1 review step (`prompts/09-review.md`) and calling the project "done" without a QA pass against the Acceptance Criteria across all docs.

## Future Expansion
This document itself should be revisited and versioned as phases complete — mark completed phases with a date when they ship.
