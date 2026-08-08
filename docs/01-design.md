# 01 — Design System

## Purpose
Defines the exact visual language of Star Fitness Management System so that every screen, component, and future addition looks like it was designed by the same person in the same sitting. This document is the design contract — Cursor must not invent colors, spacing, or type scales outside of what is defined here.

## Design Philosophy
**Premium. Dark. Glassmorphism. Red Accent. Modern. Fast. Minimal. Professional.**

No flashy effects. No unnecessary 3D. No gradients-for-the-sake-of-gradients. No stock "SaaS dashboard" purple. Every visual decision should feel intentional and restrained — like Linear or Stripe's dashboard, not like a template marketplace theme.

## Responsibilities
- Define the color system (base + semantic tokens)
- Define typography scale and font pairing
- Define spacing, radius, elevation, and glassmorphism recipe
- Define motion principles (detailed further in `05-animation.md`)
- Define responsive breakpoints
- Define component visual states (hover, active, disabled, loading, error)

## Color System

### Base Palette (Dark Theme — only theme in v1, no light mode)
| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#0A0A0B` | App background, deepest layer |
| `--color-bg-surface` | `#131316` | Card/panel background (pre-glass) |
| `--color-bg-elevated` | `#1B1B1F` | Modals, popovers, dropdowns |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Default borders |
| `--color-border-strong` | `rgba(255,255,255,0.16)` | Hover/focus borders |
| `--color-text-primary` | `#F5F5F7` | Headings, primary content |
| `--color-text-secondary` | `#A1A1AA` | Supporting text |
| `--color-text-muted` | `#6B6B70` | Disabled/placeholder |

### Accent — Electric Teal (gym energy)
| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#00C8B8` | Primary CTA, active states, brand mark |
| `--color-accent-hover` | `#2EE6D8` | Hover state of accent elements |
| `--color-accent-muted` | `rgba(0,200,184,0.14)` | Accent background tints (badges, chips) |
| `--color-accent-glow` | `rgba(0,200,184,0.38)` | Box-shadow glow on primary CTA hover only |

### Semantic (Status) Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#22C55E` | Active membership |
| `--color-warning` | `#F59E0B` | Expiring soon (≤3 days) |
| `--color-danger` | `#EF4444` | Expired membership |
| `--color-info` | `#3B82F6` | Neutral informational states |

**Rule:** Teal accent (`--color-accent`) is reserved for brand/CTA/primary actions. It must never be reused as a status color for "expired" — expired uses `--color-danger` (a distinct red), so brand accent and danger status stay visually separate. This distinction is intentional and must be preserved.

## Glassmorphism Recipe
Every "glass" surface (cards, navbar, modals) uses this exact recipe — do not deviate per-component:

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: var(--radius-lg);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

On hover (interactive glass elements only):
```css
background: rgba(255, 255, 255, 0.06);
border-color: rgba(255, 255, 255, 0.16);
```

**Constraint:** Glassmorphism must always sit on top of a background with visual variation (gradient mesh, subtle noise, or an image) — glass on a flat solid color looks broken. The homepage hero must have a subtle dark radial gradient or mesh behind glass panels.

## Typography
- **Primary font:** `Inter` (UI text, body, dashboard) — loaded via `next/font`-equivalent self-hosted strategy or system font stack fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif`.
- **Display font:** `Inter` at heavy weight (700–800) for headings — do not introduce a second decorative font. One font family, multiple weights, keeps it disciplined and fast-loading.

### Type Scale
| Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-display` | 56px / 1.1 | 800 | Hero headline (desktop) |
| `--text-h1` | 40px / 1.15 | 700 | Page titles |
| `--text-h2` | 28px / 1.2 | 700 | Section titles |
| `--text-h3` | 20px / 1.3 | 600 | Card titles |
| `--text-body-lg` | 18px / 1.5 | 400 | Lead paragraphs |
| `--text-body` | 15px / 1.5 | 400 | Default UI text |
| `--text-sm` | 13px / 1.4 | 500 | Labels, meta text |
| `--text-xs` | 11px / 1.3 | 600 | Badges, uppercase tags |

Mobile scale reduces `--text-display` to 34px and `--text-h1` to 28px — defined precisely in `03-folder-structure.md`'s tokens file, not improvised per component.

## Spacing & Radius
- Spacing scale is 4px-based: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Radius scale: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 24px`, `--radius-full: 999px`.
- Cards use `--radius-lg`. Buttons use `--radius-md`. Avatars/badges use `--radius-full`.

## Elevation
No drop-shadow skeuomorphism. Elevation is communicated via:
1. Background luminance (elevated = lighter surface)
2. Border brightness
3. Blur intensity
Never via colored shadows except the accent glow on primary CTA hover.

## Iconography
- **Lucide React only.** No mixing icon sets. Stroke width `1.75`. Default size `20px` inline, `24px` in nav/buttons.

## Responsive Breakpoints
| Name | Width | Primary Context |
|---|---|---|
| `mobile` | 0–639px | Registration flow primary target |
| `tablet` | 640–1023px | Front-desk tablet, QR scan device |
| `desktop` | 1024–1439px | Dashboard primary target |
| `wide` | 1440px+ | Dashboard, marketing hero |

## Component Visual States
Every interactive component must explicitly define, at minimum:
- Default
- Hover (desktop only — never simulate hover on touch)
- Active/Pressed
- Focus-visible (accessible outline: 2px solid `--color-accent`, offset 2px)
- Disabled (opacity 0.4, cursor not-allowed, no hover transitions)
- Loading (skeleton or spinner — never a blank flash)

## Folder References
- Design tokens live in `src/styles/tokens.css`
- Global resets/base styles in `src/styles/global.css`
- Referenced by every `*.module.css` file via CSS custom properties (never hardcode hex values in component CSS Modules)

## Best Practices
- Always reference CSS variables, never hardcoded hex in component files.
- Keep contrast ratio ≥ 4.5:1 for body text against backgrounds (verify `--color-text-secondary` on `--color-bg-surface`).
- Motion and color changes should never be the *only* signal for status — always pair color with an icon or text label (accessibility).
- Keep the glass effect performant — `backdrop-filter` is GPU-expensive; do not stack more than 2 blurred layers in the same viewport.

## Acceptance Criteria
- [ ] All colors used in the app trace back to a token in this document.
- [ ] No component introduces a new font family.
- [ ] No component uses `box-shadow` with a colored glow except the primary CTA.
- [ ] Contrast passes WCAG AA for all text/background pairs actually used.

## Common Mistakes
- Using pure black (`#000000`) instead of `--color-bg-base` — pure black looks cheap against glass blur.
- Overusing the accent red — it should feel rare and important, not decorate every icon.
- Applying glassmorphism to small elements like badges/chips — glass is reserved for cards, nav, and modals; small elements use solid `--color-accent-muted` fills instead.
- Adding drop shadows everywhere "to make it pop" — this directly contradicts the minimal/premium brief.

## Future Expansion
Light mode is not in v1 but token architecture (CSS custom properties) is chosen specifically so a `[data-theme="light"]` override block can be added later without refactoring components.
