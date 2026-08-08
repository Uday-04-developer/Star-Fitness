# Prompt 03 — About Page

## Objective
Build the full `About.jsx` page: gym story section, facilities grid, and (optional, if content available) trainer highlights — wired with the already-built `Navbar` and `Footer`.

## Files to Read
- `docs/01-design.md`
- `docs/05-animation.md`
- `docs/07-components.md` (`AboutSection`)
- `docs/08-pages.md` (`About.jsx` section)

## Files to Modify
Create:
- `src/pages/About.jsx`
- `src/components/marketing/AboutSection/AboutSection.jsx` + `.module.css`
- A `FacilitiesGrid` component within `marketing/` if the facilities list needs its own layout component (only create if `AboutSection` alone would exceed the 200-line guidance in `docs/04-rules.md` — otherwise keep it inside `AboutSection`)

Modify:
- `src/App.jsx` only if the `/about` route still points to a placeholder — replace with the real `About` import.

## Rules
- Reuse `Navbar` and `Footer` from `marketing/` exactly as built in Prompt 02 — do not duplicate or fork them.
- Use `useLenis` in `About.jsx` exactly as in `Home.jsx` (same pattern, own instance, cleaned up on unmount).
- Content: write a short, credible gym story for "Star Fitness Gym" (founded by Lokesh Verma), a facilities grid (e.g., strength zone, cardio zone, free weights, locker rooms, showers — use realistic gym facility categories), and keep tone consistent with the Home page copy (premium, confident, non-corporate).
- Follow `docs/01-design.md` and `docs/05-animation.md` exactly — no new colors, no new animation patterns beyond what's already established (reuse the same entrance choreography approach as Home for consistency).

## Expected Result
A complete About page that feels like a natural continuation of the Home page's visual language — same navbar/footer, same motion language, new content that builds trust in the gym brand.

## Definition of Done
- [ ] `/about` renders the full page with Navbar, story section, facilities grid, Footer.
- [ ] Visual and motion consistency with `Home.jsx` confirmed (same easing, same glass recipe, same spacing scale).
- [ ] Fully responsive 360px–1920px+.
- [ ] Zero console errors/warnings.
- [ ] Active nav link correctly highlights "About" when on this route.

## Stop Condition
Stop after About is complete and verified. Do NOT begin dashboard work. Report completion and wait for approval.
