# Cheque Reminder

## Product Requirements Document (PRD)

### Version 1.0 — Part 1 (Product Foundation)

> **Design Language:** Apple Human Interface inspired, using the uploaded Apple Design System as the single source of truth for colors, typography, spacing, interactions, and component styling. 

---

# 1. Product Overview

## Product Name

**Cheque Reminder**

---

## Elevator Pitch

Cheque Reminder is a mobile-first cheque management platform that helps businesses never miss a cheque again.

It combines:

* Smart cheque tracking
* Business-wise organization
* Automatic reminder voice calls
* Beautiful Apple-inspired UI
* Fast swipe actions
* Powerful reporting

Unlike traditional bookkeeping software, Cheque Reminder focuses on one job:

> **Managing the lifecycle of every cheque from creation until clearance.**

---

# 2. Problem Statement

Small and medium businesses still rely heavily on paper cheques.

Common problems include:

* Forgotten cheque dates
* Bounced cheques
* No reminder system
* Multiple businesses
* Multiple bank accounts
* Poor visibility
* Excel sheets
* WhatsApp reminders
* Manual follow-ups

Result:

* Lost money
* Delayed collections
* Extra bank charges
* Poor cashflow visibility

---

# 3. Product Vision

Become the simplest cheque management application in India.

The app should feel like:

> Apple Reminders + Apple Wallet + Linear

—not like traditional accounting software.

---

# 4. Product Goals

Primary goals

✅ Never miss a cheque

✅ Reduce bounced cheques

✅ One place for all businesses

✅ See cheque health in 5 seconds

Secondary goals

* Voice reminders
* Reports
* Export
* Search
* Fast updates

---

# 5. Success Metrics

## Business Metrics

* Daily Active Users

* Cheques Created

* Reminder Success Rate

* Voice Calls Delivered

* Bounce Rate

* Cleared %

---

## UX Metrics

Time to create cheque

Target:

< 25 seconds

---

Time to update cheque

Target

< 1 second

---

Average taps

Target

< 3

---

# 6. Target Audience

### Primary

Business owners

Wholesalers

Retailers

Distributors

Manufacturers

---

### Secondary

Accountants

Cashiers

Finance executives

---

# 7. Core Principles

## Principle 1

Mobile First

No desktop optimization.

Every interaction assumes one hand usage.

---

## Principle 2

Apple Simplicity

No clutter.

Large typography.

Minimal borders.

Plenty of whitespace.

Native feeling animations.

---

## Principle 3

One Screen = One Purpose

Every screen performs one clear job.

---

## Principle 4

Cheques First

Everything revolves around Cheques.

Businesses, Parties and Banks only support them.

---

# 8. User Journey

```
Install

↓

Login

↓

Create Business

↓

Configure Currency

↓

Configure Reminder

↓

Create Party

↓

Create Bank

↓

Create Cheque

↓

Receive Reminder

↓

Swipe

Cleared

or

Bounced

↓

Reports
```

---

# 9. Information Architecture

```
Authentication

│

├── Login

├── Signup

└── Forgot Password

│

Home

│

├── Today

├── Upcoming

├── Overdue

├── Recent Activity

└── Quick Actions

│

Cheques

│

├── All

├── Issued

├── Received

├── Cleared

├── Bounced

├── Search

└── Filters

│

Parties

│

├── List

├── Add

├── Edit

└── Details

│

Settings

│

├── Businesses

├── Banks

├── Reminder

├── Currency

├── Date Format

├── Export

└── Account
```

---

# 10. Bottom Navigation

Only four tabs.

```
🏠 Home

📄 Cheques

👤 Parties

⚙️ Settings
```

No hamburger menu.

---

# 11. Home Dashboard

The dashboard is the heart of the app.

Sections:

```
Greeting

↓

Business Selector

↓

Outstanding Summary

↓

Status Cards

↓

Today's Cheques

↓

Upcoming

↓

Recent Activity

↓

Quick Actions
```

---

## Outstanding Card

Large Apple Card

```
Outstanding

₹18,42,000

Issued

₹22,00,000

Received

₹3,58,000
```

---

## Status Grid

```
Today

Upcoming

Overdue

Cleared

Bounced

Received
```

Each card displays

Number

*

Amount

---

## Today's Cheques

Apple Wallet inspired cards.

Example

```
₹50,000

ABC Traders

Tomorrow

ICICI Bank

Cheque #245678

Upcoming
```

---

Swipe

→ Cleared

← Bounced

---

# 12. Business Switcher

Every user can own multiple businesses.

Top of Home.

```
▼ ABC Industries

```

Tap

↓

Bottom Sheet

```
ABC Industries

XYZ Traders

Raj Enterprises

+ Add Business
```

---

# 13. Main Navigation Flow

```
Home

↓

Cheque

↓

Detail

↓

Swipe

↓

Completed
```

---

# 14. Primary User Flows

## Create First Business

```
Signup

↓

Business

↓

Currency

↓

Reminder

↓

Home
```

---

## Create Party

```
Home

↓

Parties

↓

+

↓

Enter Name

↓

Phone

↓

Save
```

---

## Create Bank

```
Settings

↓

Banks

↓

+

↓

Save
```

---

## Create Cheque

```
+

↓

Amount

↓

Number

↓

Date

↓

Party

↓

Bank

↓

Reminder

↓

Save
```

---

## Update Status

```
Home

↓

Swipe Right

↓

Cleared
```

or

```
Swipe Left

↓

Bounced
```

Undo Snackbar

5 seconds

---

# 15. Screen Inventory

## Authentication

* Splash
* Login
* Signup
* Forgot Password

---

## Onboarding

Business

Currency

Reminder

Permissions

---

## Home

Dashboard

Business Selector

Quick Actions

---

## Cheques

List

Detail

Create

Edit

Filters

Search

Empty State

---

## Parties

List

Create

Edit

Search

Details

Empty

---

## Banks

List

Create

Edit

Delete

---

## Businesses

List

Create

Edit

Delete

---

## Reports

Filters

Preview

Export PDF

Export CSV

---

## Settings

General

Reminder

Currency

Received Toggle

Account

---

# 16. CRUD Modules

Business

Create

Read

Update

Delete

---

Party

Create

Read

Update

Delete

---

Bank

Create

Read

Update

Delete

---

Cheque

Create

Read

Update

Delete

Swipe Update

---

# 17. Cheque States

Business State

```
Issued

Received

Cleared

Bounced
```

---

Time State

```
Today

Upcoming

Overdue
```

---

Both states exist simultaneously.

Example

```
Issued

+

Upcoming
```

or

```
Received

+

Today
```

---

# 18. Feature Flags

Received Cheques

Boolean

```
ON

Home shows

Received

Issued

Filters

Reports

Creation

```

OFF

```
Hide

Received

Everywhere
```

Simplifies the UI for users who only issue cheques.

---

# 19. Search

Global Search

Searches

* Party

* Bank

* Amount

* Notes

* Cheque Number

* IFSC

Real-time.

---

# 20. Universal Filters

Available everywhere.

Business

↓

Status

↓

Type

↓

Party

↓

Bank

↓

Date

↓

Keyword

↓

Amount

All as Apple-style bottom sheets instead of full-screen filter pages.

---

# 21. Apple Design Guidelines

The UI will strictly follow the uploaded Apple design system:

* SF Pro typography hierarchy
* Large display titles
* Minimal color palette with a single blue accent
* Full-width cards with generous whitespace
* Pill-shaped primary buttons
* Frosted bottom sheets
* Rounded utility cards
* Native-feeling transitions and swipe interactions
* No decorative gradients or heavy shadows beyond the prescribed product-style elevation. 

---

## ✅ Part 1 Complete

This establishes the product foundation, navigation, information architecture, user flows, and screen inventory.

**Part 2** will dive into **every screen specification**, including layouts, interactions, gestures, animations, Apple-style components, swipe behavior, empty states, loading states, and detailed UX for each screen.
