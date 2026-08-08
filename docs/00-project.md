# 00 — Project Overview

## Purpose
This document defines *what* Star Fitness Management System is, *why* it exists, and *what success looks like*. It is the single source of truth that every other document, prompt, and implementation decision must align with. If any later document conflicts with this one, this document wins.

Star Fitness Management System is a production-grade gym membership management platform built for a single gym owner (Lokesh Verma, Star Fitness Gym) who is not technical, runs a small-to-mid-size gym, and needs a fast, premium, reliable tool to replace manual registers/Excel sheets for member management.

## Business Context
- **Owner:** Lokesh Verma
- **Business:** Star Fitness Gym (single-location gym, walk-in + monthly membership model)
- **Primary user of the dashboard:** The gym owner or front-desk staff — non-technical, needs zero training curve.
- **Primary user of registration:** New/renewing gym members, filling out their own details on a shared tablet/phone or via a QR code scan at the front desk.

## Problem Statement
The gym currently manages memberships manually (registers, WhatsApp messages, verbal reminders). This causes:
- Missed renewal reminders → revenue leakage
- No searchable record of who is active/expired
- Slow, error-prone manual registration
- No professional/premium brand impression for a paying member base
- No way to verify a member's identity quickly (no photo record)

## Solution Summary
A two-surface web application:
1. **Public Marketing Site** (Home, About, Navbar) — premium, dark, glassmorphism design that builds trust and represents the gym brand professionally to prospective members and visitors.
2. **Registration Flow** — mobile-first, QR-code accessible, allows a new member to fill their own details and capture a selfie, without staff intervention.
3. **Admin Dashboard** — desktop-first, fast, shows all members, membership status (active/expiring/expired), automatic membership date calculations, WhatsApp reminder trigger, and member cards.

## Core Product Pillars
1. **Speed** — dashboard must feel instant; no unnecessary loaders, no heavy assets, no blocking network waterfalls.
2. **Premium Feel** — dark, glassmorphism, red-accent design language throughout. This is a brand differentiator, not decoration.
3. **Zero Training Needed** — the owner must be able to use the dashboard without documentation or support calls.
4. **Reliability** — membership status and date math must always be correct. This is financial-adjacent data; bugs here directly cost the client money.
5. **Mobile-first Registration, Desktop-first Dashboard** — these are two different device contexts and must be designed for their actual usage context, not a single responsive afterthought.

## Responsibilities of This System
- Register new members (manual entry or QR-triggered self-registration)
- Capture and store a member selfie photo
- Automatically calculate membership start date, end date, and status based on plan duration
- Display all members in a searchable, filterable, sortable dashboard
- Visually flag members who are expiring soon (e.g., within 3 days) or already expired
- Allow the owner to trigger a WhatsApp reminder message to a member (via `wa.me` deep link — no paid WhatsApp Business API in v1)
- Generate a visual "Member Card" (digital ID-style card) per member
- Persist all data in Supabase (Postgres + Auth + Storage)
- Deploy on Vercel with environment-based configuration

## Explicitly Out of Scope (v1)
- Payment gateway integration (Razorpay/Stripe) — manual payment tracking only in v1
- Automated WhatsApp Business API messaging (cron-based auto-send) — v1 uses manual click-to-send deep links
- Multi-gym / multi-branch support
- Staff role management / multiple staff accounts with permissions
- Attendance / biometric check-in tracking
- Native mobile app
- Diet/workout plan modules

These are documented in `09-roadmap.md` as Phase 2+ items. Cursor must **never** implement out-of-scope features unless explicitly instructed in a prompt file.

## Success Criteria (Definition of "Production Ready")
- Dashboard loads and is interactive in under 1.5s on a typical broadband connection with realistic data (up to ~500 members).
- Registration form is fully usable one-handed on a mobile screen (360px width minimum).
- Membership status (Active / Expiring Soon / Expired) is always mathematically correct relative to `plan_start_date` + `plan_duration_days`.
- Zero console errors/warnings in production build.
- No layout shift (CLS) on initial load of any page.
- All Supabase queries are scoped correctly (no data leakage, no unauthenticated writes to sensitive tables).
- The owner (a non-technical person) can register a member and read the dashboard without external help.

## Primary Personas
| Persona | Goal | Device | Frequency |
|---|---|---|---|
| Lokesh (Owner/Staff) | See who's active/expiring, register members, send reminders | Desktop (front desk PC) | Daily |
| New Member | Register quickly, get confirmation | Mobile (own phone via QR) | Once per signup/renewal |
| Prospective Visitor | Learn about the gym, feel it's premium/trustworthy | Mobile or Desktop | Occasional |

## Folder References
This document has no direct folder mapping — it governs `docs/` and `prompts/` as a whole, and by extension the entire `src/` tree defined in `03-folder-structure.md`.

## Acceptance Criteria
- [ ] Every team member/AI agent reading this document understands the product without needing to ask clarifying questions.
- [ ] No feature is implemented that is not traceable to a Core Product Pillar or explicit requirement above.
- [ ] Out-of-scope list is respected in all prompts.

## Common Mistakes to Avoid
- Treating this as a generic "CRUD admin panel" — the premium brand feel is a hard requirement, not a nice-to-have.
- Building the registration flow desktop-first and "making it responsive later." It must be designed mobile-first from the first line of code.
- Adding scope (payments, multi-branch, staff roles) because it "seems easy" — it dilutes focus and delays the v1 the client actually needs.
- Treating WhatsApp integration as full API automation — v1 is intentionally a manual `wa.me` link, which requires zero backend infrastructure or approval process.

## Future Expansion
See `09-roadmap.md` for the full phased plan. In summary: Phase 2 introduces payments and automated reminders; Phase 3 introduces multi-branch and staff roles; Phase 4 introduces attendance tracking.
