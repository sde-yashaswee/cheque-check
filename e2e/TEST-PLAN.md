# E2E Test Plan — Severity, Risk, Complexity, Frequency

This plan prioritizes the user-facing features in the app, scores them, and assigns a severity
tier that determines whether (and how thoroughly) it's covered by Playwright specs under
`e2e/specs/`. See `e2e/README.md` for how to run the suite and what's structurally out of scope.

## Scoring model

Each flow is scored 1 (low) - 3 (high) on three axes, then mapped to a severity tier:

- **Risk** — impact if this breaks: data loss, incorrect financial state (cheque amounts/status),
  locked-out users, or silent data leakage across businesses score 3; degraded UX with a
  workaround scores 2; cosmetic/informational breakage scores 1.
- **Frequency** — how often a typical active user hits this flow (every session = 3, weekly/
  monthly = 2, rarely/once = 1).
- **Complexity** — engineering complexity of the flow (multi-step forms, gestures, optimistic
  updates, third-party integrations, cross-entity state = 3; a single form or list = 2; static
  content = 1). Higher complexity flows need more edge-case test cases per flow, independent of
  severity.

`Severity = Critical` when Risk=3 and Frequency>=2, or when a first-run flow with Risk=3 blocks
all use of the product. `High` when Risk>=2 and Frequency>=2, or Risk=3 with Frequency=1 that
does not block first use. `Medium` when Risk=2 and Frequency=1, or Risk=1 with Frequency>=2.
`Low` otherwise (Risk=1, Frequency=1, e.g. static pages). Complexity does not change impact
severity; it increases the number of branches and assertions expected in the spec.

## P0 — Critical

Core cheque lifecycle. Breakage here means incorrect financial state or a blocked daily workflow.

| Flow                                                                            | Risk | Freq          | Complexity | Spec                                           |
| ------------------------------------------------------------------------------- | ---- | ------------- | ---------- | ---------------------------------------------- |
| Signup/login/logout/forgot-password                                             | 3    | 3             | 2          | `auth.spec.ts` (existing)                      |
| Onboarding wizard + first-run empty cheque list                                 | 3    | 1 (once/user) | 2          | `onboarding.spec.ts` (existing)                |
| Cheque create (Outward/Inward, invalid-value blocking)                          | 3    | 3             | 3          | `cheques.spec.ts`, `cheque-management.spec.ts` |
| Cheque status transition via swipe + detail actions + pending-status correction | 3    | 3             | 3          | `cheque-management.spec.ts`                    |
| Cheque edit                                                                     | 3    | 2             | 2          | `cheque-management.spec.ts`                    |
| Cheque delete (type-to-confirm)                                                 | 3    | 2             | 2          | `cheque-management.spec.ts`                    |
| Per-business data isolation when switching active business                      | 3    | 2             | 3          | `businesses.spec.ts`                           |
| Dashboard current balance + today's cheque list                                 | 3    | 3             | 2          | `dashboard.spec.ts`                            |

## P1 — High

Frequently used supporting flows; broken state degrades UX but has a workaround.

| Flow                                                        | Risk | Freq | Complexity | Spec                  |
| ----------------------------------------------------------- | ---- | ---- | ---------- | --------------------- |
| Cheque list filter/search/sort (status, party, date/amount) | 2    | 3    | 2          | `cheques.spec.ts`     |
| Cheque/party/account drafts: save, resume, publish          | 2    | 2    | 3          | `drafts.spec.ts`      |
| Tags: create, assign to cheque, verify linked cheque        | 2    | 2    | 2          | `tags.spec.ts`        |
| Party create/edit/delete                                    | 2    | 3    | 2          | `parties.spec.ts`     |
| Account create/edit/delete                                  | 2    | 3    | 2          | `accounts.spec.ts`    |
| Business create/edit/delete                                 | 2    | 1    | 3          | `businesses.spec.ts`  |
| Global search across cheques/parties/accounts               | 2    | 2    | 2          | `search.spec.ts`      |
| Settings > Preferences (currency/date format propagation)   | 2    | 1    | 2          | `preferences.spec.ts` |
| Reports: chart + CSV/JSON/PDF/Excel export (premium-gated)  | 2    | 2    | 3          | `reports.spec.ts`     |
| Settings > Preferences language switch (locale propagation) | 2    | 1    | 2          | `locale.spec.ts`      |

## P2 — Medium

Occasional configuration/management flows; workarounds exist.

| Flow                                                           | Risk | Freq | Complexity | Spec                                             |
| -------------------------------------------------------------- | ---- | ---- | ---------- | ------------------------------------------------ |
| Settings > Notifications (reminder-day save)                   | 1    | 1    | 1          | `settings-misc.spec.ts`                          |
| Settings > Notifications (channel state persists after reload) | 1    | 1    | 2          | `settings-misc.spec.ts`, `notifications.spec.ts` |
| Settings > Transactions route and history view load            | 1    | 1    | 1          | `settings-misc.spec.ts`                          |
| Feedback / NPS prompt                                          | 1    | 1    | 2          | `feedback.spec.ts`                               |
| Premium paywall correctness for non-premium users              | 2    | 1    | 1          | `reports.spec.ts`                                |
| Tags: edit/delete existing tag                                 | 2    | 1    | 2          | `tags.spec.ts`                                   |

## P3 — Low

Static/informational, cosmetic only, rarely changes.

| Flow                                                         | Risk | Freq | Complexity | Spec                   |
| ------------------------------------------------------------ | ---- | ---- | ---------- | ---------------------- |
| About / Help & Support / Privacy Policy / Terms / What's New | 1    | 1    | 1          | `static-pages.spec.ts` |
| Calculator widget (open, compute, reset, close)              | 1    | 2    | 1          | `calculator.spec.ts`   |
| PWA service worker registration                              | 1    | 1    | 1          | `pwa.spec.ts`          |

## Out of scope (unchanged from `e2e/README.md`)

Google/Facebook OAuth, real Razorpay checkout, OpenAI OCR cheque-scan extraction, and reminder
(voice/SMS/email) delivery. Reports/export premium-gating is tested by seeding an entitlement row
directly via `grantLifetimePremium()` in `e2e/admin-client.ts` rather than driving a real payment.

## Shared infrastructure added for this plan

- `e2e/admin-client.ts`: `grantLifetimePremium(userId)` inserts an active `lifetime_premium`
  row into `user_entitlements` so premium-only flows (Reports/export) are reachable without
  Razorpay.
- `src/components/speed-dial-fab.tsx`: `SpeedDialAction.testId` plus testids on the menu toggle
  and edit link — this shared detail-page menu (cheques/parties/accounts/businesses/tags) had no
  testids before, so status-transition/delete/edit actions were only reachable via translated
  text (the app ships `en`/`hi`/`hi-en` locales, so text selectors are unreliable).
- `src/components/ui/delete-dialog.tsx`: `data-testid="delete-dialog-confirm-button"` on the
  shared type-to-confirm delete flow used by cheques/parties/accounts/businesses/tags. The
  confirm-name input already has `id="confirm_name"`, consistent with the rest of the app's form
  selectors.
- `src/app/(dashboard)/settings/preferences/page.tsx`: `testId="preferences-language"` and
  `testId="preferences-time-format"` on the two Combobox fields that previously had none
  (currency/date-format already had testids).
- `src/app/(dashboard)/settings/notifications/page.tsx`: `data-testid` per channel `Switch`
  (`notifications-toggle-${channel.key}`) so each channel can be targeted individually instead
  of only `getByRole('switch').first()`.
- `src/app/onboarding/page.tsx`: `data-testid="onboarding-back-button"` on the stepper's back
  button (previously unreachable except by icon).
