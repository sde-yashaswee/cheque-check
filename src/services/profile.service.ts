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
      .single()

    if (error) throw error
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
  }
}
