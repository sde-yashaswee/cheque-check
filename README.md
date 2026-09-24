# Cheque Check

Cheque Check is a mobile-first cheque management application for businesses. It
tracks outward and inward cheques, parties, bank accounts, reminders, reports,
and paid automation features across multiple businesses.

## Technology

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Supabase Auth, PostgreSQL, Storage, and Edge Functions
- TanStack Query for server-state caching
- Zod and React Hook Form for validation
- next-intl for English, Hindi, and Hinglish messages
- Vitest, Testing Library, and Playwright
- Sentry and Pino for error reporting and structured logs

## Requirements

- Node.js 22
- npm 11
- A Supabase project or local Supabase CLI installation
- Optional provider accounts for OpenAI, Razorpay, Twilio, and Sentry

The repository pins its runtime in `.nvmrc` and `package.json`. Use Node 22 even
if a newer Node version is installed globally.

## Local Setup

1. Install dependencies from the committed lockfile:

   ```bash
   npm ci
   ```

2. Create `.env.local` from `.env.example` and provide the two required
   Supabase values:

   ```text
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. Apply the migrations in `supabase/migrations` to the selected Supabase
   project.

4. Start the application:

   ```bash
   npm run dev
   ```

The app is served at `http://localhost:3000` by default.

## Environment

Core variables are validated when the application starts. Feature-specific
credentials are validated only when that feature is invoked, so contributors
can work on core CRUD without payment or OCR credentials.

| Variable                        | Required for                     |
| ------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | All application functionality    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All application functionality    |
| `OPENAI_API_KEY`                | AI cheque scanning               |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`   | Razorpay Checkout                |
| `RAZORPAY_KEY_ID`               | Creating Razorpay orders         |
| `RAZORPAY_KEY_SECRET`           | Creating Razorpay orders         |
| `RAZORPAY_WEBHOOK_SECRET`       | Razorpay webhook verification    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Admin scripts and Edge Functions |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry telemetry                 |
| `SENTRY_AUTH_TOKEN`             | Sentry source-map uploads        |
| `NEXT_PUBLIC_LOG_LEVEL`         | Client/server log verbosity      |

Never expose service-role, Razorpay secret, OpenAI, Twilio, or webhook secrets
through a `NEXT_PUBLIC_` variable.

## Commands

| Command                    | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | Start the Next.js development server    |
| `npm run build`            | Create a production build               |
| `npm run lint`             | Run ESLint                              |
| `npm run type-check`       | Run strict TypeScript checks            |
| `npm test`                 | Run the Vitest suite once               |
| `npm run test:watch`       | Run Vitest in watch mode                |
| `npm run test:coverage`    | Generate unit-test coverage             |
| `npm run test:e2e:install` | Install Playwright Chromium             |
| `npm run test:e2e`         | Run Playwright tests                    |
| `npm run format`           | Format files changed from `origin/main` |
| `npm run format:check`     | Check formatting for changed files      |

The E2E runner is scaffolded but intentionally has no external-service flows
yet. See `e2e/README.md` before adding tests.

## Architecture

```text
src/app/          Next.js routes, layouts, and API handlers
src/components/   Shared application and UI components
src/hooks/        Query, mutation, form, and business-context hooks
src/services/     Supabase data-access services
src/lib/          Environment, logging, utilities, and Supabase clients
src/validators/   Shared Zod form contracts
src/types/        Application domain types
messages/         Localized message catalogs
supabase/         Migrations and Edge Functions
docs/prd/         Product requirements and acceptance criteria
```

Components should not query Supabase directly. Keep database access in services
and expose it through typed hooks. Server-only credentials belong in server
modules or Edge Functions.

## Database Workflow

- Treat migrations as forward-only once shared or deployed.
- Create a new timestamped migration for every schema, policy, function, or
  storage change.
- Review Row Level Security for every new table and storage policy.
- Generate and commit Supabase database types once type generation is added to
  the repository.
- Deploy `razorpay-webhook` and `send-reminders` Edge Functions separately from
  the Next.js application.

The repository does not currently contain `supabase/seed.sql`, although local
Supabase config references it. Add a deterministic seed before relying on
`supabase db reset` in development or CI.

## Quality Gates

Every pull request and push to `main` runs `.github/workflows/quality.yml`:

1. Reproducible `npm ci`
2. Changed-file formatting
3. ESLint
4. Strict TypeScript
5. Unit tests
6. High/critical production dependency audit
7. Production build

Husky and lint-staged apply ESLint and Prettier to staged files before each
commit. The full repository is not mass-formatted; formatting is enforced
incrementally on changed files.

## Product Documentation

- Product requirements: `docs/prd/`
- Visual system: `DESIGN.md`
- Agent and Next.js version guidance: `AGENTS.md`

## Deployment

Deploy the Next.js application to Vercel or another Node.js 22 platform. Add the
production environment variables before building. Supabase migrations, storage
policies, scheduled jobs, secrets, and Edge Functions must be deployed through
the Supabase workflow for the matching environment.
