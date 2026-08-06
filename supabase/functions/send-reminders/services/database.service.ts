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
    const { data, error } = await this.supabase
      .from('profiles')
      .select('user_id, name, phone, voice_call_enabled, language')
      .in('user_id', userIds)
      .eq('voice_call_enabled', true)
      .not('phone', 'is', null);

    if (error) throw error;
    return data;
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
