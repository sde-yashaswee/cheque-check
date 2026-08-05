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
      .maybeSingle()

    if (error) throw error
    
    if (!data) {
      // If profile doesn't exist for some reason, create it
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
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    // Also delete user from auth if possible? 
    // Usually only admin can delete users from auth. 
    // But since profiles has ON DELETE CASCADE on user_id in some systems, wait.
    // In our migration, profiles.user_id has ON DELETE CASCADE.
    // But we want to delete the user.
    await supabase.auth.signOut()
  }
}
