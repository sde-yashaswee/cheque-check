import { createClient } from '@/lib/supabase/client';

export interface Entitlement {
  id: string;
  user_id: string;
  feature_id: string;
  status: 'active' | 'expired' | 'canceled';
  valid_until: string | null;
}

export interface Quota {
  id: string;
  user_id: string;
  feature_id: string;
  used: number;
  limit: number;
  reset_at: string | null;
}

export class MonetizationService {
  static async getEntitlements(): Promise<Entitlement[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  }

  static async getQuotas(): Promise<Quota[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  }
} 