# Prompt 08 — Motion & Micro-Interaction Polish

## Objective
Do a full pass across the entire app tightening animation timing, hover/focus states, loading skeletons, empty states, and any visual inconsistencies against `docs/01-design.md` and `docs/05-animation.md`. This is a refinement pass, not a feature-building pass — no new pages, no new routes.

## Files to Read
- `docs/01-design.md` (entire document)
- `docs/05-animation.md` (entire document)
- `docs/04-rules.md` (component states, accessibility)

## Files to Modify
Any existing `.jsx`/`.module.css` file across `src/components/` and `src/pages/` may be touched — this prompt is explicitly a cross-cutting refinement pass. Do not create new pages or routes. New small subcomponents are acceptable only if extracted from existing bloated components to satisfy the 200-line guidance in `docs/04-rules.md`.

## Rules
- Audit every interactive element for the 6 required states from `docs/01-design.md` (default, hover, active, focus-visible, disabled, loading) — fill in any gaps found.
- Audit every async data view (Dashboard stats/table, Member Card, Registration submit) for correct loading/error/empty states per `docs/04-rules.md` — no blank flashes, no infinite spinners.
- Verify GSAP cleanup on every animated component (Hero, AboutSection, MemberCardVisual, SuccessScreen) by navigating away and back repeatedly and checking for duplicate ScrollTrigger warnings in console.
- Verify `prefers-reduced-motion` fallback across all animated surfaces.
- Verify color usage — no stray hardcoded hex values snuck in during earlier prompts; replace any found with the correct token from `docs/01-design.md`.
- Verify the Navbar's scroll-based glass transition and mobile menu remain smooth after all other changes.
- Confirm dashboard remains completely free of GSAP/Lenis (this is a common regression point if a shared component accidentally imported animation logic from a marketing component).
- Run a CPU-throttled (4x) pass in DevTools on Home and Dashboard to confirm animations and interactions hold up on mid-range hardware per `docs/05-animation.md` best practices.

## Expected Result
A visually and behaviorally consistent, premium-feeling application with no rough edges — no missing hover state, no jank, no leftover placeholder/mock artifacts, no console warnings.

## Definition of Done
- [ ] Every interactive element has all 6 required states implemented correctly.
- [ ] Every async view has correct loading/error/empty handling.
- [ ] Zero hardcoded color values remain outside `tokens.css`.
- [ ] Zero GSAP/Lenis code present in the Dashboard component tree.
- [ ] Zero duplicate ScrollTrigger or memory-leak warnings after repeated navigation.
- [ ] `prefers-reduced-motion` verified across Home, About, Registration success, Member Card.
- [ ] Zero console errors/warnings anywhere in the app.

## Stop Condition
Stop after the polish pass is complete and every Definition of Done item is verified. Do NOT begin the final review/QA prompt automatically. Report a summary of what was found and fixed, and wait for explicit approval before continuing to `prompts/09-review.md`.
