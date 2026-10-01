import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

/**
 * Purges e2e-tagged users (and their owned data, via FK cascades) from the
 * staging Supabase project before an e2e run. Refuses to run without
 * `--confirm` and refuses to run against anything that doesn't look like a
 * non-production project, so it can never be pointed at real user data.
 */
const E2E_EMAIL_PATTERN = /^e2e-.+@e2e\.chequecheck\.test$/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local or CI secrets).',
  )
  process.exit(1)
}

if (!process.argv.includes('--confirm')) {
  console.error(
    'Refusing to run without --confirm. Re-run as: npm run test:e2e:cleanup -- --confirm',
  )
  process.exit(1)
}

if (!/staging|localhost|127\.0\.0\.1/.test(supabaseUrl)) {
  console.error(
    `Refusing to run: NEXT_PUBLIC_SUPABASE_URL (${supabaseUrl}) doesn't look like a staging/local project.`,
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  let page = 1
  let deleted = 0

  while (true) {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    if (users.length === 0) break

    const e2eUsers = users.filter(
      (user) => user.email && E2E_EMAIL_PATTERN.test(user.email),
    )

    for (const user of e2eUsers) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id,
      )
      if (deleteError) {
        console.error(`Failed to delete ${user.email}:`, deleteError.message)
        continue
      }
      deleted += 1
      console.log(`Deleted e2e user ${user.email}`)
    }

    if (users.length < 200) break
    page += 1
  }

  console.log(`Done. Deleted ${deleted} e2e user(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
