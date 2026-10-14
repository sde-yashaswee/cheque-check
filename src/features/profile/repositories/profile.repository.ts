import { Profile } from '@/types'
import { TABLES } from '@/lib/supabase/tables'
import { SupabaseRepository } from './base.repository'

export interface IProfileRepository {
  get(): Promise<Profile | null>
  update(profile: Partial<Profile>): Promise<Profile>
  delete(): Promise<void>
}

export class SupabaseProfileRepository
  extends SupabaseRepository
  implements IProfileRepository
{
  async get(): Promise<Profile | null> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return null

    const data = await this.query(
      this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle(),
    )

    if (data) {
      return data as Profile
    }

    const existing = (await this.query(
      this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
    )) as (Profile & { deleted_at: string | null }) | null

    if (existing && existing.deleted_at) {
      return this.handle<Profile>(
        this.supabase
          .from(TABLES.PROFILES)
          .update({ deleted_at: null })
          .eq('user_id', user.id)
          .select()
          .single(),
      )
    }

    if (!existing) {
      return this.handle<Profile>(
        this.supabase
          .from(TABLES.PROFILES)
          .insert([
            {
              user_id: user.id,
              email: user.email,
              name: user.user_metadata?.name || '',
            },
          ])
          .select()
          .single(),
      )
    }

    return null
  }

  async update(profile: Partial<Profile>): Promise<Profile> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Not authenticated')

    return this.handle<Profile>(
      this.supabase
        .from(TABLES.PROFILES)
        .update(profile)
        .eq('user_id', user.id)
        .select()
        .single(),
    )
  }

  async delete(): Promise<void> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Not authenticated')

    await this.handleVoid(
      this.supabase
        .from(TABLES.PROFILES)
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id),
    )

    await this.supabase.auth.signOut()
  }
}
