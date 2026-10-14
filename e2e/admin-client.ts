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

export async function createConfirmedE2eUser(user: {
  email: string
  name: string
  password: string
}) {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name },
  })
  if (error) throw error
  if (!data.user) {
    throw new Error(`Supabase did not create e2e user ${user.email}`)
  }
  return data.user
}

/** Seeds an active lifetime-premium entitlement directly, bypassing the real Razorpay checkout. */
export async function grantLifetimePremium(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('user_entitlements').insert({
    user_id: userId,
    feature_id: 'lifetime_premium',
    status: 'active',
  })
  if (error) throw error
}
