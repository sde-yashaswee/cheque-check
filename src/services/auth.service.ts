import { createClient } from '@/lib/supabase/client'
import { Provider } from '@supabase/supabase-js'

const supabase = createClient()

export class AuthService {
  static async loginWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  static async signupWithPassword(email: string, password: string, name: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
  }

  static async loginWithOAuth(provider: Provider) {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  static async signOut() {
    return await supabase.auth.signOut()
  }

  static async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
    })
  }

  static async getSession() {
    return await supabase.auth.getSession()
  }

  static async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}
