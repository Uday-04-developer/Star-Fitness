# 03 — Folder Structure

## Purpose
Defines the exact, non-negotiable folder and file layout of the repository. Cursor must place every new file according to this structure. If a new file doesn't obviously fit, stop and ask rather than inventing a new top-level folder.

## Full Structure

```
star-fitness/
├── docs/                          # This documentation set
├── prompts/                       # Cursor execution prompts
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── main.jsx                   # App entry point, mounts <App />
│   ├── App.jsx                    # Root component, route definitions
│   │
│   ├── styles/
│   │   ├── tokens.css             # CSS custom properties from 01-design.md
│   │   └── global.css             # Reset, base element styles, font-face
│   │
│   ├── lib/
│   │   ├── supabaseClient.js      # Supabase client singleton
│   │   └── constants.js           # App-wide constants (plan durations, thresholds)
│   │
│   ├── utils/
│   │   ├── date.js                # Membership date math (start/end/status calc)
│   │   ├── validation.js          # Form validation helpers
│   │   └── whatsapp.js            # wa.me link builder + message templates
│   │
│   ├── hooks/
│   │   ├── useMembers.js          # Fetch/subscribe to members list
│   │   ├── useMemberForm.js       # Registration form state + submit logic
│   │   └── useLenis.js            # Lenis smooth-scroll init hook (marketing pages only)
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # Supabase auth session provider (dashboard login)
│   │
│   ├── components/
│   │   ├── common/                # Truly generic, reused across marketing + dashboard
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Badge/
│   │   │   ├── Modal/
│   │   │   ├── Input/
│   │   │   ├── Loader/
│   │   │   └── GlassCard/
│   │   │
│   │   ├── marketing/             # Public site only
│   │   │   ├── Navbar/
│   │   │   ├── Hero/
│   │   │   ├── AboutSection/
│   │   │   └── Footer/
│   │   │
│   │   ├── dashboard/             # Admin dashboard only
│   │   │   ├── MemberTable/
│   │   │   ├── MemberRow/
│   │   │   ├── StatCard/
│   │   │   ├── FilterBar/
│   │   │   ├── SearchInput/
│   │   │   └── WhatsAppButton/
│   │   │
│   │   └── registration/          # Registration flow only
│   │       ├── RegistrationForm/
│   │       ├── SelfieCapture/
│   │       ├── PlanSelector/
│   │       └── SuccessScreen/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MemberCard.jsx
│   │   ├── Login.jsx
│   │   └── NotFound.jsx
│   │
│   └── assets/
│       ├── images/
│       └── icons/                 # Only for custom SVGs not covered by Lucide
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── vercel.json                    # SPA rewrite config
```

## Responsibilities
- `docs/` and `prompts/` are never imported by application code — documentation only.
- `components/` is split by **domain** (`common`, `marketing`, `dashboard`, `registration`), not by atomic-design tiers (no `atoms/molecules/organisms` — that's over-engineering for this project size).
- Each component gets its own folder with a colocated `.module.css` file — never a shared monolithic stylesheet per domain.
- `pages/` components are composition-only: they import and arrange components, they do not contain business logic themselves.
- `hooks/` contains all data-fetching and stateful logic extracted out of components.
- `utils/` contains pure functions only — no React, no side effects beyond their stated purpose.
- `lib/` contains third-party client setup (Supabase) and app-wide constants.

## Naming Conventions
- Components: `PascalCase` folder + file name, e.g. `components/dashboard/MemberTable/MemberTable.jsx`.
- CSS Modules: same name as component, `.module.css` suffix, e.g. `MemberTable.module.css`.
- Hooks: `camelCase`, prefixed `use`, e.g. `useMembers.js`.
- Utils: `camelCase`, descriptive noun/verb, e.g. `date.js`, `validation.js`.
- Route pages: `PascalCase`, singular concept, e.g. `Dashboard.jsx`, not `DashboardPage.jsx` (the `pages/` folder location already disambiguates).

## Import Rules
- Absolute imports are configured via Vite alias `@/` → `src/` (set in `vite.config.js`). Example: `import Button from '@/components/common/Button/Button'`.
- Components never import directly from `pages/` (one-directional dependency: pages depend on components, never the reverse).
- `common/` components never import from `marketing/`, `dashboard/`, or `registration/` — dependency flows one direction only (domain-specific → common, never common → domain-specific).

## Folder References
This document IS the folder reference — all other docs point back here.

## Best Practices
- One component = one folder = one `.jsx` + one `.module.css`. No exceptions for "small" components — consistency beats saving a folder.
- Colocate a component's CSS Module with the component itself; never a global `components.css`.
- Keep `pages/` thin. If a page file exceeds ~150 lines, logic should be extracted to a hook or child component.
- No default exports for utils/hooks (named exports only) — improves refactor safety and autocomplete. Components use default export (React convention).

## Acceptance Criteria
- [ ] Every new file Cursor creates matches this exact folder tree.
- [ ] No new top-level folder under `src/` is created without updating this document first.
- [ ] No component folder is missing its `.module.css` file.
- [ ] `@/` alias resolves correctly in both dev and build.

## Common Mistakes
- Creating a flat `components/` folder without domain subfolders — this becomes unmaintainable past 15 components.
- Putting Supabase queries directly inside a `.jsx` component instead of a `hooks/` file — makes logic untestable and unreusable.
- Creating a `utils/helpers.js` junk-drawer file — every util file must have one clear, named responsibility.
- Mixing `pages/` and `components/` responsibilities (business logic in pages, composition-only expectation violated).

## Future Expansion
If the project grows to need tests, a `src/__tests__/` or colocated `*.test.jsx` pattern can be introduced without restructuring — the domain-based component split already supports this cleanly.
