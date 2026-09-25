import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '../src/lib/supabase/tables'
// @ts-ignore
import { Select, Input, Confirm, NumberPrompt } from 'enquirer'

type FeatureType =
  | 'ai_scan'
  | 'voice_reminder'
  | 'lifetime_premium'
  | 'ai_scanner_sub'
  | 'voice_reminder_sub'
type EntitlementStatus = 'active' | 'expired' | 'canceled'
type TransactionStatus =
  'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
type TransactionType = 'lifetime' | 'subscription' | 'top_up'

interface UserProfile {
  id: string
  user_id: string
  email: string | null
  name: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.clear()
  console.log('💎 ChequeCheck Master Monetization Admin 💎\n')

  let currentUser: UserProfile | null = null

  while (true) {
    if (!currentUser) {
      const searchMethod = await new Select({
        name: 'method',
        message: 'Find user by:',
        choices: ['Email', 'User ID', 'Exit'],
      }).run()

      if (searchMethod === 'Exit') break

      const query = await new Input({
        name: 'query',
        message: `Enter ${searchMethod}:`,
      }).run()

      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('id, user_id, email, name')
        .eq(searchMethod === 'Email' ? 'email' : 'user_id', query)
        .single()

      if (error || !data) {
        console.error('❌ User not found.\n')
        continue
      }
      currentUser = data
    }

    console.log(`\n=================================================`)
    console.log(
      `👤 USER: ${currentUser.name || 'Unknown'} | ✉️  ${currentUser.email || 'No Email'} | 🆔 ${currentUser.user_id}`,
    )
    console.log(`=================================================\n`)

    const action = await new Select({
      name: 'action',
      message: 'Select a pane to view and manage:',
      choices: [
        '🎟️  Entitlements (Subscriptions & Features)',
        '📊 Quotas (Usage & Limits)',
        '💳 Transactions (Payments & Top-ups)',
        '🔄 Switch User',
        '❌ Exit',
      ],
    }).run()

    try {
      if (action.includes('Entitlements'))
        await manageEntitlements(currentUser.user_id)
      else if (action.includes('Quotas'))
        await manageQuotas(currentUser.user_id)
      else if (action.includes('Transactions'))
        await manageTransactions(currentUser.user_id)
      else if (action.includes('Switch User')) {
        currentUser = null
        console.clear()
      } else if (action.includes('Exit')) process.exit(0)
    } catch (err: any) {
      console.error('\n❌ Operation failed:', err.message)
    }
  }
}

async function manageEntitlements(userId: string) {
  const { data: entitlements } = await supabase
    .from(TABLES.USER_ENTITLEMENTS)
    .select('*')
    .eq('user_id', userId)

  console.log('\n--- 🎟️  Current Entitlements ---')
  if (!entitlements?.length) {
    console.log('No active entitlements.')
  } else {
    console.table(
      entitlements.map((e) => ({
        Feature: e.feature_id,
        Status: e.status,
        'Valid Until': e.valid_until
          ? new Date(e.valid_until).toLocaleDateString()
          : 'Lifetime',
      })),
    )
  }
  console.log('---------------------------------\n')

  const action = await new Select({
    name: 'action',
    message: 'Action:',
    choices: ['Add/Update Feature', 'Remove Feature', 'Back'],
  }).run()

  if (action === 'Back') return

  const features: FeatureType[] = [
    'ai_scan',
    'voice_reminder',
    'lifetime_premium',
    'ai_scanner_sub',
    'voice_reminder_sub',
  ]
  const featureId = (await new Select({
    name: 'feature',
    message: 'Select Feature:',
    choices: features,
  }).run()) as FeatureType

  if (action === 'Add/Update Feature') {
    const status = await new Select({
      name: 'status',
      message: 'Status:',
      choices: ['active', 'expired', 'canceled'],
    }).run()

    const isLifetime = await new Confirm({
      name: 'isLifetime',
      message: 'Is this a lifetime entitlement?',
    }).run()

    let validUntil = null
    if (!isLifetime) {
      const days = await new NumberPrompt({
        name: 'days',
        message: 'Valid for how many days?',
      }).run()
      const date = new Date()
      date.setDate(date.getDate() + days)
      validUntil = date.toISOString()
    }

    const { error } = await supabase.from(TABLES.USER_ENTITLEMENTS).upsert({
      user_id: userId,
      feature_id: featureId,
      status,
      valid_until: validUntil,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    console.log(`✅ Feature ${featureId} updated successfully.`)
  } else if (action === 'Remove Feature') {
    const { error } = await supabase
      .from(TABLES.USER_ENTITLEMENTS)
      .delete()
      .eq('user_id', userId)
      .eq('feature_id', featureId)
    if (error) throw error
    console.log(`✅ Feature ${featureId} removed.`)
  }
}

async function manageQuotas(userId: string) {
  const { data: quotas } = await supabase
    .from(TABLES.USER_QUOTAS)
    .select('*')
    .eq('user_id', userId)

  console.log('\n--- 📊 Current Quotas ---')
  if (!quotas?.length) {
    console.log('No quotas found.')
  } else {
    console.table(
      quotas.map((q) => ({
        Feature: q.feature_id,
        Used: q.used,
        Limit: q.limit,
        'Reset At': q.reset_at
          ? new Date(q.reset_at).toLocaleDateString()
          : 'Never',
      })),
    )
  }
  console.log('-------------------------\n')

  const action = await new Select({
    name: 'action',
    message: 'Action:',
    choices: ['Update Quota', 'Back'],
  }).run()

  if (action === 'Back') return

  const features: FeatureType[] = ['ai_scan', 'voice_reminder']
  const featureId = (await new Select({
    name: 'feature',
    message: 'Select Feature Quota:',
    choices: features,
  }).run()) as FeatureType

  const currentQuota = quotas?.find((q) => q.feature_id === featureId)

  const newLimit = await new NumberPrompt({
    name: 'limit',
    message: 'Enter new limit:',
    initial: currentQuota?.limit || 0,
  }).run()

  const newUsed = await new NumberPrompt({
    name: 'used',
    message: 'Enter used count:',
    initial: currentQuota?.used || 0,
  }).run()

  const { error } = await supabase.from(TABLES.USER_QUOTAS).upsert({
    user_id: userId,
    feature_id: featureId,
    limit: newLimit,
    used: newUsed,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
  console.log('✅ Quota updated successfully.')
}

async function manageTransactions(userId: string) {
  const { data: transactions } = await supabase
    .from(TABLES.TRANSACTIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  console.log('\n--- 💳 Recent Transactions ---')
  if (!transactions?.length) {
    console.log('No transactions found.')
  } else {
    console.table(
      transactions.slice(0, 10).map((t) => ({
        ID: t.id.slice(0, 8),
        Type: t.type,
        Feature: t.feature_id,
        Amount: `${t.amount / 100} ${t.currency}`,
        Status: t.status,
        Date: new Date(t.created_at).toLocaleDateString(),
      })),
    )
  }
  console.log('------------------------------\n')

  const action = await new Select({
    name: 'action',
    message: 'Action:',
    choices: ['Simulate Payment', 'Update Status', 'Delete', 'Back'],
  }).run()

  if (action === 'Back') return

  if (action === 'Simulate Payment') {
    const type = (await new Select({
      name: 'type',
      message: 'Type:',
      choices: ['lifetime', 'subscription', 'top_up'],
    }).run()) as TransactionType
    const features: FeatureType[] = [
      'ai_scan',
      'voice_reminder',
      'lifetime_premium',
      'ai_scanner_sub',
      'voice_reminder_sub',
    ]
    const featureId = (await new Select({
      name: 'feature',
      message: 'Feature:',
      choices: features,
    }).run()) as FeatureType
    const amount = await new NumberPrompt({
      name: 'amount',
      message: 'Amount in INR:',
    }).run()

    const { error } = await supabase.from(TABLES.TRANSACTIONS).insert({
      user_id: userId,
      type,
      feature_id: featureId,
      amount: amount * 100,
      currency: 'INR',
      status: 'captured',
      razorpay_payment_id: `fake_${Date.now()}`,
      razorpay_order_id: `order_${Date.now()}`,
    })

    if (error) throw error
    console.log('✅ Transaction simulated.')
  } else if (action === 'Update Status') {
    if (!transactions?.length) return console.log('No transactions to update.')
    const targetId = await new Select({
      name: 'id',
      message: 'Select transaction:',
      choices: transactions.map((t) => ({
        name: t.id,
        message: `${t.id.slice(0, 8)} - ${t.type} - INR ${t.amount / 100}`,
      })),
    }).run()
    const newStatus = await new Select({
      name: 'status',
      message: 'New Status:',
      choices: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    }).run()

    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .update({ status: newStatus })
      .eq('id', targetId)
    if (error) throw error
    console.log('✅ Status updated.')
  } else if (action === 'Delete') {
    if (!transactions?.length) return console.log('No transactions to delete.')
    const targetId = await new Select({
      name: 'id',
      message: 'Select transaction to delete:',
      choices: transactions.map((t) => ({
        name: t.id,
        message: `${t.id.slice(0, 8)} - ${t.type}`,
      })),
    }).run()

    const confirm = await new Confirm({ message: 'Are you sure?' }).run()
    if (confirm) {
      const { error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .delete()
        .eq('id', targetId)
      if (error) throw error
      console.log('✅ Transaction deleted.')
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
