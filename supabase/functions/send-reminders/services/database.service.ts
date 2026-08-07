import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Logger } from '../utils/logger.ts'

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async fetchChequesDueToday() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('cheques')
      .select(`
        id,
        amount,
        account:accounts(bank:banks(name)),
        business:businesses(user_id)
      `)
      .eq('status', 'Issued')
      .or(`deposit_date.eq.${today},and(deposit_date.is.null,cheque_date.eq.${today})`);

    if (error) throw error;
    return data;
  }

  async fetchProfiles(userIds: string[]) {
    // Added 'language' to the select query
    const { data: profiles, error: profilesError } = await this.supabase
      .from('profiles')
      .select('user_id, name, phone, voice_call_enabled, language')
      .in('user_id', userIds)
      .eq('voice_call_enabled', true)
      .not('phone', 'is', null);

    if (profilesError) throw profilesError;

    // Fetch Quotas
    const { data: quotas, error: quotasError } = await this.supabase
      .from('user_quotas')
      .select('user_id, used, limit')
      .in('user_id', userIds)
      .eq('feature_id', 'voice_reminder');

    if (quotasError) throw quotasError;

    // Filter profiles that have remaining quota
    return profiles.filter(p => {
      const quota = quotas.find(q => q.user_id === p.user_id);
      return quota && quota.used < quota.limit;
    });
  }

  async incrementVoiceQuota(userId: string) {
    // This is tricky because we don't have the current 'used' value here easily without another query
    // or we can use a RPC or a raw SQL update.
    // Let's just do a simple update for now.
    const { data: quota } = await this.supabase
      .from('user_quotas')
      .select('id, used')
      .eq('user_id', userId)
      .eq('feature_id', 'voice_reminder')
      .single();

    if (quota) {
      await this.supabase
        .from('user_quotas')
        .update({ used: (quota.used || 0) + 1 })
        .eq('id', quota.id);
    }
  }

  async markCallSent(chequeIds: string[]) {
    const { error } = await this.supabase
      .from('cheques')
      .update({ 
        voice_call_sent: true, 
        last_call_at: new Date().toISOString() 
      })
      .in('id', chequeIds);

    if (error) {
      Logger.error("Failed to update cheque status", error);
    }
  }
}
