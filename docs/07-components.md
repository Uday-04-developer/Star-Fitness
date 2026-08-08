# 07 — Component Library

## Purpose
Defines every component in the system, its props contract, visual states, and where it lives. Cursor must build exactly these components with exactly these responsibilities — no merging two components into one "flexible" mega-component, no splitting one responsibility across multiple redundant components.

## Responsibilities
- Enumerate all `common/`, `marketing/`, `dashboard/`, and `registration/` components
- Define prop contracts (name, type, required/optional, default)
- Define what each component explicitly does NOT do

## Common Components (`src/components/common/`)

### `Button`
- **Props:** `label` (string, required), `onClick` (func), `variant` ('primary' | 'secondary' | 'ghost' | 'danger', default 'primary'), `icon` (Lucide component, optional), `iconPosition` ('left' | 'right', default 'left'), `disabled` (bool), `isLoading` (bool), `type` ('button' | 'submit', default 'button'), `fullWidth` (bool)
- **States:** default, hover, active, disabled, loading (shows inline spinner, replaces icon, keeps label)
- **Does NOT:** handle navigation directly — pass a `handleClick` that internally uses `useNavigate` if routing is needed. Button never imports React Router itself.

### `Badge`
- **Props:** `label` (string), `status` ('active' | 'expiring_soon' | 'expired' | 'neutral', default 'neutral')
- Maps status to color + icon per `01-design.md` semantic colors (e.g., expired = danger red + X icon, active = success green + check icon).
- **Does NOT:** compute status itself — always receives a pre-computed status string as a prop from `utils/date.js`.

### `Input`
- **Props:** `label` (string, required), `name` (string, required), `type` ('text' | 'tel' | 'email' | 'date' | 'number', default 'text'), `value`, `onChange`, `error` (string, optional — renders red helper text below input), `placeholder`, `required` (bool)
- Always renders an associated `<label htmlFor>` per accessibility rules in `04-rules.md`.

### `Modal`
- **Props:** `isOpen` (bool), `onClose` (func), `title` (string), `children`
- Renders via a portal to `document.body`. Closes on `Escape` key and backdrop click. Traps focus while open.
- **Does NOT:** contain any business logic — purely a layout/behavior shell.

### `Loader`
- **Props:** `size` ('sm' | 'md' | 'lg', default 'md')
- A simple spinner using the accent color. Used for button loading states and full-page suspense states.

### `GlassCard`
- **Props:** `children`, `padding` ('sm' | 'md' | 'lg', default 'md'), `interactive` (bool — adds hover lift/border-brighten if true)
- Implements the exact glassmorphism recipe from `01-design.md`. This is the base visual building block reused by `StatCard`, marketing section panels, and modal content.

## Marketing Components (`src/components/marketing/`)

### `Navbar`
- **Props:** none (reads current route via `useLocation` to highlight active link)
- Fixed/sticky, glass background once scrolled past hero (scroll-position-based class toggle, implemented with a lightweight scroll listener — not GSAP ScrollTrigger, to keep it simple and always-on regardless of Lenis state).
- Contains: logo, nav links (Home, About), primary CTA button ("Join Now" → routes to `/register`).
- Mobile: collapses into a hamburger menu with a slide-down glass panel.

### `Hero`
- **Props:** none — static marketing content defined within, per `08-pages.md` copy
- Contains headline, subheadline, primary CTA, and background gradient/mesh per `01-design.md`.
- Owns its own GSAP entrance timeline per `05-animation.md`.

### `AboutSection`
- **Props:** none
- Presents gym story, facilities, trainer highlights (content structure defined in `08-pages.md`).

### `Footer`
- **Props:** none
- Contact info, address, social links, copyright. Simple, no animation beyond a fade-in on scroll into view.

## Dashboard Components (`src/components/dashboard/`)

### `MemberTable`
- **Props:** `members` (array, required), `isLoading` (bool), `onSelectMember` (func)
- Renders column headers (Name, Phone, Plan, Status, End Date, Actions) and maps `members` to `MemberRow`.
- Renders a skeleton-row state when `isLoading`, and an explicit empty state ("No members yet — register your first member") when `members.length === 0` and not loading.
- **Does NOT:** fetch data itself — receives already-fetched, already-filtered `members` from the `Dashboard` page via `useMembers`.

### `MemberRow`
- **Props:** `member` (object, required), `onClick` (func)
- Computes and displays status via `getMembershipStatus(member)` from `utils/date.js`, rendered through `Badge`.
- Includes inline `WhatsAppButton` for quick reminder send.

### `StatCard`
- **Props:** `label` (string), `value` (string | number), `icon` (Lucide component), `accent` (bool — highlights the card, e.g., for "Expiring This Week")
- Built on top of `GlassCard`. Used in the dashboard's top summary row (Total Members, Active, Expiring Soon, Expired).

### `FilterBar`
- **Props:** `activeFilter` ('all' | 'active' | 'expiring_soon' | 'expired'), `onFilterChange` (func)
- Segmented control / pill buttons for filtering the member table by status.

### `SearchInput`
- **Props:** `value` (string), `onChange` (func), `placeholder` (default: "Search by name or phone")
- Debounced internally (300ms) before calling `onChange` upward, to avoid re-filtering on every keystroke.

### `WhatsAppButton`
- **Props:** `phoneNumber` (string, required), `message` (string, required — pre-filled reminder text from `utils/whatsapp.js`)
- Renders a button that opens `https://wa.me/{phone}?text={encoded message}` in a new tab, and logs a row to `reminder_log` on click (fire-and-forget, non-blocking to the `wa.me` navigation).

## Registration Components (`src/components/registration/`)

### `RegistrationForm`
- **Props:** none (self-contained page-level form; uses `useMemberForm` hook internally)
- Multi-section but single-scroll form (not a wizard/stepper in v1 — client needs speed, and a single scrollable form is faster for a front-desk-assisted registration than clicking through steps). Sections: Personal Info → Plan Selection → Selfie Capture → Submit.

### `SelfieCapture`
- **Props:** `onCapture` (func, receives a `Blob`), `existingImage` (string url, optional, for retake preview)
- Requests camera permission (`navigator.mediaDevices.getUserMedia`), shows live preview, capture button, retake button.
- Handles permission-denied state with a clear fallback message and a "skip for now" option (selfie is nice-to-have, not a hard blocker to registration — never trap a paying member out of registering due to a camera permission issue).
- Performs the client-side resize/compress (per `06-supabase.md`) before calling `onCapture`.

### `PlanSelector`
- **Props:** `selectedPlan` (string), `onChange` (func)
- Card-based selector (Monthly / Quarterly / Half-Yearly / Yearly) showing duration and typical price reference (price is informational text, not enforced — actual `plan_amount` is manually entered separately).

### `SuccessScreen`
- **Props:** `member` (object) — the just-created member record
- Confirmation view shown after successful registration, with the member's name, plan, and end date. This is the "polish moment" that earns a slightly richer GSAP entrance per `05-animation.md`.

## Folder References
Maps 1:1 to `03-folder-structure.md`'s `src/components/` tree.

## Best Practices
- Every component accepts data via props — no component reaches into global state or Supabase directly except the few explicitly-designated hook-consuming page/container components.
- Keep prop names consistent across similar components (`isLoading`, `onClick`, `onChange` — never `loading` in one place and `isLoading` in another).

## Acceptance Criteria
- [ ] Every component listed here exists with the exact prop contract described.
- [ ] No component fetches data that should come from a hook per `04-rules.md`.
- [ ] `Badge` status colors match `01-design.md` semantic tokens exactly.

## Common Mistakes
- Building one giant `MemberForm` that also renders the table — violates single-responsibility split between `registration/` and `dashboard/` domains.
- Hardcoding the WhatsApp message text inline in `WhatsAppButton` instead of sourcing it from `utils/whatsapp.js` templates.
- Making `SelfieCapture` a hard requirement that blocks form submission — must be skippable.

## Future Expansion
`RegistrationForm` may become a true multi-step wizard in Phase 2 if analytics show high drop-off on the single-scroll version — the `useMemberForm` hook's reducer-based state is already structured to support this transition without a full rewrite.
