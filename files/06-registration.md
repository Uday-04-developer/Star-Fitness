# Prompt 06 — Registration Flow

## Objective
Build the full public `Register.jsx` page: `RegistrationForm` (personal info + `PlanSelector` + `SelfieCapture`) and `SuccessScreen`. This is the mobile-first, QR-code entry-point flow. Still using local state/mock submission in this prompt (no real Supabase write yet) — submission should log the assembled member object to be wired to Supabase in Prompt 07.

## Files to Read
- `docs/00-project.md` (mobile-first constraint, selfie/QR context)
- `docs/01-design.md`
- `docs/04-rules.md` (controlled components, accessibility, camera permission handling)
- `docs/06-supabase.md` (`members` table shape, plan duration mapping, client-side resize spec)
- `docs/07-components.md` (`RegistrationForm`, `SelfieCapture`, `PlanSelector`, `SuccessScreen`)
- `docs/08-pages.md` (`Register.jsx` section)

## Files to Modify
Create:
- `src/pages/Register.jsx`
- `src/components/registration/RegistrationForm/RegistrationForm.jsx` + `.module.css`
- `src/components/registration/SelfieCapture/SelfieCapture.jsx` + `.module.css`
- `src/components/registration/PlanSelector/PlanSelector.jsx` + `.module.css`
- `src/components/registration/SuccessScreen/SuccessScreen.jsx` + `.module.css`
- `src/hooks/useMemberForm.js` — form state via `useReducer` (fields, validation errors, submission status)
- `src/utils/validation.js` — validators for name, 10-digit Indian phone number, optional email format

## Rules
- Mobile-first: build and test primarily at 360px–430px widths first, then verify it holds up at tablet/desktop widths — not the other way around.
- `SelfieCapture`: use `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })`, live `<video>` preview, capture button draws the current frame to a `<canvas>`, resizes to max 800px longest edge, exports as a compressed JPEG `Blob` (quality ~0.8) per `docs/06-supabase.md`. Must handle and clearly communicate permission-denied state, and must offer a "Skip for now" option — selfie is never a hard blocker to completing registration.
- `PlanSelector`: 4 selectable cards (Monthly/Quarterly/Half-Yearly/Yearly) mapped to `PLAN_DURATIONS` from `src/lib/constants.js` — selecting one sets `plan_type` and derives `plan_duration_days`.
- Form is a single scrollable form (not a multi-step wizard) per `docs/07-components.md` — sections: Personal Info → Plan Selection → Selfie → Submit button.
- Validate before allowing submit: name required, phone required and correctly formatted, plan required. Selfie is optional. Show inline field errors via `Input`'s `error` prop, never a generic alert/toast dump of all errors at once.
- On submit (mock for now): assemble the full member object matching `docs/06-supabase.md`'s `members` schema shape, log it, transition to `SuccessScreen` showing name, plan, and a computed end date (use `getMembershipStatus`/date utils from Prompt 04's `utils/date.js`).
- `SuccessScreen` gets a tasteful GSAP entrance (per `docs/05-animation.md`, this is a "polish moment") — scoped and cleaned up correctly.
- No Lenis on this page (registration is a task-focused flow, not a scroll-driven marketing experience) — confirm this is consistent with `docs/05-animation.md` (Lenis scope is Home/About only).

## Expected Result
A fast, clean, mobile-optimized registration form a real gym member could complete unassisted from a QR code scan on their own phone, including a working live selfie capture with graceful permission-denial handling, ending in a satisfying confirmation screen.

## Definition of Done
- [ ] Fully usable and visually correct at 360px width with no horizontal scroll or cramped touch targets (minimum 44px tap targets).
- [ ] Camera permission denial does not block form completion.
- [ ] Selfie is resized/compressed client-side before being handed off (verify Blob size/dimensions in dev tools).
- [ ] All required-field validation works with clear, inline, per-field error messages.
- [ ] Successful submission transitions to `SuccessScreen` with correct computed plan end date.
- [ ] Zero console errors/warnings.

## Stop Condition
Stop after the registration flow UI and validation are complete and verified with mock/local submission. Do NOT connect Supabase yet. Report completion and wait for approval.
