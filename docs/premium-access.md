# Lifetime Premium implementation plan and access policy

## Scope

1. Centralize entitlement decisions in `usePremiumAccess` and pure access-policy
   helpers. Payment records describe checkout, not feature authorization.
2. Gate Notify Party, contact import, cheque duplication, printing/layouts,
   reports/exports, and the existing inward-cheque option at their entry points
   and execution paths.
3. Add synced Premium workflows: validated bulk imports, reusable cheque
   templates, confirmed bulk status actions, saved filters, party statements,
   consolidated business reporting, and custom message templates.
4. Expose the complete benefit list and lifecycle on Features. Keep AI/Voice
   quotas and subscriptions independent.
5. Validate policy boundaries, free workflows, state transitions, and mobile UI.

## State policy

| Entitlement                    | Premium actions                                      |
| ------------------------------ | ---------------------------------------------------- |
| Loading or fetch error         | Block; show loading or retry, never assume free/paid |
| No grant                       | Block; show upgrade                                  |
| Active, no expiry              | Allow Lifetime Premium                               |
| Active, future expiry          | Allow until expiry                                   |
| Trialing, finite future expiry | Allow the same Premium tools until expiry            |
| Trialing without expiry        | Block invalid grant                                  |
| Paused, canceled, or expired   | Block; preserve saved records                        |

Trials are granted explicitly by an administrator; there is no automatic trial.
Pausing does not freeze an expiry date. Cancellation blocks access immediately.
No feature deletes saved data when access ends. Basic individual cheque and
party CRUD, status changes, search, drafts, and record viewing remain available.
The existing raw CSV download in Settings remains a free data-portability
option; paid reporting, formatted exports, and party statements are separate.
Inward creation keeps its existing Premium requirement.

Created, authorized, captured, failed, and refunded are payment states, not
entitlement states. Checkout success must not grant client-side access. Refresh
authoritative entitlements after payment; only a valid grant enables tools.
An active grant is not revoked because an unrelated later payment failed.
Administrative cancellation/pausing and refund revocation must update the
entitlement, not merely a transaction label.
The current Razorpay webhook fulfills verified `order.paid` events. It does not
automatically process refund, failure, or authorization events. Operational
refunds must update the transaction and explicitly revoke the corresponding
entitlement, checking that a newer purchase has not replaced it. The UI renders
all stored payment states; it never infers access from them.

## Implementation boundaries

Browser-native contact selection, SMS composition, and local print generation
are gated in the app. They never call paid messaging/AI providers. SMS carrier
charges may apply. New server-backed Premium writes and bulk operations require
both ownership and `has_lifetime_premium()` authorization in PostgreSQL.
Existing free CRUD is not restricted to simulate an unbypassable client paywall.

Entitlement queries refresh at expiry and periodically, including background
tabs, and on focus. Gates fail closed on errors. Revocation cannot delete or
hide users' ordinary cheque records.

## Deployment

Apply migrations in timestamp order before deploying code that uses trialing,
paused, or the workspace. Do not auto-reset a shared database. Regenerate
Supabase types against the migrated schema when deployment access is available.
Runtime trials/pauses are not a Razorpay recurring subscription feature and
must not be inferred from Voice Reminder preferences.

## Implemented surfaces

- Existing cheque cards, detail actions, and success notifications share the
  Notify Party guard. SMS uses the current business's saved template and the
  shared validated renderer. A lookup failure is shown and stops composition;
  the default message is used only when no custom template exists.
- Contact selection, duplication, printing/layout editing, reporting, and new
  inward publication use shared access checks. Existing inward records remain
  editable after access ends.
- The Premium workspace contains cheque/party CSV and Excel import previews,
  reusable cheque templates, confirmed bulk status updates, saved views, party
  statements, consolidated reporting, and custom message templates.
- Saved tools are account-synced and business-scoped. Print layouts are synced
  per account. An existing device-local print layout remains the initial value
  only when no synced layout exists; an explicit save syncs it.
- Imports and bulk operations are atomic, bounded to 500 rows/IDs, and validate
  ownership and direction-specific status rules in the database. Import JSON is
  limited to 2 MB. Saved payloads are revalidated before application.
- Features, Settings, Home, Cheques, and Party detail link to the tools.
  Deep links preserve the requested tool's locked-state context.

Use `usePremiumAccess().hasAccess` or `.canUse(feature)` for access decisions.
`hasLifetimePurchase` specifically identifies a current, non-expiring active
grant; it is not true during a trial or a finite active grant. Use
`PremiumGate` for paid screens and `usePremiumAction().verifyAccess(feature)`
before client-side paid execution. Native contact selection uses the
synchronous guard to preserve the browser's required user activation.

Finite active grants remain usable until their end date. Unlike explicit
trials, they cannot start another Lifetime checkout while the existing payment
RPC considers them active; Features directs those users to support.

## Verification and remaining operational steps

Policy, component, workflow, and existing cheque/draft regression tests cover
free, trialing, active, paused, canceled, expired, loading, and failed-fetch
states; automatic expiry; stale-grant rejection; and all stored payment states.
Production build and TypeScript checks pass.

All three migrations were executed against an isolated in-memory PostgreSQL
fixture. Its 23 assertion groups cover authorization, atomic rollback,
ownership, duplicate handling, expiry reads, privileges, print validation, and
unaffected free CRUD. This is not a full production-schema replay or a
multi-connection concurrency test.

Isolated browser fixtures cover all seven paid panels at 320, 390, 430, and
1280 px for active and trialing access, plus paused/expired gates. These checks
perform no real writes, payments, calls, or messages.

The migrations were reported as applied by the project owner on 2026-10-17.
Their deployment has not been independently verified here. For other
environments, deploy them in separate, ordered migration transactions before
enabling the new workspace. Regenerate database types and run authenticated
ownership and cross-device acceptance tests against the migrated environment
before release.
