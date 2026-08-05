# Cheque Reminder

# Product Requirements Document

# Part 2 — UX, Screens & Interaction Design

> **Design System:** All screens in this section follow the uploaded Apple-inspired design specification for typography, spacing, colors, rounded corners, buttons, cards, and interaction behavior. 

---

# Design Philosophy

The application should never feel like accounting software.

Instead it should feel like:

* Apple Wallet
* Apple Reminders
* Apple Notes
* Apple Health

Large typography.

Large touch targets.

Minimal borders.

Cards over tables.

Animations over confirmations.

Swipe over buttons.

---

# Global Navigation

Bottom Navigation

```
────────────────────────

🏠
Home

📄
Cheques

👥
Parties

⚙️
Settings

────────────────────────
```

Always visible.

Except

* Login
* Signup
* Onboarding
* Full Screen Search

---

# Navigation Style

Every page uses

Large Apple Navigation Bar

Example

```
<

Cheques

                Filter
```

No Material AppBar.

No floating title.

Large Title.

Shrinks while scrolling.

---

# Floating Action Button

Only one FAB exists.

Blue Circular

Bottom Right.

Behavior

Context aware.

Home

↓

Create Cheque

Party Screen

↓

Create Party

Bank Screen

↓

Create Bank

Business Screen

↓

Create Business

---

# Universal Screen Layout

Every screen follows

```
Navigation

↓

Large Title

↓

Search (optional)

↓

Filter Chips

↓

Primary Content

↓

FAB

↓

Bottom Navigation
```

---

# Screen 1

## Splash

Duration

2 seconds

Shows

Logo

Tagline

```
Cheque Reminder

Never miss a cheque again.
```

Fade animation.

---

# Screen 2

## Login

Components

Email

Password

Continue

Google Login

Apple Login (iOS)

Forgot Password

Footer

```
Don't have account?

Create Account
```

---

# Screen 3

## Signup

Fields

Name

Email

Password

Confirm Password

Create Account

Automatically logs in.

---

# Screen 4

## Onboarding

Three Pages.

---

### Page 1

Business

Illustration

Large Heading

```
Manage all your businesses
in one place.
```

Button

Continue

---

### Page 2

Currency

Illustration

Dropdown

Currency

Continue

---

### Page 3

Reminder

Illustration

How many reminders/day

Days before reminder

Finish

---

# Screen 5

# Home

The most important screen.

Structure

```
Business Switcher

↓

Outstanding Card

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

## Business Switcher

Large Chip

```
▼

ABC Industries
```

Tap

↓

Bottom Sheet

Businesses

*

Create

---

## Outstanding Card

```
Outstanding

₹18,40,000

────────────

Issued

₹22L

Received

₹5L
```

Large Amount

SF Pro Display

---

## Status Grid

Apple Cards

2 columns

```
Today

Upcoming

Overdue

Cleared

Bounced

Received
```

Each shows

Number

*

Amount

Example

```
Upcoming

23

₹4.8L
```

---

# Today's Cheques

Wallet Cards

```
₹50,000

ABC Traders

Tomorrow

ICICI

Cheque #12345
```

Tap

↓

Detail

Swipe

↓

Status

---

# Quick Actions

```
＋ Cheque

＋ Party

＋ Bank

＋ Business
```

---

# Screen 6

## Cheque List

Sections

```
Search

↓

Segment

↓

Cards
```

---

Search

Instant

---

Segment

```
All

Today

Upcoming

Overdue

Cleared

Bounced
```

Horizontal Scroll.

---

Cards

Wallet Style.

---

Card Design

```
₹50,000

ABC Traders

Cheque

123456

Tomorrow

Upcoming
```

Footer

```
ICICI

Issued
```

---

# Swipe Actions

Small Swipe

Shows Preview

```
← Bounce

Clear →
```

---

Half Swipe

Reveals buttons

---

Full Swipe

Updates immediately

Shows Snackbar

```
Cheque Cleared

Undo
```

5 seconds.

---

# Long Press

Long Press

↓

Context Menu

```
Open

Edit

Share

Print

Delete
```

---

# Screen 7

## Cheque Detail

Layout

```
Amount

↓

Status Badge

↓

Party

↓

Bank

↓

Dates

↓

Reminder

↓

Notes

↓

Timeline
```

---

Header

Large Amount

```
₹50,000
```

---

Status Pill

Blue

Upcoming

Green

Cleared

Red

Bounced

Orange

Today

Gray

Overdue

---

Timeline

```
Created

Reminder Sent

Voice Call

Cleared
```

Chronological.

---

Bottom Sticky Buttons

```
Edit

Share
```

---

# Screen 8

## Create Cheque

Wizard.

---

Page 1

```
Amount

Cheque Number

Date
```

Continue

---

Page 2

```
Party

Bank

Reminder
```

Continue

---

Page 3

```
Notes

Deposit Date

Save
```

---

Validation

Real-time.

---

Autocomplete

Party

Bank

Searchable.

---

# Screen 9

## Edit Cheque

Same as Create.

Header

```
Edit Cheque
```

Delete Button

Top Right

---

# Screen 10

## Party List

Search

↓

Cards

↓

FAB

---

Party Card

```
Avatar

ABC Traders

9876543210

Outstanding

₹1.2L
```

---

Swipe

Right

Edit

Left

Delete

---

Tap

↓

Party Detail

---

# Screen 11

## Party Detail

```
Avatar

Name

Phone

Email

──────────

Outstanding

Total Cheques

Received

Issued

──────────

Cheque History
```

---

# Screen 12

## Create Party

Fields

Required

Name

Phone

Optional

Email

Address

GST

Notes

---

Save

Blue Pill

---

# Screen 13

## Bank List

Card

```
ICICI

Savings

XXXX4321

12 Cheques
```

---

Tap

↓

Bank Detail

---

# Screen 14

## Create Bank

Fields

Account Name

Bank Name

Account Number

IFSC

Opening Balance (Future)

Save

---

# Screen 15

## Business List

Cards

```
ABC Industries

5 Banks

42 Cheques

₹14L
```

---

# Screen 16

## Create Business

Fields

Business Name

Email

Phone

Address

Logo

---

# Screen 17

## Reports

Sections

Quick Filters

↓

Advanced Filters

↓

Preview

↓

Export

---

Quick Filters

```
Today

Yesterday

Week

Month

Custom
```

---

Advanced

Business

Party

Bank

Status

Type

Keyword

Date

---

Preview

Summary

```
Issued

₹12L

Received

₹8L

Cleared

₹6L
```

---

Export

```
PDF

CSV
```

Native Share Sheet.

---

# Screen 18

## Settings

Sections

General

Notifications

Business

Account

---

General

Currency

Date Format

Theme (Future)

Language (Future)

---

Reminder

Voice Call

ON/OFF

---

Reminder Frequency

```
1

2

3

4
```

Times/day

---

Days Before

```
1

3

5

7

15
```

---

Received Cheque Toggle

```
Receive Cheques

ON
```

OFF

Removes

* Received

* Inward

* Deposit Date

Entire app.

---

# Global Search

Accessible

Top Right

Searches

Business

Party

Bank

Cheque Number

Notes

Amount

Realtime

Grouped Results

---

# Empty States

Home

```
No Cheques

Create your first cheque.
```

---

Party

```
No Parties

Add your first customer.
```

---

Banks

```
No Banks

Add a bank account.
```

---

Reports

```
Nothing found

Try another filter.
```

Large illustration.

One CTA.

---

# Loading States

Never Spinner.

Always Skeletons.

Cards

↓

Gray Skeleton

Wallet Cards

↓

Animated Placeholder

---

# Error States

Network

```
Couldn't connect.

Retry
```

---

Validation

Inline.

Not popup.

---

# Bottom Sheets

Used instead of pages.

Examples

Business Switcher

Filters

Sort

Reminder

Currency

Date Picker

Party Picker

Bank Picker

---

# Search Experience

Tap Search

↓

Expands

↓

Keyboard Opens

↓

Suggestions

↓

Recent Searches

↓

Results

Live.

---

# Animations

Screen Push

300ms

---

Card Tap

Scale

0.97

---

FAB

Morphs

↓

Form

---

Swipe

Spring Animation

Native iOS Feel

---

Bottom Sheet

Slides

With Background Blur

---

Success

Green Check

Haptic

---

Delete

Shake Animation

Confirmation

---

# Haptics

Light

Button Tap

Medium

Swipe Complete

Heavy

Delete

Success

Save

---

# Accessibility

Minimum touch target

44px

Dynamic Font

Supported

VoiceOver Labels

All Buttons

Color Contrast

WCAG AA

Keyboard Safe Area

Always Respected

Landscape

Not Supported

Portrait Only

---

# Design Rules

* One primary action per screen.
* Never more than one floating action button.
* Prefer swipe gestures over explicit action buttons.
* Use bottom sheets for transient tasks (filters, pickers, reminders) instead of navigating to new screens.
* Tables are reserved for exported reports only; in-app data is presented as cards.
* Use skeleton loaders rather than spinners.
* Keep typography large and airy, following the Apple-inspired design tokens from the uploaded design system. 

---

## ✅ Part 2 Complete

Part 2 defines the complete mobile UX, all major screens, interactions, gestures, animation behavior, and the Apple-inspired interface specification.

**Part 3** will cover the technical foundation: **Supabase database schema, entity relationships, authentication, Row Level Security (RLS), Storage, Edge Functions, reminder scheduling, and the voice-calling architecture.**
