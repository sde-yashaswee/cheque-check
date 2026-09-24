import { Profile } from '@/types'
import { mapSupabaseError } from '@/lib/errors'
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

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw mapSupabaseError(error)

    if (data) {
      return data as Profile
    }

    const { data: existing, error: lookupError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lookupError) throw mapSupabaseError(lookupError)

    if (existing && existing.deleted_at) {
      const { data: reactivated, error: reactError } = await this.supabase
        .from('profiles')
        .update({ deleted_at: null })
        .eq('user_id', user.id)
        .select()
        .single()

      if (reactError) throw mapSupabaseError(reactError)
      return reactivated as Profile
    }

    if (!existing) {
      const { data: newProfile, error: createError } = await this.supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || '',
          },
        ])
        .select()
        .single()

      if (createError) throw mapSupabaseError(createError)
      return newProfile as Profile
    }

    return null
  }

  async update(profile: Partial<Profile>): Promise<Profile> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await this.supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data as Profile
  }

  async delete(): Promise<void> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Not authenticated')

    const { error } = await this.supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) throw mapSupabaseError(error)

    await this.supabase.auth.signOut()
  }
}
