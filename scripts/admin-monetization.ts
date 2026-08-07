import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Select, Input, Confirm, NumberPrompt } from 'enquirer';

// Types based on the migration schema
type FeatureType = 'ai_scan' | 'voice_reminder' | 'lifetime_premium' | 'ai_scanner_sub' | 'voice_reminder_sub';
type EntitlementStatus = 'active' | 'expired' | 'canceled';
type TransactionStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
type TransactionType = 'lifetime' | 'subscription' | 'top_up';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
}

interface Entitlement {
  id: string;
  user_id: string;
  feature_id: FeatureType;
  status: EntitlementStatus;
  valid_until: string | null;
  razorpay_subscription_id?: string;
}

interface Quota {
  id: string;
  user_id: string;
  feature_id: FeatureType;
  used: number;
  limit: number;
  reset_at: string | null;
}

interface Transaction {
  id: string;
  user_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  feature_id: FeatureType;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('--- ChequeCheck Master Monetization Admin ---');
  
  let currentUser: UserProfile | null = null;

  while (true) {
    if (!currentUser) {
      const searchMethod = await new Select({
        name: 'method',
        message: 'Find user by:',
        choices: ['Email', 'User ID', 'Exit']
      }).run();

      if (searchMethod === 'Exit') break;

      const query = await new Input({
        name: 'query',
        message: `Enter ${searchMethod}:`
      }).run();

      if (searchMethod === 'Email') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, email, name')
          .eq('email', query)
          .single();
        
        if (error || !data) {
          console.error('User not found.');
          continue;
        }
        currentUser = data;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, email, name')
          .eq('user_id', query)
          .single();
        
        if (error || !data) {
          console.error('User not found.');
          continue;
        }
        currentUser = data;
      }
    }

    console.log(`\nActive User: ${currentUser.name} (${currentUser.email}) [ID: ${currentUser.user_id}]`);

    const action = await new Select({
      name: 'action',
      message: 'Choose action:',
      choices: [
        'View Entitlements & Quotas',
        'Manage Entitlements (Add/Remove)',
        'Manage Quotas (Update Limits/Usage)',
        'Manage Transactions (CRUD)',
        'Switch User',
        'Exit'
      ]
    }).run();

    try {
      switch (action) {
        case 'View Entitlements & Quotas':
          await viewStatus(currentUser.user_id);
          break;
        case 'Manage Entitlements (Add/Remove)':
          await manageEntitlements(currentUser.user_id);
          break;
        case 'Manage Quotas (Update Limits/Usage)':
          await manageQuotas(currentUser.user_id);
          break;
        case 'Manage Transactions (CRUD)':
          await manageTransactions(currentUser.user_id);
          break;
        case 'Switch User':
          currentUser = null;
          break;
        case 'Exit':
          process.exit(0);
      }
    } catch (err: any) {
      console.error('Operation failed:', err.message);
    }
  }
}

async function viewStatus(userId: string) {
  const { data: entitlements } = await supabase.from('user_entitlements').select('*').eq('user_id', userId);
  const { data: quotas } = await supabase.from('user_quotas').select('*').eq('user_id', userId);
  const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });

  console.log('\n--- Entitlements ---');
  if (!entitlements?.length) console.log('None');
  entitlements?.forEach((e: Entitlement) => {
    console.log(`- ${e.feature_id}: ${e.status} (Valid until: ${e.valid_until || 'Lifetime'})`);
  });

  console.log('\n--- Quotas ---');
  if (!quotas?.length) console.log('None');
  quotas?.forEach((q: Quota) => {
    console.log(`- ${q.feature_id}: ${q.used} / ${q.limit} (Reset: ${q.reset_at || 'Never'})`);
  });

  console.log('\n--- Recent Transactions ---');
  if (!transactions?.length) console.log('None');
  transactions?.slice(0, 5).forEach((t: Transaction) => {
    console.log(`- ${t.type} | ${t.feature_id} | ${t.amount/100} ${t.currency} | ${t.status} | ${new Date(t.created_at).toLocaleDateString()}`);
  });
}

async function manageEntitlements(userId: string) {
  const subAction = await new Select({
    name: 'subAction',
    message: 'Entitlement Action:',
    choices: ['Add/Enable Feature', 'Deactivate/Remove Feature', 'Back']
  }).run();

  if (subAction === 'Back') return;

  const features: FeatureType[] = ['ai_scan', 'voice_reminder', 'lifetime_premium', 'ai_scanner_sub', 'voice_reminder_sub'];
  
  const featureId = await new Select({
    name: 'feature',
    message: 'Select Feature:',
    choices: features
  }).run() as FeatureType;

  if (subAction === 'Add/Enable Feature') {
    const status = await new Select({
      name: 'status',
      message: 'Status:',
      choices: ['active', 'expired', 'canceled']
    }).run();

    const isLifetime = await new Confirm({
      name: 'isLifetime',
      message: 'Is this a lifetime entitlement?'
    }).run();

    let validUntil = null;
    if (!isLifetime) {
      const days = await new NumberPrompt({
        name: 'days',
        message: 'Valid for how many days?'
      }).run();
      const date = new Date();
      date.setDate(date.getDate() + days);
      validUntil = date.toISOString();
    }

    const { error } = await supabase
      .from('user_entitlements')
      .upsert({
        user_id: userId,
        feature_id: featureId,
        status,
        valid_until: validUntil,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log(`Feature ${featureId} enabled successfully.`);
  } else {
    const { error } = await supabase
      .from('user_entitlements')
      .delete()
      .eq('user_id', userId)
      .eq('feature_id', featureId);
    
    if (error) throw error;
    console.log(`Feature ${featureId} removed successfully.`);
  }
}

async function manageQuotas(userId: string) {
  const features: FeatureType[] = ['ai_scan', 'voice_reminder'];
  
  const featureId = await new Select({
    name: 'feature',
    message: 'Select Feature Quota:',
    choices: features
  }).run() as FeatureType;

  const { data: currentQuota } = await supabase
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .eq('feature_id', featureId)
    .single();

  console.log(`Current: ${currentQuota?.used || 0} / ${currentQuota?.limit || 0}`);

  const newLimit = await new NumberPrompt({
    name: 'limit',
    message: 'Enter new limit:',
    initial: currentQuota?.limit || 0
  }).run();

  const newUsed = await new NumberPrompt({
    name: 'used',
    message: 'Enter used count:',
    initial: currentQuota?.used || 0
  }).run();

  const { error } = await supabase
    .from('user_quotas')
    .upsert({
      user_id: userId,
      feature_id: featureId,
      limit: newLimit,
      used: newUsed,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  console.log('Quota updated successfully.');
}

async function manageTransactions(userId: string) {
  const action = await new Select({
    name: 'action',
    message: 'Transaction Action:',
    choices: ['Create (Simulate Payment)', 'View All', 'Update Status', 'Delete', 'Back']
  }).run();

  if (action === 'Back') return;

  if (action === 'Create (Simulate Payment)') {
    const type = await new Select({
      name: 'type',
      message: 'Transaction Type:',
      choices: ['lifetime', 'subscription', 'top_up']
    }).run() as TransactionType;

    const features: FeatureType[] = ['ai_scan', 'voice_reminder', 'lifetime_premium', 'ai_scanner_sub', 'voice_reminder_sub'];
    const featureId = await new Select({
      name: 'feature',
      message: 'Feature:',
      choices: features
    }).run() as FeatureType;

    const amount = await new NumberPrompt({
      name: 'amount',
      message: 'Amount in INR:'
    }).run();

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        feature_id: featureId,
        amount: amount * 100,
        currency: 'INR',
        status: 'captured',
        razorpay_payment_id: `fake_${Date.now()}`,
        razorpay_order_id: `order_${Date.now()}`
      });

    if (error) throw error;
    console.log('Transaction simulated successfully.');
  } else if (action === 'View All') {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    data?.forEach(t => {
      console.log(`${t.id.slice(0,8)} | ${t.type} | ${t.feature_id} | ${t.amount/100} ${t.currency} | ${t.status}`);
    });
  } else if (action === 'Update Status') {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!data?.length) return console.log('No transactions found.');
    
    const targetId = await new Select({
      name: 'id',
      message: 'Select transaction:',
      choices: data.map(t => ({ name: t.id, message: `${t.id.slice(0,8)} - ${t.type} - ${t.amount/100}` }))
    }).run();

    const newStatus = await new Select({
      name: 'status',
      message: 'New Status:',
      choices: ['created', 'authorized', 'captured', 'refunded', 'failed']
    }).run();

    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', targetId);
    if (error) throw error;
    console.log('Status updated.');
  } else if (action === 'Delete') {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', userId);
    if (!data?.length) return console.log('No transactions found.');

    const targetId = await new Select({
      name: 'id',
      message: 'Select transaction to delete:',
      choices: data.map(t => ({ name: t.id, message: `${t.id.slice(0,8)} - ${t.type}` }))
    }).run();

    const confirm = await new Confirm({ message: 'Are you sure?' }).run();
    if (confirm) {
      const { error } = await supabase.from('transactions').delete().eq('id', targetId);
      if (error) throw error;
      console.log('Transaction deleted.');
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
