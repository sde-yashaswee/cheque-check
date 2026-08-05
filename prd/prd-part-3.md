# Cheque Reminder

# Product Requirements Document

# Part 3 — Technical Architecture, Database, Backend & System Design

---

# Tech Stack

## Frontend

```
Next.js 15 (App Router)

React 19

TypeScript

TailwindCSS

shadcn/ui

Framer Motion

React Hook Form

Zod

TanStack Query

React Swipeable
```

---

## Backend

```
Supabase

Authentication

Postgres

Storage

Realtime

Edge Functions

Cron Jobs
```

---

## Deployment

```
Frontend

↓

Vercel

Backend

↓

Supabase
```

---

## Future Integrations

```
Twilio

Exotel

Knowlarity

MSG91

Plivo
```

For Voice Calls.

---

# Architecture

```
                User

                  │

                  ▼

          Next.js Mobile App

                  │

      ┌───────────┴───────────┐

      ▼                       ▼

 Supabase Auth         Supabase Storage

      ▼

Supabase Database

      ▼

Edge Functions

      ▼

Reminder Scheduler

      ▼

Voice Call Provider

      ▼

Phone Call
```

---

# Authentication

Supabase Auth

Supported

```
Email + Password

Google

Apple
```

Every table uses

```
user_id
```

Never expose another user's data.

---

# Entity Relationship

```
User

│

├── Businesses

│

│

├── Parties

│

│

├── Banks

│

│

└── Cheques
```

Every Business owns

```
Parties

Banks

Cheques
```

---

# Database Schema

---

## Users

Supabase Auth Table

No custom table required.

Profile table instead.

---

## Profiles

```
id

uuid

PK
```

```
user_id

uuid

unique
```

```
name
```

```
email
```

```
currency
```

```
date_format
```

```
reminders_per_day
```

```
default_reminder_days
```

```
received_cheques_enabled
```

```
created_at
```

```
updated_at
```

---

# Businesses

```
id

uuid
```

```
user_id
```

```
name
```

```
email
```

```
phone
```

```
address
```

```
logo_url
```

```
created_at
```

```
updated_at
```

---

# Parties

```
id

uuid
```

```
business_id
```

```
name
```

Required

---

```
contact
```

Required

---

```
email
```

Optional

---

```
address
```

Optional

---

```
notes
```

Optional

---

```
created_at

updated_at
```

---

# Banks

```
id

uuid
```

```
business_id
```

```
bank_name
```

```
account_name
```

```
account_number
```

```
ifsc_code
```

```
created_at

updated_at
```

---

# Cheques

```
id

uuid
```

```
business_id
```

```
party_id
```

```
bank_id
```

```
cheque_number
```

Unique within bank.

---

```
amount

numeric
```

---

```
cheque_date
```

---

```
deposit_date
```

Nullable.

---

```
remind_before_days
```

Overrides default.

---

```
status
```

Enum

```
Issued

Received

Cleared

Bounced
```

---

```
type
```

Enum

```
Outward

Inward
```

---

```
notes
```

---

```
voice_call_sent
```

Boolean

---

```
last_call_at
```

Timestamp

---

```
created_at

updated_at
```

---

# Reminder Logs

Tracks every reminder.

```
id
```

```
cheque_id
```

```
type
```

Enum

```
Push

Voice

SMS
```

---

```
status

Pending

Success

Failed
```

---

```
provider_response
```

---

```
created_at
```

---

# Status Calculation

No DB field.

Computed.

```
Today

Upcoming

Overdue
```

Derived.

```
Today

date == today
```

```
Upcoming

date > today
```

```
Overdue

date < today

AND

not cleared
```

Never store.

Always calculate.

---

# Enums

---

Cheque Status

```
Issued

Received

Cleared

Bounced
```

---

Cheque Type

```
Outward

Inward
```

---

Reminder Status

```
Pending

Sent

Failed
```

---

# Relationships

```
Business

↓

Parties

1:N
```

```
Business

↓

Banks

1:N
```

```
Business

↓

Cheques

1:N
```

```
Party

↓

Cheques

1:N
```

```
Bank

↓

Cheques

1:N
```

---

# Indexes

Cheques

```
business_id
```

```
status
```

```
cheque_date
```

```
party_id
```

```
bank_id
```

```
cheque_number
```

Search speed.

---

# Search

Uses

ILIKE

Across

```
Cheque Number

Party

Amount

Notes
```

---

# Filtering

Supported

```
Business

Party

Bank

Status

Type

Date

Amount

Keyword
```

---

# Sorting

Every list supports

```
Newest

Oldest

Amount

Party

Bank

Date
```

Ascending

Descending

---

# Pagination

Cursor Based

25 records

Infinite Scroll

---

# Realtime

Supabase Realtime

Updates

```
Home

Dashboard

Cheque Status

Counts
```

Immediately.

---

# Row Level Security

Every table

```
user_id == auth.uid()
```

Indirectly through business ownership.

Policies

```
SELECT

INSERT

UPDATE

DELETE
```

All protected.

---

# Storage Buckets

```
logos
```

Business logos

---

```
attachments
```

Cheque Images

Future

---

# Edge Functions

---

Function 1

```
send-reminders
```

Runs

Daily

Checks

```
Today

Tomorrow

Reminder Window
```

Creates

Reminder Jobs.

---

Function 2

```
voice-call
```

Input

```
phone

name

cheque

amount

date
```

Calls Provider.

---

Function 3

```
export-report
```

Returns

PDF

CSV

---

# Reminder Algorithm

Every day

Cron

↓

Find

```
cheque_date

-

remind_before_days
```

Equals today.

↓

Create reminder.

↓

Call provider.

↓

Save log.

---

Example

Cheque

```
10 August
```

Reminder

```
7 Days
```

Cron

```
3 August
```

Voice Call triggered.

---

# Voice Call Flow

```
Cron

↓

Edge Function

↓

Voice API

↓

Phone Rings

↓

Completed

↓

Reminder Log
```

---

# Voice Script

```
Hello.

This is a reminder from Cheque Reminder.

Your cheque number

123456

for

₹50,000

is due on

10 August.

Please take necessary action.

Thank you.
```

Future

AI Voice.

---

# Notification Strategy

Priority

```
1

Push
```

↓

```
2

Voice
```

↓

```
3

SMS
```

Fallback.

---

# Push Notifications

Future

Supabase

*

Firebase

---

# Export

PDF

CSV

Includes

```
Business

Date

Party

Amount

Status

Bank
```

---

# Offline Strategy

TanStack Query

Persistent Cache

Read

Offline

Write

Queue

Sync Later

---

# Error Handling

```
Network

↓

Retry
```

```
Voice Failed

↓

Retry Queue
```

```
Export Failed

↓

Download Later
```

---

# Logging

Supabase Logs

Edge Function Logs

Reminder Logs

Analytics Events

---

# Performance Goals

Home

<500ms

Search

<150ms

Swipe

60 FPS

App Launch

<2s

Reminder Cron

<30s

---

# Security

* HTTPS only
* JWT authentication
* RLS on every table
* Parameterized SQL
* Server-side validation in Edge Functions
* Client-side validation with Zod
* No secrets in the frontend
* Environment variables managed through Vercel and Supabase

---

# File Structure

```text
/app
  /(auth)
    login
    signup

  /(dashboard)
    home
    cheques
    parties
    banks
    businesses
    reports
    settings

/components
  ui/
  cards/
  forms/
  sheets/
  charts/

/lib
  supabase/
  validations/
  hooks/
  utils/

/services
  cheque.service.ts
  party.service.ts
  bank.service.ts
  business.service.ts
  reminder.service.ts

/types
  cheque.ts
  bank.ts
  business.ts
  party.ts

/supabase
  migrations/
  functions/
    send-reminders/
    voice-call/
    export-report/
```

---

# MVP Scope (2-Hour Build)

The application should prioritize the shortest path to a usable product.

### Must Ship

* ✅ Authentication
* ✅ Business CRUD
* ✅ Party CRUD
* ✅ Bank CRUD
* ✅ Cheque CRUD
* ✅ Home Dashboard
* ✅ Swipe to Clear / Bounce
* ✅ Search
* ✅ Filters
* ✅ Settings
* ✅ Report Export (CSV first, PDF optional)
* ✅ Reminder scheduler database model
* ✅ Responsive mobile-only Apple-style UI

### Can Be Stubbed

* Voice call provider integration (implement behind an interface so Twilio/Exotel can be plugged in later)
* Push notifications
* OCR cheque scanning
* AI voice
* Analytics
* Offline sync

---

## ✅ Part 3 Complete

This completes the technical architecture for the MVP, including the database schema, backend services, reminder engine, security model, deployment architecture, and implementation plan. The remaining logical section would be **Part 4: Detailed API Contracts, User Flows, Acceptance Criteria, Edge Cases, and Development Task Breakdown** to make the PRD fully implementation-ready.
