# 08 — Pages & Routes

## Purpose
Defines every route in the application, what it renders, its access control, and its content/behavior contract. This is the map from URL to experience.

## Responsibilities
- Enumerate all routes and their access level (public/protected)
- Define page-level content structure
- Define page-level loading/error/empty states
- Define SEO basics for public pages

## Route Table

| Path | Page Component | Access | Purpose |
|---|---|---|---|
| `/` | `Home.jsx` | Public | Marketing homepage |
| `/about` | `About.jsx` | Public | Gym story, facilities, trust-building |
| `/register` | `Register.jsx` | Public | Member self-registration (QR entry point) |
| `/login` | `Login.jsx` | Public (redirects if already authed) | Owner/staff login |
| `/dashboard` | `Dashboard.jsx` | Protected | Member management |
| `/dashboard/member/:id` | `MemberCard.jsx` | Protected | Individual member's digital card + details |
| `*` | `NotFound.jsx` | Public | 404 fallback |

Route protection is implemented via a `ProtectedRoute` wrapper component (colocated in `App.jsx` or `src/components/common/ProtectedRoute/`) that reads `AuthContext` and redirects to `/login` with the intended destination preserved (`?redirect=/dashboard`).

## Page Details

### `Home.jsx`
- **Composition:** `Navbar` → `Hero` → a "Why Star Fitness" features section (3–4 glass cards: equipment, trainers, hygiene, flexible plans) → a CTA band ("Ready to start?" → `/register`) → `Footer`.
- Uses `useLenis` for smooth scroll and GSAP entrance timelines per `05-animation.md`.
- **SEO:** `<title>Star Fitness Gym — Premium Fitness, Real Results</title>`, meta description summarizing the gym's value proposition. Set via direct `document.title` assignment in a `useEffect` (no `react-helmet` dependency added — keep it lightweight per `02-tech-stack.md` no-extra-deps rule).

### `About.jsx`
- **Composition:** `Navbar` → page header → gym story section → facilities grid → trainer highlight section (optional, if content available) → `Footer`.
- Same Lenis/GSAP treatment as `Home`.

### `Register.jsx`
- **Composition:** minimal header (logo only, no full `Navbar` — reduces distraction/exit points for a mobile user mid-registration) → `RegistrationForm` → (on success) `SuccessScreen`.
- **Loading state:** submit button shows `isLoading` on `Button` while the Supabase insert + selfie upload are in flight.
- **Error state:** inline error banner at top of form if submission fails, plain-language per `04-rules.md`, form data is preserved (never cleared on error).
- Must be fully functional and comfortable on a 360px-wide screen — this is the QR-scan entry point, tested primarily on phones.

### `Login.jsx`
- **Composition:** centered `GlassCard` with `Input` (email), `Input` (password, type handled as a masked text input), `Button` (submit).
- On success: redirect to `/dashboard` (or the preserved `?redirect=` target).
- On failure: inline error message ("Incorrect email or password.") — never reveal whether the email exists (standard auth security practice).

### `Dashboard.jsx`
- **Composition:** `Navbar`-equivalent minimal admin header (logo + owner name + logout button, distinct from the marketing `Navbar` — do not reuse the marketing component here, it carries public nav links that don't belong in an authenticated admin context) → summary row of `StatCard`s (Total, Active, Expiring Soon, Expired) → `FilterBar` + `SearchInput` row → `MemberTable` → floating/prominent "Register New Member" `Button` (routes to `/register`, or opens `/register` in a new tab so the dashboard session isn't lost — recommended: new tab).
- Data comes from `useMembers` hook, which fetches on mount and subscribes to Supabase Realtime inserts/updates so new QR registrations appear live.
- **Loading state:** `StatCard`s and `MemberTable` show skeletons.
- **Empty state:** encouraging first-run message with a clear CTA to register the first member.
- **No GSAP, no Lenis** — per `05-animation.md`, this page must feel instantaneous.

### `MemberCard.jsx`
- **Composition:** the member's digital card (selfie, name, plan, status badge, membership end date, member-since date) rendered as a shareable/printable-styled `GlassCard`, plus a details panel below (contact info, payment status, notes) and action buttons (Edit, Send WhatsApp Reminder, Delete — with confirmation `Modal`).
- Reached from `MemberTable` row click.
- One GSAP entrance animation on the card itself per `05-animation.md`; rest of the page is static.

### `NotFound.jsx`
- Simple centered message + `Button` back to `/`. No animation needed.

## Global Layout Concerns
- `App.jsx` defines the `<Router>` and all `<Route>` entries, wrapped in `AuthContext.Provider`.
- There is no persistent shared layout wrapper across ALL pages (marketing pages use `Navbar`+`Footer`, dashboard pages use their own minimal admin header) — these are genuinely different applications sharing one codebase, and forcing a single shared `Layout` component would violate the "no unnecessary abstraction" rule.

## Folder References
Maps to `src/pages/` and `src/App.jsx` per `03-folder-structure.md`.

## Best Practices
- Keep page components thin — composition and data-wiring only, per `04-rules.md`.
- Every page sets `document.title` appropriately for browser tab clarity, even on protected pages (helps the owner if they have multiple tabs open).

## Acceptance Criteria
- [ ] Direct navigation (typing the URL, refreshing) works for every route without a 404, including on Vercel production (SPA rewrite configured).
- [ ] `/dashboard` and `/dashboard/member/:id` are unreachable without authentication.
- [ ] `/register` is reachable and fully functional with zero authentication.
- [ ] Every page has an explicit loading and error state where async data is involved.

## Common Mistakes
- Reusing the marketing `Navbar` on the `Dashboard` — mixes public nav items into an authenticated context and breaks the "desktop-fast" dashboard feel with unnecessary animation/weight.
- Forgetting the Vercel SPA rewrite, causing `/dashboard` to 404 on refresh in production.
- Putting Lenis/GSAP initialization in a shared layout that wraps the Dashboard, accidentally re-introducing smooth-scroll where it's explicitly banned.

## Future Expansion
An `/dashboard/settings` route can be added in Phase 2 for the owner to adjust `EXPIRING_SOON_THRESHOLD_DAYS`, plan pricing defaults, and WhatsApp message templates without code changes.
