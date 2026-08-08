# UI Principles

> This document defines the visual behaviour, interaction standards, spacing rules and user experience guidelines for the Star Fitness Management System.

Every screen, component and interaction should follow these principles.

These rules exist to create consistency across the entire product.

---

# Philosophy

The interface should feel like premium commercial software.

Every element should communicate confidence.

Avoid visual noise.

Avoid unnecessary decoration.

Focus on clarity.

The user should always know:

Where they are.

What they can do.

What happens next.

---

# Visual Hierarchy

Information should always appear in this order:

1. Status

2. Primary Action

3. Important Information

4. Secondary Information

5. Decorative Elements

Never allow decorative content to compete with important content.

---

# Layout Principles

Every page should follow the same layout rhythm.

Header

↓

Page Title

↓

Description

↓

Primary Actions

↓

Content

↓

Footer

Never place actions below information that requires scrolling.

---

# Spacing System

Use an 8px spacing system.

4px

8px

16px

24px

32px

48px

64px

80px

120px

Never invent spacing values.

Consistency is more important than precision.

---

# Grid

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

Containers should never exceed 1280px.

---

# Cards

Cards are the foundation of the interface.

Every card should include:

Background Blur

Soft Border

Rounded Corners

Subtle Shadow

Hover Elevation

Cards should never look flat.

Cards should never look heavy.

---

# Buttons

Primary

Red

Secondary

Glass

Danger

Red Outline

Ghost

Transparent

Every button must have:

Hover

Focus

Loading

Disabled

Pressed

States.

Buttons should feel responsive.

---

# Forms

Forms should reduce cognitive load.

Always show labels.

Never rely on placeholders.

Inputs should have:

Default

Hover

Focus

Error

Disabled

Success

States.

Validation should happen before submission.

Never surprise the user.

---

# Search

Search must feel instant.

Debounce input.

Highlight matching results.

Always show an empty state.

Never leave blank screens.

---

# Tables

Avoid traditional tables where possible.

Prefer responsive cards.

Only use tables when comparing many records.

---

# Dashboard

The dashboard answers one question:

"What requires my attention today?"

Important items must always appear first.

Expired members should immediately attract attention.

Statistics should be visible before scrolling.

---

# Empty States

Never show blank screens.

Every empty state should include:

Illustration

Helpful Message

Primary Action

Example

"No members yet."

"Scan the QR code to register your first member."

---

# Loading States

Never show white flashes.

Use skeleton loaders.

Maintain layout stability.

Animations should be subtle.

---

# Error States

Errors should explain:

What happened.

Why it happened.

How to fix it.

Never expose technical errors.

---

# Toast Notifications

Every important action should provide feedback.

Examples

Member Added

Membership Renewed

Reminder Sent

Photo Uploaded

Error Saving Data

Toast duration:

3 seconds

Bottom Right (Desktop)

Bottom Center (Mobile)

---

# Modals

Every modal should:

Explain the action.

Allow cancellation.

Trap keyboard focus.

Close using Escape.

Prevent accidental destructive actions.

---

# Status Colors

Green

Active

Amber

Expiring Soon

Red

Expired

Grey

Disabled

Never invent new status colors.

---

# Icons

Use Lucide React.

Icons support text.

Icons never replace text.

Keep icon sizes consistent.

---

# Motion Principles

Motion should explain change.

Not decorate.

Animations should:

Guide Attention

Show Relationships

Reduce Confusion

Improve Feedback

Never slow the user down.

---

# Animation Duration

Hover

150–250ms

Cards

250ms

Page

500ms

Modal

300ms

Drawer

350ms

Never exceed 600ms unless intentional.

---

# GSAP Guidelines

Animate opacity.

Animate transform.

Avoid animating width or height.

Avoid layout thrashing.

Use stagger carefully.

Respect reduced-motion preferences.

---

# Micro Interactions

Buttons slightly lift.

Cards gently elevate.

Images softly zoom.

Icons rotate subtly.

Inputs glow on focus.

Progress bars animate.

Counters count smoothly.

Nothing should feel abrupt.

---

# Accessibility

Minimum text size

16px

Minimum touch target

44px

Keyboard accessible

Yes

Screen Reader Friendly

Yes

Visible Focus Rings

Required

Color should never be the only indicator.

---

# Responsive Behaviour

Desktop First Dashboard

Mobile First Registration

Navigation adapts naturally.

Avoid horizontal scrolling.

Test common breakpoints.

---

# Performance

Avoid unnecessary re-renders.

Lazy load heavy assets.

Compress images.

Preload hero assets.

Keep animations GPU accelerated.

Target 60 FPS.

---

# Definition of Premium

Premium is not about adding effects.

Premium means:

Consistent spacing.

Perfect alignment.

Meaningful motion.

Readable typography.

Fast interaction.

Polished feedback.

Attention to detail.

If every interaction feels intentional, the product feels premium.