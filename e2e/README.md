# End-to-end tests

Playwright specs run against a **dedicated staging Supabase project** (not the
local `supabase start` instance) since hosted staging is the agreed e2e
backend. Local Supabase is still used for unit tests / `supabase db reset`.

## Setup

1. Point `.env.local` at the staging project:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<staging-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>  # required by the cleanup script only
   ```

2. Install the browser once:

   ```bash
   npm run test:e2e:install
   ```

3. (Recommended before a run) purge previous e2e-tagged data:

   ```bash
   npm run test:e2e:cleanup -- --confirm
   ```

4. Run the suite:

   ```bash
   npm run test:e2e
   ```

Set `PLAYWRIGHT_BASE_URL` to run against an already-running server (e.g. a
production build via `next start`) instead of letting Playwright spawn
`next dev` locally.

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

## Data tagging & cleanup

All e2e-created users use emails matching `e2e-*@e2e.chequecheck.test`
(see `e2e/fixtures/test-data.ts`), and business/party/account names are
prefixed `e2e-`. `scripts/e2e-cleanup.ts` finds users matching that email
pattern via the Supabase admin API and deletes them; FK cascades remove their
businesses/cheques/parties/accounts. The script refuses to run without
`--confirm` and refuses to run unless `NEXT_PUBLIC_SUPABASE_URL` looks like a
staging/local project.

## Conventions

- **Page Object Model**: `e2e/pages/*.page.ts` encapsulate locators + actions
  per page/feature. Specs live in `e2e/specs/*.spec.ts`.
- **Selectors**: prefer `data-testid` (added across the relevant components)
  over text/role selectors for anything inside custom widgets
  (Combobox/Stepper/BankSelector/TagSelector).
- **Unique data**: always generate emails/names via `e2e/fixtures/test-data.ts`
  helpers so parallel/repeated runs never collide on the shared staging DB.

## Out of scope

Google/Facebook OAuth, Razorpay payments, OpenAI OCR cheque-scan extraction,
and reminder (email/SMS) sending are not covered by this suite.
