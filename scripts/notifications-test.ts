// Manually invokes the notifications-scheduler and notifications-dispatcher
// edge functions once, without waiting for the pg_cron ticks. Useful for
// end-to-end testing the Voice reminder pipeline against a real Supabase
// project (local or hosted) before trusting the cron schedule.
//
// Usage: npm run notifications:test
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local',
  )
  process.exit(1)
}

async function invoke(functionName: string) {
  const url = `${supabaseUrl}/functions/v1/${functionName}`
  console.log(`\n→ POST ${url}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: '{}',
  })

  const body = await response.json().catch(() => null)
  console.log(`← ${response.status} ${response.statusText}`)
  console.log(JSON.stringify(body, null, 2))

  if (!response.ok) {
    throw new Error(`${functionName} returned ${response.status}`)
  }
  return body
}

async function main() {
  console.log(
    'Running notifications pipeline once (scheduler -> dispatcher)...',
  )
  await invoke('notifications-scheduler')
  await invoke('notifications-dispatcher')
}

main().catch((error) => {
  console.error('\nnotifications-test failed:', error)
  process.exit(1)
})
