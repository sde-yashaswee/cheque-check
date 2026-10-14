# End-to-end tests

Playwright specs run against the **hosted QA Supabase project** (`.env.qa`),
not local `supabase start`. Each run fully resets that project (migrate +
seed) first, so it's always a clean slate — see `scripts/run-e2e-qa.ts`.

## One-time setup

1. Fill in `.env.qa` (already has `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Add the one
   missing piece, `SUPABASE_DB_URL`: Supabase Dashboard → the QA project →
   Project Settings → Database → Connection string → **Session pooler** tab,
   with the real DB password substituted in.

2. Install the browser once:

   ```bash
   npm run test:e2e:install
   ```

## Running

```bash
npm run test:e2e:qa
```

This single command:

1. Loads `.env.qa`.
2. Refuses to continue if `.env.qa` accidentally points at the same project
   as `.env.production`.
3. Runs `supabase db reset --db-url <SUPABASE_DB_URL> --yes` — drops and
   recreates the QA schema from `supabase/migrations/*`, then runs
   `supabase/seed.sql` (reference data like banks). No Docker/local Supabase
   stack required; this talks directly to the hosted Postgres instance.
4. Runs `playwright test` with `PLAYWRIGHT_PROD_BUILD=1`, which makes
   Playwright's `webServer` build (`next build`) and start (`next start`) a
   production server itself, wait for it, and tear it down after — see
   `playwright.config.ts`.

Flags: `npm run test:e2e:qa -- --skip-reset` (reuse current QA data, just run
tests) or `npm run test:e2e:qa:reset-only` (reset only, don't run tests).

## How sessions work

A `setup` project (`e2e/global.setup.ts`) runs first: it signs up a brand-new
`e2e-` prefixed user through the real `/signup` UI, completes the onboarding
wizard, and saves the authenticated session to `e2e/.auth/user.json`
(git-ignored). The `chromium` project depends on `setup` and reuses that
storageState by default, so most feature specs (`cheques`, etc.) start already
logged in with a business set up.

`auth.spec.ts` and `onboarding.spec.ts` opt out of the shared session
(`test.use({ storageState: { cookies: [], origins: [] } })`) and drive
signup/login/logout/onboarding from scratch with their own fresh users, since
those flows can't be exercised against an already-authenticated/onboarded
session.

Hosted Supabase projects default to requiring email confirmation, which a
real signup can't complete without an inbox. `e2e/admin-client.ts`'s
`confirmUserEmail()` force-confirms each freshly signed-up user via the
service-role admin API right after signup, so login works regardless of the
QA project's "Confirm email" setting.

## Data reset & cleanup

**Primary (QA):** `scripts/run-e2e-qa.ts` fully resets the QA database before
every run (see above) — this is the normal path and requires no manual
cleanup.

**Alternative (a genuinely shared, non-resettable project):**
`scripts/e2e-cleanup.ts` surgically deletes only `e2e-*@e2e.chequecheck.test`
tagged users (FK cascades remove their businesses/cheques/parties/accounts)
instead of wiping the whole project:

```bash
npm run test:e2e:cleanup -- --confirm
```

All e2e-created users/businesses/parties/accounts use `e2e-` prefixed
names/emails (see `e2e/fixtures/test-data.ts`) regardless of which cleanup
strategy is in play.

## Conventions

- **Page Object Model**: `e2e/pages/*.page.ts` encapsulate locators + actions
  per page/feature. Specs live in `e2e/specs/*.spec.ts`.
- **Selectors**: prefer `data-testid` (added across the relevant components)
  over text/role selectors for anything inside custom widgets
  (Combobox/Stepper/BankSelector/TagSelector).
- **Unique data**: always generate emails/names via `e2e/fixtures/test-data.ts`
  helpers so parallel/repeated runs never collide.

## Out of scope

Google/Facebook OAuth, Razorpay payments, OpenAI OCR cheque-scan extraction,
and reminder (email/SMS) sending are not covered by this suite.
