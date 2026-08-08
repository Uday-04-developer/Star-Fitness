# Engineering Standards

> This document defines the coding standards for the entire project.

Every implementation must follow these rules.

Breaking these rules requires explicit approval.

---

# Core Philosophy

Write code that another engineer can understand in under five minutes.

Optimize for readability before cleverness.

Build software that is easy to maintain.

---

# Technology Rules

Framework

React

Language

JavaScript only

Do NOT convert the project to TypeScript.

Styling

CSS Modules

Never use Tailwind.

Never use Styled Components.

Never use inline styles unless dynamically required.

Animations

GSAP

Only use Framer Motion when GSAP is unnecessary.

Backend

Supabase

Hosting

Vercel

---

# Folder Rules

Every folder must have one responsibility.

Components

Reusable UI

Pages

Screen composition only

Hooks

Reusable logic only

Services

API communication

Utils

Pure helper functions

Styles

Global styles only

Assets

Static resources

Never mix responsibilities.

---

# Component Rules

Functional Components only.

One component = One responsibility.

Prefer composition over inheritance.

Keep components under approximately 300 lines whenever practical.

Split reusable sections into smaller components.

Do not duplicate JSX.

Never hardcode repeated values.

---

# Naming Convention

Components

PascalCase

Example

MemberCard.jsx

Hooks

camelCase

Example

useMemberStats.js

CSS Modules

MemberCard.module.css

Functions

camelCase

Constants

UPPER_SNAKE_CASE

Folders

camelCase

---

# State Management

Prefer local state.

Lift state only when required.

Avoid prop drilling where context is appropriate.

Do not introduce global state libraries unless necessary.

---

# Styling Rules

CSS Modules only.

Use CSS variables for theme colors.

Avoid !important.

Never use fixed heights unless required.

Prefer Flexbox.

Use Grid for layouts.

Maintain consistent spacing.

---

# Animation Rules

All GSAP logic belongs inside custom hooks or dedicated animation utilities.

Respect prefers-reduced-motion.

Do not animate layout unnecessarily.

Avoid long animations.

Animation should improve usability.

Never sacrifice performance.

---

# Performance Rules

Lazy load large sections.

Memoize expensive computations.

Optimize images.

Avoid unnecessary re-renders.

Avoid anonymous functions inside large lists.

Code split when appropriate.

---

# Accessibility

Keyboard navigation must work.

Use semantic HTML.

Every button requires an accessible label.

Images require alt text.

Focus states must remain visible.

Maintain WCAG AA contrast.

---

# Error Handling

Every async operation must handle:

Loading

Success

Failure

Empty State

Do not silently fail.

---

# Forms

Validate before submission.

Show meaningful validation messages.

Prevent duplicate submissions.

Disable submit while processing.

---

# API Rules

Never expose secrets.

Never hardcode URLs.

Use environment variables.

Centralize API logic.

---

# Code Quality

No dead code.

No commented production code.

No console.log in production.

No duplicated logic.

No unnecessary abstraction.

Prefer simple solutions.

---

# Git

Small commits.

Clear commit messages.

One logical change per commit.

---

# Cursor Rules

Cursor must never:

Rename project architecture.

Introduce unnecessary libraries.

Modify unrelated files.

Refactor without instruction.

Expand scope.

Generate placeholder implementations.

Cursor should stop after completing the assigned task.

Wait for the next prompt.