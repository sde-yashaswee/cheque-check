import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export const ProfileService = {
  async get() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    
    if (!data) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing && existing.deleted_at) {
        // Reactivate soft-deleted profile
        const { data: reactivated, error: reactError } = await supabase
          .from('profiles')
          .update({ deleted_at: null })
          .eq('user_id', user.id)
          .select()
          .single()
        if (reactError) throw reactError
        return reactivated as Profile
      }

      if (!existing) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: user.id, 
            email: user.email,
            name: user.user_metadata?.name || ''
          }])
          .select()
          .single()
        
        if (createError) throw createError
        return newProfile as Profile
      }
    }

    return data as Profile
  },

  async update(profile: Partial<Profile>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  async delete() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) throw error

    await supabase.auth.signOut()
  }
}
