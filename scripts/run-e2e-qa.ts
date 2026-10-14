import { existsSync, readFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { config, parse } from 'dotenv'

config({ path: '.env.qa' })

// Resolve CLI entry points and invoke them via `node` directly instead of the
// npx.cmd/.bin shims: on Windows, spawning a .cmd file routes args through
// cmd.exe, which chokes (EINVAL) on special characters a DB password may
// contain (e.g. `&`). Node's own argv handling has no such issue.
const require = createRequire(import.meta.url)
const supabaseCliEntry = require.resolve('supabase/dist/supabase.js')
const playwrightCliEntry = require.resolve('@playwright/test/cli')

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name} (set it in .env.qa)`)
    process.exit(1)
  }
  return value
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const dbUrl = requireEnv('SUPABASE_DB_URL')

/** Pulls the Supabase project ref out of either a project URL or a Postgres
 * connection string (direct `db.<ref>.supabase.co` or pooler `postgres.<ref>@...`). */
function projectRef(value: string): string | null {
  return (
    value.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ??
    value.match(/db\.([a-z0-9]+)\.supabase\.co/i)?.[1] ??
    value.match(/postgres\.([a-z0-9]+)[:@]/i)?.[1] ??
    null
  )
}

const qaRef = projectRef(supabaseUrl)
const dbUrlRef = projectRef(dbUrl)

// Hard safety net #1: SUPABASE_DB_URL must target the same project as
// NEXT_PUBLIC_SUPABASE_URL in .env.qa — a copy-paste mistake here would
// silently reset the wrong project's database.
if (qaRef && dbUrlRef && qaRef !== dbUrlRef) {
  console.error(
    `Refusing to run: SUPABASE_DB_URL targets project "${dbUrlRef}" but ` +
      `NEXT_PUBLIC_SUPABASE_URL in .env.qa is project "${qaRef}". Fix .env.qa before continuing.`,
  )
  process.exit(1)
}

// Hard safety net #2: never let a misconfigured .env.qa point at production.
if (existsSync('.env.production')) {
  const prodVars = parse(readFileSync('.env.production'))
  const prodRef = prodVars.NEXT_PUBLIC_SUPABASE_URL
    ? projectRef(prodVars.NEXT_PUBLIC_SUPABASE_URL)
    : null
  if (prodRef && (prodRef === qaRef || prodRef === dbUrlRef)) {
    console.error(
      'Refusing to run: .env.qa targets the same Supabase project as .env.production.',
    )
    process.exit(1)
  }
}

const skipReset = process.argv.includes('--skip-reset')
const resetOnly = process.argv.includes('--reset-only')
const playwrightArgs = process.argv
  .slice(2)
  .filter((arg) => arg !== '--skip-reset' && arg !== '--reset-only')

if (!skipReset) {
  console.log(
    `Resetting QA database (${supabaseUrl}) from local migrations + seed...`,
  )
  try {
    execFileSync(
      process.execPath,
      [supabaseCliEntry, 'db', 'reset', '--db-url', dbUrl, '--yes'],
      { stdio: 'inherit' },
    )
  } catch {
    console.error(
      'QA database reset failed. Check the Supabase CLI output above; do not share the database URL or password.',
    )
    process.exit(1)
  }
} else {
  console.log('Skipping DB reset (--skip-reset passed).')
}

if (resetOnly) {
  console.log('Done (--reset-only passed, skipping Playwright run).')
  process.exit(0)
}

console.log('Running Playwright e2e suite against QA (production build)...')
const result = spawnSync(
  process.execPath,
  [playwrightCliEntry, 'test', ...playwrightArgs],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_PROD_BUILD: '1' },
  },
)

process.exit(result.status ?? 1)
