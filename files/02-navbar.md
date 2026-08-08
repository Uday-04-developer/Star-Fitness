# Prompt 02 — Navbar

## Objective
Build the marketing site's `Navbar` component (used on `Home` and `About` only, never on `Dashboard`) and wire it into `App.jsx` so it appears above `Home.jsx` and (once built) `About.jsx`. Also build `Footer` in this same prompt since both are shared marketing chrome and are trivial in isolation — this keeps the prompt sequence efficient without violating single-responsibility (they remain two separate components/files).

## Files to Read
- `docs/01-design.md`
- `docs/03-folder-structure.md`
- `docs/07-components.md` (`Navbar`, `Footer` sections)
- `docs/08-pages.md`

## Files to Modify
Create:
- `src/components/marketing/Navbar/Navbar.jsx` + `Navbar.module.css`
- `src/components/marketing/Footer/Footer.jsx` + `Footer.module.css`

Modify:
- `src/pages/Home.jsx` — wrap with `Navbar` above and `Footer` below the existing content
- `src/App.jsx` only if needed to adjust layout wrapping — do not restructure routing logic

## Rules
- Navbar: logo (text-based "Star Fitness" wordmark styled with the accent red on "Fitness," is acceptable — no logo image asset required unless one exists in `public/`), nav links to `/` and `/about`, primary CTA `Button` ("Join Now") linking to `/register`.
- Navbar becomes glass-background once scrolled past a threshold (e.g., 40px), transparent/minimal at the very top of the page — implement via a lightweight scroll event listener with debouncing or a `useEffect` + `IntersectionObserver`, NOT via GSAP ScrollTrigger (keep this decoupled from the Lenis/GSAP entrance system per `docs/05-animation.md`).
- Mobile: hamburger icon (Lucide `Menu`/`X`) toggles a slide-down glass panel with nav links stacked.
- Footer: gym name, short tagline, contact placeholder (address/phone — use realistic placeholder text the client can edit later), copyright line with current year computed via `new Date().getFullYear()`, not hardcoded.
- Active route link should be visually distinguished (accent underline or color) using `useLocation` from React Router.
- Follow `docs/04-rules.md` accessibility rules: hamburger button has `aria-label`, active/expanded state reflected via `aria-expanded`.

## Expected Result
A sticky, premium glass navbar that transitions cleanly on scroll, works flawlessly on mobile with a hamburger menu, and a simple, clean footer — both now visible wrapping the Home page.

## Definition of Done
- [ ] Navbar and Footer render correctly on `Home.jsx`.
- [ ] Mobile hamburger menu opens/closes correctly, is keyboard accessible (Tab + Enter + Escape to close).
- [ ] Scroll-triggered glass background transition is smooth, no flicker/jank.
- [ ] Active nav link is visually correct on `/`.
- [ ] Zero console errors/warnings.

## Stop Condition
Stop once Navbar and Footer are complete, wired into `Home.jsx`, and verified. Do NOT wire them into `About.jsx` yet if that page doesn't exist as real content — that happens in the About prompt. Report completion and wait for approval.
