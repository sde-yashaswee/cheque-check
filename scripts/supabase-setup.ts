import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { confirm, input, password } from '@inquirer/prompts'

const root = resolve(import.meta.dirname, '..')
const envPath = resolve(root, '.env.local')
const typesPath = resolve(root, 'src/types/database.types.ts')
const localAllowlistPath = resolve(root, 'supabase/.dev-projects.local.json')

function runSupabase(args: string[], capture = true) {
  return execFileSync('npx.cmd', ['supabase', ...args], {
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

  runSupabase(['login'], false)
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
      message: 'Deploy send-reminders and razorpay-webhook now?',
      default: false,
    })
  ) {
    const secrets = {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: enteredServiceRoleKey,
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
    }
    const secretsFile = resolve(root, '.supabase-secrets.tmp')
    const secretLines = Object.entries(secrets)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
    writeFileSync(secretsFile, `${secretLines.join('\n')}\n`)
    runSupabase(['functions', 'deploy', 'send-reminders'], false)
    runSupabase(['functions', 'deploy', 'razorpay-webhook'], false)
    runSupabase(['secrets', 'set', '--env-file', secretsFile], false)
    unlinkSync(secretsFile)
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
