import { Provider, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface IAuthRepository {
  loginWithPassword(
    email: string,
    password: string,
  ): ReturnType<SupabaseClient['auth']['signInWithPassword']>
  signupWithPassword(
    email: string,
    password: string,
    name: string,
  ): ReturnType<SupabaseClient['auth']['signUp']>
  loginWithOAuth(
    provider: Provider,
    redirectTo: string,
  ): ReturnType<SupabaseClient['auth']['signInWithOAuth']>
  signOut(): ReturnType<SupabaseClient['auth']['signOut']>
  resetPassword(
    email: string,
    redirectTo: string,
  ): ReturnType<SupabaseClient['auth']['resetPasswordForEmail']>
  getSession(): ReturnType<SupabaseClient['auth']['getSession']>
  getUser(): ReturnType<SupabaseClient['auth']['getUser']>
}

export class SupabaseAuthRepository implements IAuthRepository {
  private readonly supabase = createClient()

  loginWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password })
  }

  signupWithPassword(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
  }

  loginWithOAuth(provider: Provider, redirectTo: string) {
    return this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  resetPassword(email: string, redirectTo: string) {
    return this.supabase.auth.resetPasswordForEmail(email, { redirectTo })
  }

  getSession() {
    return this.supabase.auth.getSession()
  }

  getUser() {
    return this.supabase.auth.getUser()
  }
}
