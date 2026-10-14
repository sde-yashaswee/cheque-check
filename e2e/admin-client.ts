import { createClient } from '@supabase/supabase-js'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required env var: ${name} (load it via .env.qa before running Playwright)`,
    )
  }
  return value
}

function createAdminClient() {
  return createClient(
    requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/**
 * Hosted Supabase projects default to requiring email confirmation, which
 * real signups can't complete without an inbox. Force-confirm via the admin
 * API right after signup so login works regardless of the project's auth
 * settings; this is a no-op (idempotent) if confirmation is already off.
 */
export async function confirmUserEmail(email: string) {
  const admin = createAdminClient()
  let page = 1

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) throw error

    const match = data.users.find((user) => user.email === email)
    if (match) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        match.id,
        { email_confirm: true },
      )
      if (updateError) throw updateError
      return
    }

    if (data.users.length < 200) break
    page += 1
  }

  throw new Error(`Could not find a newly signed-up user with email ${email}`)
}
