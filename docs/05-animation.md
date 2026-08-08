# 05 — Animation Guidelines

## Purpose
Defines exactly how motion is used across the app so it reinforces the "premium, fast, minimal, professional" brand — never gratuitous, never janky, never blocking usability. Animation is a seasoning, not the meal.

## Responsibilities
- Define where GSAP is used vs. where CSS transitions are sufficient
- Define Lenis smooth-scroll scope and configuration
- Define timing, easing, and choreography standards
- Define performance and accessibility constraints (reduced motion)

## Scope: Where Animation Applies

| Surface | Animation Approach |
|---|---|
| Marketing pages (Home, About) | GSAP timelines + ScrollTrigger + Lenis smooth scroll |
| Navbar | CSS transitions for hover/active; GSAP for entrance on load and scroll-hide/show behavior |
| Registration flow | Subtle CSS transitions only (step transitions, input focus) — GSAP only for the multi-step form progress bar and success screen celebration moment |
| Dashboard | CSS transitions only for hover/state changes. **No GSAP, no Lenis on the dashboard.** Data-dense tables must feel instantaneous; scroll-jacking or animated reflows here would frustrate a daily power user. |
| Member Card | One GSAP entrance animation (card "flip" or fade-scale reveal) when generated — this is a shareable, celebratory moment and earns a bit more polish. |

**Hard rule:** Lenis is initialized ONLY inside `Home.jsx` and `About.jsx` via the `useLenis` hook, and destroyed on unmount. It must never be initialized globally in `App.jsx` — this would break native scroll behavior on the dashboard's data tables.

## GSAP Usage Standards

### Timing & Easing
- Standard ease: `power2.out` for entrances, `power2.inOut` for state changes.
- Never use `elastic` or `bounce` eases — contradicts "no flashy effects."
- Durations:
  - Micro-interactions (button hover, badge appear): `0.15s–0.25s`
  - Element entrances (cards, sections on scroll): `0.5s–0.7s`
  - Page-level hero entrance sequence: `0.8s–1.2s` total timeline, staggered `0.08s–0.12s` between children

### Choreography Pattern (Hero / Section Entrances)
1. Container fades in (`opacity 0 → 1`, `y: 24 → 0`)
2. Heading text follows with slight stagger if split into lines/words (use GSAP `SplitText`-equivalent manual span-wrapping if needed — do not add the paid SplitText plugin; wrap manually in JSX if word-stagger is required)
3. Supporting text and CTA follow, staggered `0.1s` after heading
4. Never animate more than 3 stagger "waves" per section — more than that reads as busy, not premium

### ScrollTrigger Standards
- `start: 'top 80%'` is the default trigger point for section reveals (element enters when its top hits 80% of viewport height).
- `toggleActions: 'play none none none'` — animations play once on first entry, they do not reverse/replay on scroll-up. Replaying on every scroll direction change feels cheap.
- Always `scrub: false` unless a specific, deliberate parallax effect is designed — no default "trendy" scroll-scrubbing everywhere.

### Cleanup
Every component using GSAP must:
```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations here
  }, containerRef);
  return () => ctx.revert();
}, []);
```
Using `gsap.context()` scoped to a ref is mandatory — this auto-cleans all tweens/ScrollTriggers created inside it on unmount, preventing memory leaks and duplicate ScrollTrigger registration on route changes.

## Lenis Configuration
```js
new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false, // never smooth-scroll on touch devices — feels laggy on mobile
});
```
Lenis must sync with GSAP's ticker (`gsap.ticker.add`) rather than running its own `requestAnimationFrame` loop, to keep ScrollTrigger positions accurate.

## Reduced Motion
- Respect `prefers-reduced-motion: reduce` media query: when set, disable Lenis smooth scroll entirely (fall back to native scroll) and reduce all GSAP entrance animations to a simple opacity fade with `0.2s` duration, no movement/stagger.
- This is implemented once, centrally, in the `useLenis` hook and a shared `useGsapReveal`-style pattern — not reimplemented per component.

## What NOT to Animate
- Do not animate the dashboard member table rows on every re-render/filter — only animate on true mount, and keep it minimal (a 0.15s fade is enough, no slide/scale).
- Do not add page-transition animations between routes in v1 — React Router route changes should be instant. This is a deliberate scope cut to avoid layout-shift bugs during the initial build.
- Do not add cursor-follow effects, particle backgrounds, or 3D tilt-on-hover — explicitly excluded by "no unnecessary 3D / no flashy effects" in the design brief.

## Folder References
- GSAP/Lenis setup: `src/hooks/useLenis.js`
- Any shared animation utility (e.g., a `useGsapReveal` hook) belongs in `src/hooks/`
- Component-specific animations are written directly inside that component's `.jsx` file, scoped via `gsap.context`

## Best Practices
- Keep all magic numbers (durations, easing, stagger values) as named constants at the top of the file or in `src/lib/constants.js` if reused across components — never scatter raw `0.6` values inline without context.
- Test every animated page with CPU throttling (4x slowdown in DevTools) — premium feel must hold up on mid-range devices, not just the developer's machine.

## Acceptance Criteria
- [ ] No ScrollTrigger duplicate-registration warnings in console on route navigation back and forth.
- [ ] `prefers-reduced-motion` is respected app-wide.
- [ ] Dashboard has zero GSAP/Lenis dependencies loaded/initialized on that route.
- [ ] No animation blocks user interaction (e.g., a button isn't clickable before its entrance animation completes — animations are visual, never gating).

## Common Mistakes
- Initializing Lenis in `App.jsx` globally, breaking dashboard scroll feel.
- Forgetting `gsap.context()` cleanup, causing animations to double-fire after navigating away and back to the homepage.
- Using `scrub: true` "because it looks cool," creating a laggy, unintentional parallax on underpowered devices.
- Adding bounce/elastic easing that clashes with the strict, professional brand tone.

## Future Expansion
If page transitions are desired later, they should be added via React Router's `viewTransition` API or a dedicated wrapper — evaluated only after v1 ships and is stable, not preemptively.
