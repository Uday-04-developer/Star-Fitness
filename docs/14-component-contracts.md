# Component Contracts

> This document defines the public contract for every reusable component in the Star Fitness Management System.

Every component must follow these contracts.

A component is considered complete only when it satisfies every contract listed below.

---

# Purpose

The goal of this document is to make every component:

Predictable

Reusable

Maintainable

Testable

Consistent

No component should require reading its source code to understand how it works.

---

# General Rules

Every component must:

Have one responsibility.

Accept only the props it actually needs.

Never fetch data unless it is specifically responsible for data.

Never contain duplicated logic.

Never manipulate unrelated state.

Support loading state.

Support empty state where applicable.

Support error state where applicable.

Remain reusable.

---

# Component Categories

Shared Components

Layout Components

Marketing Components

Dashboard Components

Registration Components

Utility Components

---

# Shared Components

---

## Button

Purpose

Reusable action button.

Props

variant

size

disabled

loading

icon

children

onClick

States

Default

Hover

Pressed

Focus

Loading

Disabled

Rules

Never use inline styles.

Always show loading spinner when loading=true.

Never allow multiple clicks while loading.

---

## Input

Purpose

Reusable text input.

Props

label

placeholder

value

onChange

error

required

type

disabled

States

Default

Focus

Error

Disabled

Success

Rules

Always display label.

Never rely only on placeholder.

Show validation message below input.

---

## Modal

Purpose

Reusable dialog.

Props

title

description

children

open

onClose

size

Rules

Trap keyboard focus.

Close on Escape.

Close on backdrop click unless disabled.

Prevent scrolling behind modal.

---

## Search Bar

Purpose

Search members instantly.

Props

placeholder

value

onChange

States

Empty

Searching

Results

No Results

Rules

Debounce input.

Never block typing.

---

# Layout Components

---

## Navbar

Purpose

Primary navigation.

Responsibilities

Navigation.

Theme.

Profile.

Notifications.

States

Desktop

Tablet

Mobile

Scrolled

Transparent

Rules

Sticky.

Responsive.

Glass effect.

---

## Sidebar

Purpose

Dashboard navigation.

States

Collapsed

Expanded

Mobile Drawer

Rules

Accessible.

Keyboard friendly.

---

# Marketing Components

---

## Hero

Purpose

First impression.

Responsibilities

Headline.

CTA.

Statistics.

Background.

Animation.

Rules

Optimized images.

Fast loading.

Responsive.

---

## Feature Card

Purpose

Explain one business benefit.

Props

title

description

icon

Rules

Never exceed three lines of text.

Hover elevation.

Icon animation.

---

## Program Card

Purpose

Display gym program.

Props

image

title

description

features

Rules

Image always fills container.

Graceful fallback.

Hover zoom.

---

## Testimonial Card

Purpose

Display customer review.

Props

photo

name

rating

review

Rules

Support missing photo.

Clamp long text.

---

# Dashboard Components

---

## Stats Card

Purpose

Display dashboard metrics.

Props

title

value

icon

trend

status

Rules

Animated counter.

Icon.

Subtle hover.

---

## Member Card

Purpose

Display one member.

Props

member

onRenew

onDelete

onReminder

onView

Member Object

id

name

phone

photo

joinDate

expiryDate

membership

daysRemaining

status

States

Loading

Active

Expiring

Expired

Missing Photo

Rules

Expired cards appear first.

Status badge always visible.

Show progress indicator.

Never hide important actions.

---

## Status Badge

Purpose

Represent membership status.

Variants

Active

Expiring

Expired

Rules

Use only approved colors.

Always include text.

Never rely only on color.

---

## Progress Ring

Purpose

Visualize remaining membership days.

Props

percentage

status

Rules

Animate once.

Accessible labels.

---

## Renew Modal

Purpose

Renew membership.

Props

member

open

onConfirm

onCancel

Membership Options

1 Month

3 Months

6 Months

12 Months

Rules

Require confirmation.

Prevent duplicate submissions.

---

## WhatsApp Button

Purpose

Open WhatsApp reminder.

Props

member

message

Rules

Generate message automatically.

Never require manual typing.

Open in new tab.

---

# Registration Components

---

## Registration Wizard

Purpose

Guide member through registration.

Steps

Welcome

↓

Details

↓

Camera

↓

Membership

↓

Review

↓

Success

Rules

One step visible at a time.

Progress indicator.

Back button.

Validation before next.

---

## Camera Capture

Purpose

Take selfie.

Props

onCapture

States

Permission

Camera

Preview

Retake

Captured

Error

Rules

Camera only.

No gallery upload.

Allow retake.

Compress image before upload.

---

## Membership Selector

Purpose

Choose plan.

Options

1 Month

3 Months

6 Months

12 Months

Rules

Only one option selectable.

Highlight active selection.

---

## Success Screen

Purpose

Registration completed.

Content

Success Icon

Thank You

Next Steps

Rules

Automatically redirect after delay.

---

# Utility Components

---

## Empty State

Purpose

Display when no data exists.

Props

title

description

action

illustration

Rules

Always include action.

Never leave blank page.

---

## Skeleton Loader

Purpose

Loading placeholder.

Rules

Match final layout.

Prevent layout shift.

---

## Toast

Purpose

User feedback.

Variants

Success

Error

Warning

Info

Duration

3 seconds

Rules

Never overlap important UI.

Queue multiple messages.

---

# Data Contracts

Every Member must contain

id

memberId

name

phone

photoUrl

joinDate

expiryDate

membershipPlan

daysRemaining

status

createdAt

updatedAt

Never assume optional values exist.

Always handle missing data gracefully.

---

# Error Handling

Every component should support:

Loading

Empty

Success

Failure

No component should silently fail.

---

# Accessibility Checklist

Keyboard Navigation

Screen Reader Labels

Visible Focus

Color Contrast

Touch Targets

Semantic HTML

Every reusable component must satisfy this checklist.

---

# Definition of Done

A component is complete when:

Its responsibility is clear.

Its props are documented.

Its states are handled.

Its accessibility is verified.

Its loading state exists.

Its error state exists.

Its animations are complete.

Its responsive behavior is verified.

Its code is reusable.

Its UI matches the design system.

Only then is the component considered production ready.