# Prompt 01 — Home Page

## Objective
Build the full `Home.jsx` marketing page: `Hero` section, "Why Star Fitness" features section, CTA band, using the design system and animation rules already established. `Navbar` and `Footer` are built in separate prompts — for this prompt, render simple placeholder stand-ins for them if needed to preview layout, OR skip them if `App.jsx` doesn't yet import them (do not build Navbar/Footer content here even if tempted).

## Files to Read
- `docs/00-project.md`
- `docs/01-design.md`
- `docs/05-animation.md`
- `docs/07-components.md` (Hero, GlassCard, Button sections)
- `docs/08-pages.md` (`Home.jsx` section)

## Files to Modify
Create:
- `src/pages/Home.jsx`
- `src/components/marketing/Hero/Hero.jsx` + `Hero.module.css`
- A features section component: `src/components/marketing/FeaturesSection/FeaturesSection.jsx` + `.module.css` (add this folder — it's a reasonable, small addition within the `marketing/` domain already defined; do not invent folders outside `marketing/`)
- A CTA band component: reuse `GlassCard` + `Button` from `common/` — do not create a new dedicated component if `GlassCard` composition covers it
- `src/hooks/useLenis.js`

Do not modify: `docs/`, `prompts/`, anything under `dashboard/` or `registration/`.

## Rules
- Follow all rules in `docs/04-rules.md` (component size, controlled patterns, etc.)
- Follow `docs/05-animation.md` exactly: Lenis initialized via `useLenis` only within `Home.jsx`, GSAP entrance timeline scoped with `gsap.context()`, cleaned up on unmount.
- Follow `docs/01-design.md` for all colors/spacing/typography — no invented values.
- Content/copy: write premium, confident, non-jargon marketing copy appropriate for a real gym brand called "Star Fitness Gym," owner Lokesh Verma. Keep copy concise — this is a fitness gym, not a SaaS product; avoid corporate buzzwords.
- Hero CTA routes to `/register` using React Router's `useNavigate` or `<Link>`.
- Respect `prefers-reduced-motion` per `docs/05-animation.md`.

## Expected Result
A polished, dark, glassmorphism homepage with a hero section (headline, subheadline, CTA button, subtle background gradient), a 3–4 card features section explaining why to choose Star Fitness, and a closing CTA band — all animating in smoothly on load and scroll, with working smooth-scroll via Lenis.

## Definition of Done
- [ ] Page matches `docs/01-design.md` color/type/spacing tokens exactly (no hardcoded hex values in CSS Modules).
- [ ] GSAP timeline plays once on load/scroll-into-view, does not replay on scroll-up.
- [ ] Lenis is destroyed on unmount (verify by navigating away and back — no duplicate scroll listeners).
- [ ] Fully responsive from 360px to 1920px+ with no horizontal scroll or layout break.
- [ ] Zero console errors/warnings.
- [ ] `prefers-reduced-motion: reduce` results in a simple fade-only fallback.

## Stop Condition
Stop after the Home page is complete and verified against the Definition of Done. Do NOT build the Navbar or Footer even though the page references where they'll go — those are separate prompts. Report completion and wait for approval before continuing.
