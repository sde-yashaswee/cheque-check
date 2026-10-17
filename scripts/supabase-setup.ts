import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { confirm, input, password } from '@inquirer/prompts'

const root = resolve(import.meta.dirname, '..')
const envPath = resolve(root, '.env.local')
const typesPath = resolve(root, 'src/types/database.types.ts')
const localAllowlistPath = resolve(root, 'supabase/.dev-projects.local.json')

// Resolve the CLI entry point and invoke it via `node` directly instead of
// the npx.cmd shim: on Windows, spawning a .cmd file routes args through
// cmd.exe, which can fail with EINVAL. Node's own argv handling has no such
// issue (same fix as scripts/run-e2e-qa.ts).
const require = createRequire(import.meta.url)
const supabaseCliEntry = require.resolve('supabase/dist/supabase.js')

function runSupabase(args: string[], capture = true) {
  return execFileSync(process.execPath, [supabaseCliEntry, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  }).trim()
}

function updateEnv(values: Record<string, string>) {
  const current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  const lines = current.split(/\r?\n/).filter(Boolean)
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue
    const index = lines.findIndex((line) => line.startsWith(`${key}=`))
    const line = `${key}=${value}`
    if (index === -1) lines.push(line)
    else lines[index] = line
  }
  writeFileSync(envPath, `${lines.join('\n')}\n`)
}

function addLocalProjectRef(projectRef: string) {
  const current = existsSync(localAllowlistPath)
    ? (JSON.parse(readFileSync(localAllowlistPath, 'utf8')) as {
        projectRefs?: string[]
      })
    : { projectRefs: [] }
  const projectRefs = new Set(current.projectRefs ?? [])
  projectRefs.add(projectRef)
  writeFileSync(
    localAllowlistPath,
    `${JSON.stringify({ projectRefs: [...projectRefs] }, null, 2)}\n`,
  )
}

async function main() {
  console.log('Cheque Check Supabase setup')
  console.log(
    'This links a hosted project, applies migrations, and creates .env.local.\n',
  )

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    console.log(
      'Using SUPABASE_ACCESS_TOKEN from the environment, skipping login.\n',
    )
  } else {
    runSupabase(['login'], false)
  }
  const projectRef = await input({ message: 'Supabase project ref' })
  const dbPassword = await password({ message: 'Database password' })
  runSupabase(
    ['link', '--project-ref', projectRef, '--password', dbPassword],
    false,
  )
  runSupabase(['db', 'push'], false)

  const apiKeysOutput = runSupabase([
    'projects',
    'api-keys',
    '--project-ref',
    projectRef,
    '--output',
    'json',
  ])
  const apiKeys = JSON.parse(apiKeysOutput) as Array<{
    name?: string
    api_key?: string
  }>
  const anonKey = apiKeys.find((key) => key.name === 'anon')?.api_key ?? ''
  const serviceRoleKey =
    apiKeys.find((key) => key.name === 'service_role')?.api_key ?? ''
  const supabaseUrl = await input({
    message: 'Supabase URL',
    default: `https://${projectRef}.supabase.co`,
  })
  const enteredAnonKey =
    anonKey || (await password({ message: 'Supabase anon key' }))
  const enteredServiceRoleKey =
    serviceRoleKey ||
    (await password({ message: 'Supabase service-role key (optional)' }))
  updateEnv({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: enteredAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: enteredServiceRoleKey,
  })

  addLocalProjectRef(projectRef)
  const generatedTypes = runSupabase([
    'gen',
    'types',
    'typescript',
    '--linked',
    '--schema',
    'public',
  ])
  writeFileSync(
    typesPath,
    generatedTypes.endsWith('\n') ? generatedTypes : `${generatedTypes}\n`,
  )

  if (
    await confirm({
      message:
        'Deploy notifications-scheduler, notifications-dispatcher, and razorpay-webhook now?',
      default: false,
    })
  ) {
    // SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are auto-injected into every Edge
    // Function and can't be set as custom secrets (Supabase rejects any
    // secret name starting with `SUPABASE_`).
    const secrets = {
      RAZORPAY_WEBHOOK_SECRET: await password({
        message: 'Razorpay webhook secret (leave blank to skip)',
      }),
      TWILIO_ACCOUNT_SID: await input({
        message: 'Twilio account SID (leave blank to skip)',
      }),
      TWILIO_AUTH_TOKEN: await password({
        message: 'Twilio auth token (leave blank to skip)',
      }),
      TWILIO_FROM_NUMBER: await input({
        message: 'Twilio from number (leave blank to skip)',
      }),
      NOTIFICATIONS_TEST_MODE: (await confirm({
        message:
          'Enable NOTIFICATIONS_TEST_MODE (redirect all voice calls to one test number)?',
        default: true,
      }))
        ? 'true'
        : 'false',
      NOTIFICATIONS_TEST_PHONE: await input({
        message:
          'Test phone number for NOTIFICATIONS_TEST_MODE (E.164, leave blank to skip)',
      }),
    }
    const secretsFile = resolve(root, '.supabase-secrets.tmp')
    const secretLines = Object.entries(secrets)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
    writeFileSync(secretsFile, `${secretLines.join('\n')}\n`)
    runSupabase(['functions', 'deploy', 'notifications-scheduler'], false)
    runSupabase(['functions', 'deploy', 'notifications-dispatcher'], false)
    runSupabase(['functions', 'deploy', 'razorpay-webhook'], false)
    runSupabase(['secrets', 'set', '--env-file', secretsFile], false)
    unlinkSync(secretsFile)
    console.log(
      '\nIMPORTANT: also run these once in the Supabase SQL editor so pg_cron can reach the\n' +
        'functions (secrets, not safe to store in a migration file):\n' +
        `  select vault.create_secret('${supabaseUrl}', 'project_url');\n` +
        "  select vault.create_secret('<paste your service-role key>', 'service_role_key');",
    )
  }

  console.log('\nSetup complete. Review .env.local, then run npm run dev.')
  console.log(
    'Note: hosted projects may require pg_cron and pg_net to be enabled in the Supabase dashboard.',
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
