# 04 — Engineering Rules

## Purpose
This is the binding rulebook for how code is written in this project. Every prompt in `prompts/` references this file. When in doubt, these rules override any generic "best practice" Cursor might default to from its training.

## Responsibilities
- Define hard coding constraints (what Cursor must and must not do)
- Define code style, structure, and quality bar
- Define state management approach
- Define error handling and loading state requirements
- Define accessibility baseline

## Non-Negotiable Rules

1. **No TypeScript.** Plain JavaScript (ES2022+) only, per `02-tech-stack.md`.
2. **CSS Modules only.** No inline `style={{}}` except for truly dynamic, computed-at-runtime values (e.g., a progress bar width) — and even then, prefer setting a CSS custom property via `style={{ '--progress': value }}` and referencing it in the module CSS.
3. **No new dependencies** beyond what's listed in `02-tech-stack.md` without the human owner's explicit approval.
4. **Component size limit:** if a component's `.jsx` file exceeds ~200 lines, it must be decomposed into smaller subcomponents or have logic extracted into a hook.
5. **No business logic in JSX return blocks.** Compute derived values above the `return`, or extract to a util/hook.
6. **No prop drilling beyond 2 levels.** If a value needs to pass through more than 2 component layers, use React Context (see `AuthContext.jsx` as the only v1 example) — but do not introduce global state for things that don't need it.
7. **Every async operation must have 3 explicit UI states:** loading, error, success/empty. No silent failures, no infinite spinners, no unhandled promise rejections.
8. **No `console.log` in committed code.** Use `console.error` only for genuine caught error paths, never for debugging left-over statements.
9. **All dates are stored and computed in UTC**, displayed in the gym's local timezone (Asia/Kolkata, hardcoded — this is a single-location gym) formatted via `Intl.DateTimeFormat`. Never use string-based date math.
10. **All Supabase calls live in `hooks/` or `lib/`, never directly inside a component body.**
11. **Every form input must be a controlled component.** No uncontrolled refs for form state (selfie image is the one exception — handled via `SelfieCapture` component's own internal ref for the camera stream).
12. **No `any`-shaped objects.** Since there's no TypeScript, this means: always destructure exactly the fields you use, never pass around loosely-shaped objects with unclear contents. Define the shape implicitly through consistent usage documented in `06-supabase.md`.

## Code Style
- Functional components only. No class components.
- Hooks called unconditionally at the top of the component — no hooks inside conditionals/loops.
- Arrow function components: `const MemberTable = () => { ... }`, default-exported at the bottom of the file (`export default MemberTable;`).
- Destructure props in the function signature: `const Button = ({ label, onClick, variant = 'primary' }) => {...}`.
- Event handlers named `handleX` (e.g., `handleSubmit`, `handleSearchChange`).
- Boolean state/props prefixed `is`/`has`/`should` (e.g., `isLoading`, `hasError`, `shouldShowModal`).

## State Management Philosophy
- Local UI state → `useState`.
- Cross-cutting concerns with more than one shape of updates → `useReducer` (e.g., multi-step registration form).
- Server state (members list, auth session) → custom hooks wrapping Supabase calls, with local `useState` for `data`, `loading`, `error`. No React Query, no SWR, no global store — see `02-tech-stack.md` constraint.
- Auth session → `AuthContext` only (the single sanctioned global context in this app).

## Error Handling
- Every Supabase call wrapped in `try/catch`, or using `.then().catch()` if promise-chained — never fire-and-forget.
- User-facing error messages must be plain-language ("Couldn't save member. Check your connection and try again.") — never surface raw Supabase/Postgres error strings to the gym owner.
- Log the raw error via `console.error` for developer debugging, but render the friendly message in UI.

## Accessibility Baseline
- All interactive elements are real `<button>`/`<a>` elements — never a `<div onClick>`.
- All form inputs have associated `<label>` elements (visually hidden is acceptable using a `.sr-only` utility class, but must exist in the DOM).
- Focus states must be visible (see `01-design.md` focus-visible spec) — never `outline: none` without a replacement.
- Color is never the sole indicator of status — pair with icon + text (e.g., "Expired" badge = red + X icon + word "Expired").
- Selfie capture flow must have a clear text alternative/instruction for users who deny camera permission.

## Performance Rules
- Images must be compressed/appropriately sized before upload (selfie capture resizes client-side to max 800px before upload to Supabase Storage — see `06-supabase.md`).
- No unnecessary re-renders: memoize expensive derived lists (e.g., filtered/sorted member list) with `useMemo`.
- GSAP animations must be cleaned up in `useEffect` return functions (kill timelines/ScrollTriggers on unmount) — memory leaks in a long-lived dashboard tab are unacceptable.
- Lenis smooth scroll is only initialized on marketing pages (`Home`, `About`), never on `Dashboard` (data-dense tables need native, immediate scroll response).

## Git & Commit Discipline
- One logical change per commit.
- Commit messages: `type: short description` (`feat: add member registration form`, `fix: correct membership expiry calculation`, `style: polish dashboard hover states`).
- No committing `.env`, `node_modules`, or `dist/`.

## Folder References
This document governs code inside all of `src/` as defined in `03-folder-structure.md`.

## Best Practices
- Prefer composition over configuration — a `<GlassCard>` that accepts `children` beats a `<Card variant="glass-with-header-and-footer">` mega-prop component.
- Prefer explicit over clever — a slightly longer, obvious function beats a dense one-liner.
- Write code as if the non-technical client's next hire will read it with zero onboarding.

## Acceptance Criteria
- [ ] No component exceeds 200 lines without justification.
- [ ] No direct Supabase call exists inside a `.jsx` file body.
- [ ] No `console.log` remains in any committed file.
- [ ] Every interactive element is keyboard-accessible (tab + enter works).

## Common Mistakes
- Writing "God components" that fetch data, manage 6 pieces of state, and render a huge JSX tree all in one file.
- Using `div` soup with `onClick` instead of semantic, accessible elements.
- Forgetting to clean up GSAP/ScrollTrigger instances, causing animation glitches on route change.
- Displaying raw Postgres constraint violation errors directly to the gym owner.

## Future Expansion
If the codebase grows significantly, ESLint rules can be tightened (e.g., `max-lines` enforcement) to make these rules machine-enforced rather than convention-enforced.
