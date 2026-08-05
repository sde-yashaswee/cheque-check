# Cheque Reminder

# Product Requirements Document

# Part 4 — API Contracts, Business Logic, State Machines & Development Specification

---

# 1. API Philosophy

The frontend should **never** communicate with PostgreSQL directly.

Instead:

```
UI

↓

Service Layer

↓

Supabase Client

↓

Database
```

Every screen consumes Services.

Never raw SQL inside components.

---

# 2. Folder Structure

```
src/

app/

components/

features/

services/

repositories/

hooks/

types/

lib/

validators/

constants/

supabase/
```

---

# 3. Service Architecture

Every entity has

```
BusinessService

PartyService

BankService

ChequeService

ReminderService

ReportService

SettingsService
```

Each service owns

* CRUD
* Validation
* Business Rules
* Cache Invalidation

---

# 4. BusinessService

## createBusiness()

Input

```
name

email
```

Returns

```
Business
```

Validation

* Name Required
* Email Optional
* Duplicate Name Not Allowed

---

## updateBusiness()

Updates

* Name
* Email

---

## deleteBusiness()

Allowed only when

```
No Cheques

No Parties

No Banks
```

Otherwise

```
Cannot delete business.

Archive instead.
```

Future Feature

---

# 5. PartyService

Methods

```
create()

update()

delete()

search()

getAll()

getById()
```

Validation

Required

```
Name

Phone
```

Duplicate phone allowed.

Duplicate name allowed.

---

# 6. BankService

Methods

```
create()

update()

delete()

search()

getAll()
```

Validation

Required

```
Account Number

IFSC

Bank Name

Account Name
```

---

Cannot delete

If

```
Cheques exist
```

Instead

Disable

Future.

---

# 7. ChequeService

Main Service.

Methods

```
createCheque()

updateCheque()

deleteCheque()

changeStatus()

search()

filter()

getUpcoming()

getToday()

getOverdue()

getDashboard()
```

---

# 8. createCheque()

Validation Order

### Step 1

Amount

> 0

---

### Step 2

Cheque Number

Required

---

### Step 3

Party Exists

---

### Step 4

Bank Exists

---

### Step 5

Business Exists

---

### Save

Return

```
Cheque
```

---

# 9. Update Status API

```
PATCH

/cheques/:id/status
```

Input

```
status
```

Possible Values

```
Cleared

Bounced
```

---

Response

```
Updated Cheque
```

Immediately updates cache.

---

# 10. Dashboard API

Returns everything in ONE request.

```
GET

/dashboard
```

Response

```
Outstanding

Today's Count

Upcoming Count

Overdue Count

Cleared Count

Bounced Count

Today's Cards

Upcoming Cards
```

No multiple API calls.

---

# 11. Search API

```
GET

/search
```

Parameters

```
query

business

status

type
```

Returns

Grouped

```
Cheques

Parties

Banks
```

---

# 12. Report API

```
POST

/export
```

Body

```
Business

Date Range

Status

Party

Bank

Format
```

Returns

```
CSV

PDF
```

---

# 13. State Machine

## Cheque

```
Create

↓

Issued

↓

Cleared
```

or

```
Create

↓

Issued

↓

Bounced
```

---

Received Flow

```
Received

↓

Cleared
```

or

```
Received

↓

Bounced
```

---

Invalid

```
Cleared

↓

Issued
```

Never Allowed.

---

# 14. Swipe Rules

Swipe Right

```
Cleared
```

Swipe Left

```
Bounced
```

---

Already Cleared?

Disable swipe.

Already Bounced?

Disable swipe.

---

# 15. Date Logic

Every login

Calculate

```
Today

Upcoming

Overdue
```

Never store.

Always derived.

---

Pseudo

```
IF

date == today

↓

Today

-------------------

date > today

↓

Upcoming

-------------------

date < today

↓

Overdue
```

---

# 16. Reminder Logic

Every Cheque

Own Reminder Days

If NULL

↓

Use Profile Default

---

Priority

```
Cheque Setting

↓

User Setting

↓

3 Days
```

---

# 17. Voice Reminder Logic

```
Cron

↓

Find Due

↓

Call Queue

↓

Provider

↓

Log Result
```

Retry

```
3 Times
```

Maximum.

---

# 18. Filter Logic

Every screen supports

```
Business

Status

Party

Bank

Type

Date

Amount
```

---

Multiple filters

Allowed

```
Party

+

Upcoming

+

ICICI
```

---

# 19. Sort Logic

Supported

```
Date

Amount

Party

Status

Newest

Oldest
```

---

# 20. Dashboard Logic

Outstanding

```
Issued

+

Received

-

Cleared
```

---

Today's Count

```
Date == Today
```

---

Upcoming

```
Date > Today
```

---

Overdue

```
Date < Today

AND

Status != Cleared
```

---

# 21. Analytics Events

Track

```
Business Created

Party Created

Cheque Created

Cheque Updated

Cheque Deleted

Swipe Cleared

Swipe Bounced

Reminder Sent

Voice Call Success

Export CSV

Export PDF
```

---

# 22. Loading Behaviour

Every API

Uses

Optimistic Updates.

Example

Swipe

↓

Immediately Changes

↓

Backend Sync

↓

Rollback if Failed.

---

# 23. Error Behaviour

Network

↓

Toast

Retry

---

Validation

↓

Inline Error

---

Server

↓

Retry Button

---

# 24. Empty States

Dashboard

```
No Cheques

Create First Cheque
```

---

Parties

```
No Parties

Create Party
```

---

Banks

```
No Banks

Create Bank
```

---

Reports

```
Nothing Found
```

---

# 25. Edge Cases

## Duplicate Cheque Number

Allowed?

Recommendation:

Allow across different bank accounts.

Reject only if:

```
Same Bank

+

Same Business

+

Same Cheque Number
```

---

## Party Deleted

Not Allowed

If Cheques exist.

---

## Bank Deleted

Not Allowed

If Cheques exist.

---

## Business Deleted

Not Allowed

If data exists.

---

## Reminder Days

Negative?

Reject.

---

## Amount

Zero?

Reject.

---

## Future Deposit Date

Allowed.

---

## Deposit Date

Before Cheque Date

Reject.

---

## Reminder

Greater than Date Difference

Clamp automatically.

Example

Cheque

Tomorrow

Reminder

15 Days

↓

Reminder becomes

Today

---

# 26. Permissions

Future

Admin

Staff

Viewer

For MVP

Only Owner.

---

# 27. Performance Targets

Dashboard

<400 ms

---

Search

<100 ms

---

Swipe

<16 ms response

60 FPS

---

Create Cheque

<1 second

---

App Launch

<2 seconds

---

# 28. Development Order (Critical)

This is the sequence I'd follow to ship the MVP efficiently:

### Phase 1 — Foundation

* Project setup
* Supabase
* Authentication
* Theme
* Routing
* Layout

---

### Phase 2 — Database

* Business
* Party
* Bank
* Cheque
* Settings
* Reminder Logs

---

### Phase 3 — CRUD

* Business CRUD
* Party CRUD
* Bank CRUD
* Cheque CRUD

---

### Phase 4 — Dashboard

* Outstanding card
* Status cards
* Today's cheques
* Upcoming cheques

---

### Phase 5 — Swipe

* Swipe right → Cleared
* Swipe left → Bounced
* Undo snackbar

---

### Phase 6 — Search & Filters

* Universal search
* Filter sheets
* Sorting

---

### Phase 7 — Reports

* CSV Export
* PDF Export

---

### Phase 8 — Settings

* Currency
* Date format
* Reminder preferences
* Received cheque toggle

---

### Phase 9 — Reminder Engine

* Cron
* Edge Function
* Reminder logs
* Voice provider interface

---

# 29. Acceptance Criteria

## Authentication

* User can sign up.
* User can sign in.
* Session persists.
* User data is isolated.

---

## Business

* Create, edit, delete (when empty).
* Switch businesses instantly.

---

## Party

* CRUD operations work.
* Search by name or phone.

---

## Bank

* CRUD operations work.
* Search by bank or account.

---

## Cheque

* Create in under 30 seconds.
* Edit.
* Delete.
* Swipe updates status.
* Dashboard reflects changes immediately.

---

## Dashboard

* Counts are accurate.
* Outstanding amount recalculates automatically.
* Today's and Upcoming sections update in real time.

---

## Reports

* CSV exports correctly.
* PDF (if enabled) matches filters.

---

## Settings

* Currency affects formatting everywhere.
* Date format updates globally.
* Reminder defaults apply to new cheques.
* "Received Cheques" toggle hides all related UI when disabled.

---

# 30. Future Roadmap (Post-MVP)

### V1.1

* OCR cheque scanning
* Camera import
* Cheque image attachments

### V1.2

* Push notifications
* WhatsApp reminders
* SMS reminders

### V1.3

* AI-generated voice reminders
* Multi-language voice calls
* Reminder templates

### V2.0

* Staff accounts & roles
* Audit logs
* Shared businesses
* Approval workflows

### V2.1

* Accounting software integrations
* Tally export
* Zoho Books sync
* QuickBooks sync

### V3.0

* AI cash-flow predictions
* Bounce probability scoring
* Smart reminder optimization
* Conversational assistant for cheque insights

---

# 31. Final Product Principles

Every implementation decision should be evaluated against these principles:

1. **Speed over complexity** — A user should complete common tasks in as few taps as possible.
2. **Cheques are the center of the product** — Businesses, parties, and banks exist only to support cheque management.
3. **Mobile-first, portrait-only** — Optimize for one-handed use.
4. **Apple-inspired experience** — Clean typography, spacious layouts, subtle motion, and minimal visual noise, following the uploaded design system. 
5. **Optimistic UI** — Updates should feel instant, with graceful rollback on failure.
6. **Provider-agnostic reminders** — Voice, SMS, and push integrations should remain interchangeable behind a common interface.
7. **Scalable architecture** — Every module should be independently extensible without requiring major redesign.

---

## ✅ PRD Complete

Across Parts 1–4, this PRD defines the product vision, UX, technical architecture, backend design, API contracts, business rules, and implementation roadmap for a production-ready **Cheque Reminder** application. It is intended to serve as the specification for building the MVP and evolving it into a full-featured product over subsequent releases.
