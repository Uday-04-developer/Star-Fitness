# Prompt 00 — Project Setup & Scaffold

## Objective
Initialize the Vite + React (JavaScript) project, install the exact dependency list, create the full folder structure, and build the design token/global CSS foundation. Produce zero page content in this step — this is pure scaffolding.

## Files to Read
- `docs/00-project.md`
- `docs/01-design.md`
- `docs/02-tech-stack.md`
- `docs/03-folder-structure.md`
- `docs/04-rules.md`

## Files to Modify
Create (do not modify anything else):
- `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `.env.example`, `vercel.json`
- Full empty/skeleton folder tree exactly as specified in `docs/03-folder-structure.md` (folders can contain placeholder `.jsx`/`.module.css` files with minimal working exports if needed to keep the app compiling, but must not contain real page content yet)
- `src/main.jsx`, `src/App.jsx` (with route definitions pointing to placeholder pages that just render their own name, e.g. `<h1>Home</h1>`)
- `src/styles/tokens.css` — implement the FULL color, typography, spacing, and radius token set from `docs/01-design.md` exactly as specified
- `src/styles/global.css` — CSS reset, base body/html styles, font stack, `.sr-only` utility class
- `src/lib/supabaseClient.js` — Supabase client initialized from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `src/lib/constants.js` — `PLAN_DURATIONS` and `EXPIRING_SOON_THRESHOLD_DAYS` per `docs/06-supabase.md` (read that file too before writing this — it's referenced ahead of its own prompt because constants are foundational)

## Rules
- Follow `docs/02-tech-stack.md` package list exactly. Do not add any dependency not listed there.
- Follow `docs/03-folder-structure.md` exactly — no extra top-level folders, no renamed files.
- Set up the `@/` import alias pointing to `src/` in `vite.config.js`.
- The app must run (`npm run dev`) and build (`npm run build`) with zero errors at the end of this step, even though pages are placeholders.
- Do not write any component visual design yet beyond tokens/global CSS — no component-specific CSS Modules in this step except empty placeholder files if strictly required to avoid import errors.

## Expected Result
A running Vite dev server showing a bare-bones app shell with working client-side routing between placeholder pages (`/`, `/about`, `/register`, `/login`, `/dashboard`, `/dashboard/member/:id`, and a 404 catch-all), styled with the base dark background and font from the token system (even though no real UI exists yet, the page background/typography should already reflect the design system).

## Definition of Done
- [ ] `npm install` completes cleanly.
- [ ] `npm run dev` serves the app with no console errors.
- [ ] `npm run build` produces a `dist/` folder with no errors or warnings.
- [ ] Every folder from `docs/03-folder-structure.md` exists.
- [ ] `tokens.css` contains every token listed in `docs/01-design.md`.
- [ ] `.env.example` lists `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with empty values.
- [ ] Navigating directly to each placeholder route works without errors.

## Stop Condition
Stop immediately after scaffolding is complete and verified against the Definition of Done above. Do NOT proceed to build the Home page, Navbar, or any real UI. Report back what was created and wait for explicit approval before continuing to the next prompt.
