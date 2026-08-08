# Prompt 09 — Final Review & QA

## Objective
Perform a full, systematic review of the entire application against EVERY Acceptance Criteria checklist across `docs/00-project.md` through `docs/08-pages.md`, and produce a written QA report. This prompt does not fix issues silently — it documents findings and asks the human owner how to prioritize any fixes before making further changes.

## Files to Read
- All files in `docs/` (00 through 09)
- The entire `src/` tree as currently implemented

## Files to Modify
- Create `docs/qa-report.md` documenting findings (this is the only file this prompt creates).
- Do NOT modify any application code in this prompt. If critical bugs are found, list them in the QA report with severity and proposed fix — do not fix them inline. This keeps review and remediation as separate, auditable steps.

## Rules
- Go through each `docs/*.md` file's "Acceptance Criteria" section one by one and mark pass/fail with a one-line justification for each item.
- Explicitly re-verify the most business-critical logic: run through the membership status calculation (`docs/06-supabase.md`) with at least 3 manual test cases (a member expiring today, a member expired 5 days ago, a member with 40 days remaining) and confirm the dashboard/badge/member card all agree.
- Explicitly re-verify security: confirm RLS policies match `docs/06-supabase.md` exactly, confirm no `service_role` key exists client-side, confirm `/dashboard` is truly unreachable without auth (test in an incognito window).
- Explicitly re-verify the out-of-scope list in `docs/00-project.md` — confirm nothing from Phase 2+ (`docs/09-roadmap.md`) has leaked into the codebase.
- Test on at least: one real mobile device or accurate mobile emulation (registration flow), and desktop Chrome (dashboard flow).
- Confirm the Vercel production deployment (not just local dev) passes the same checks — test the live URL, not just `localhost`.

## Expected Result
A `docs/qa-report.md` file giving the human owner (and any future engineer) full confidence in exactly what has been verified, what passed, what needs attention, and what is explicitly deferred to Phase 2+.

## Definition of Done
- [ ] Every Acceptance Criteria item across all 9 core docs is explicitly addressed (pass/fail/note) in `docs/qa-report.md`.
- [ ] The 3 membership-status test cases are documented with actual results.
- [ ] Security checks (RLS, auth gating, key exposure) are documented with actual results, not assumptions.
- [ ] Production Vercel URL has been tested, not just local dev.
- [ ] Any failing item includes a clear, actionable note (not a vague "needs work").

## Stop Condition
This is the final prompt in the v1 build sequence. After `docs/qa-report.md` is produced, STOP completely. Do not attempt fixes automatically. Present the report to the human owner and wait for explicit instruction on which items (if any) to address next. Do not begin any Phase 2 work under any circumstance without a new, explicit prompt.
