import { existsSync, readFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { config, parse } from 'dotenv'

config({ path: '.env.qa' })

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

// Hard safety net: never let a misconfigured .env.qa point at production.
if (existsSync('.env.production')) {
  const prodVars = parse(readFileSync('.env.production'))
  if (
    prodVars.NEXT_PUBLIC_SUPABASE_URL &&
    prodVars.NEXT_PUBLIC_SUPABASE_URL === supabaseUrl
  ) {
    console.error(
      'Refusing to run: .env.qa targets the same Supabase project as .env.production.',
    )
    process.exit(1)
  }
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const skipReset = process.argv.includes('--skip-reset')
const resetOnly = process.argv.includes('--reset-only')

if (!skipReset) {
  console.log(
    `Resetting QA database (${supabaseUrl}) from local migrations + seed...`,
  )
  execFileSync(npx, ['supabase', 'db', 'reset', '--db-url', dbUrl, '--yes'], {
    stdio: 'inherit',
  })
} else {
  console.log('Skipping DB reset (--skip-reset passed).')
}

if (resetOnly) {
  console.log('Done (--reset-only passed, skipping Playwright run).')
  process.exit(0)
}

console.log('Running Playwright e2e suite against QA (production build)...')
const result = spawnSync(npx, ['playwright', 'test'], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_PROD_BUILD: '1' },
})

process.exit(result.status ?? 1)
