# End-to-end tests

See [TEST-PLAN.md](TEST-PLAN.md) for the severity-, risk-, frequency-, and complexity-ranked
feature coverage matrix.

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

A `setup` project (`e2e/global.setup.ts`) runs first: it creates a fresh,
confirmed `e2e-` user through the Supabase admin API (avoiding hosted email
confirmation/rate limits), logs in through the real UI, completes the onboarding
wizard, and saves the authenticated session to `e2e/.auth/user.json`
(git-ignored). The `chromium` project depends on `setup` and reuses that
storageState by default, so most feature specs (`cheques`, etc.) start already
logged in with a business set up.

`auth.spec.ts` and `onboarding.spec.ts` opt out of the shared session
(`test.use({ storageState: { cookies: [], origins: [] } })`) and create their
own admin-confirmed users before driving login/logout/onboarding through the
browser. The signup spec covers native required-field validation; password
reset stubs only the email-delivery endpoint so the QA project sends no mail.
Use `example.com` for synthetic user addresses; it is reserved for examples.

## Data reset & cleanup

**Primary (QA):** `scripts/run-e2e-qa.ts` fully resets the QA database before
every run (see above) — this is the normal path and requires no manual
cleanup.

**Alternative (a genuinely shared, non-resettable project):**
`scripts/e2e-cleanup.ts` surgically deletes only `e2e-*@example.com`
tagged users (FK cascades remove their businesses/cheques/parties/accounts)
instead of wiping the whole project:

```bash
npm run test:e2e:cleanup -- --confirm
```

All e2e-created users/businesses/parties/accounts use `e2e-` prefixed
names/emails (see `e2e/fixtures/test-data.ts`) regardless of which cleanup
strategy is in play.

## Production deployment gate

The `e2e` job in `.github/workflows/quality.yml` runs on pull requests to
`main` and on pushes to `main`. To ensure Vercel does not deploy a merge before
the QA run succeeds, configure the GitHub `main` ruleset to require pull
requests, disallow direct pushes/bypasses, and require these status checks:
`Quality / quality` and `Quality / e2e`.

Also enable Vercel's Git deployment check for `Quality / e2e` (and the other
required checks) under the project's Git deployment settings, or disable
automatic Git deployments and deploy from a GitHub Actions job that has
`needs: [quality, e2e]`. This repository has no Vercel deployment job,
so the Vercel project setting is required for a hard deployment gate.

For local QA resets, prefer the Supabase **Session pooler** connection string
for `SUPABASE_DB_URL`; the direct `db.<project-ref>.supabase.co` endpoint may
not be reachable from IPv4-only networks.

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
