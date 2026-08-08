# 02 — Tech Stack

## Purpose
Locks the exact technology decisions for this project so Cursor never substitutes, adds, or upgrades a dependency without explicit instruction. Consistency here prevents dependency bloat and version-conflict bugs.

## Stack Summary
| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | React (Vite) | Fast dev server, no unnecessary SSR complexity for this use case |
| Language | JavaScript (ES2022+) | Per client requirement — no TypeScript in v1 |
| Styling | CSS Modules | Scoped, zero-runtime, pairs cleanly with the design token system |
| Animation | GSAP (+ ScrollTrigger plugin) | Industry-standard, performant, precise control needed for premium feel |
| Smooth scroll | Lenis | Pairs with GSAP ScrollTrigger for premium marketing site feel |
| Routing | React Router (v6+) | Standard client-side routing |
| Icons | Lucide React | Consistent, tree-shakeable, matches minimal design language |
| Backend / DB | Supabase (Postgres, Auth, Storage) | Managed backend, avoids building custom API server |
| Hosting | Vercel | Zero-config deploys, preview URLs, fast edge network |
| Build tool | Vite | Chosen over CRA/webpack for speed |

## Responsibilities
- Define exact package list and their purpose
- Define what is explicitly NOT allowed
- Define environment variable contract
- Define build/deploy pipeline expectations

## Package List (v1)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "@supabase/supabase-js": "^2.x",
    "gsap": "^3.x",
    "lenis": "^1.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "eslint": "^8.x",
    "eslint-plugin-react": "^7.x",
    "eslint-plugin-react-hooks": "^4.x"
  }
}
```

## Explicitly NOT Allowed (unless a future prompt says otherwise)
- No TypeScript
- No Tailwind CSS / styled-components / Emotion / any CSS-in-JS — CSS Modules only
- No Redux / Zustand / Jotai — component state + React Context is sufficient for this app's complexity; do not introduce a state library
- No UI kits (MUI, Chakra, Ant Design, shadcn) — all components are custom-built per `01-design.md`
- No Next.js — this is a Vite SPA, not an SSR framework, per explicit stack decision
- No moment.js — use native `Date` / `Intl` APIs for date math (see `06-supabase.md` for membership date calculation rules)
- No jQuery, no legacy animation libraries (no AOS, no Animate.css) — GSAP only
- No form libraries (React Hook Form, Formik) in v1 — forms are simple enough for controlled components with manual validation; revisit only if forms grow materially more complex

## Environment Variables Contract
All Supabase credentials and any other secrets must be accessed exclusively via Vite's `import.meta.env`, prefixed `VITE_`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- `.env` must be in `.gitignore`.
- `.env.example` must be committed with empty/placeholder values so Cursor and future devs know what's required.
- The Supabase **anon key** is the only key ever exposed client-side. The service role key is never used in frontend code, ever, under any circumstance.

## Build & Deploy
- Local dev: `npm run dev` (Vite dev server)
- Production build: `npm run build` → outputs to `dist/`
- Deployment target: Vercel, connected to GitHub repo, auto-deploy on push to `main`, preview deploys on PRs.
- Vercel project settings: Framework preset = Vite. Build command = `npm run build`. Output directory = `dist`.
- Environment variables must be added in the Vercel dashboard (Project → Settings → Environment Variables) mirroring `.env.example`.

## Browser Support
- Last 2 versions of Chrome, Safari, Edge, Firefox.
- iOS Safari 15+ (registration flow will be used heavily on member phones — this is a hard constraint, especially for camera/selfie capture APIs).
- No IE11 support — not a consideration.

## Folder References
- `package.json` at project root
- `.env.example` at project root
- `vite.config.js` at project root
- `vercel.json` only if custom rewrites are needed for React Router (SPA fallback) — see `03-folder-structure.md`

## Best Practices
- Pin major versions in `package.json`, allow minor/patch flexibility (`^`).
- Run `npm audit` before first production deploy.
- Keep `node_modules` out of git (`.gitignore` default).
- Lockfile (`package-lock.json`) must be committed for reproducible installs.

## Acceptance Criteria
- [ ] `npm install && npm run build` succeeds with zero errors on a clean clone.
- [ ] No disallowed library appears in `package.json`.
- [ ] `.env.example` exists and matches every `VITE_` variable actually referenced in code.
- [ ] Vercel deployment succeeds using only the documented build settings.

## Common Mistakes
- Installing a UI kit "just for one component" — this breaks the custom design system contract.
- Committing real Supabase keys to `.env` and pushing to a public repo.
- Using `window.location` for routing instead of React Router — breaks SPA navigation and animation transitions.
- Forgetting the SPA rewrite rule on Vercel, causing 404s on direct navigation to `/dashboard` or `/register`.

## Future Expansion
If the project later needs SSR/SEO for the marketing pages specifically, a migration path to Next.js can be considered in Phase 3 — but this is explicitly deferred and must not be pre-optimized for now (no premature abstraction).
