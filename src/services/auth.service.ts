import { createClient } from '@/lib/supabase/client'
import { Provider } from '@supabase/supabase-js'

let defaultAuthService: AuthService | undefined

function getDefaultAuthService(): AuthService {
  if (!defaultAuthService) {
    defaultAuthService = new AuthService()
  }

  return defaultAuthService
}

export class AuthService {
  private readonly supabase = createClient()

  static async loginWithPassword(email: string, password: string) {
    return getDefaultAuthService().loginWithPassword(email, password)
  }

  static async signupWithPassword(
    email: string,
    password: string,
    name: string,
  ) {
    return getDefaultAuthService().signupWithPassword(email, password, name)
  }

  static async loginWithOAuth(provider: Provider) {
    return getDefaultAuthService().loginWithOAuth(provider)
  }

  static async signOut() {
    return getDefaultAuthService().signOut()
  }

  static async resetPassword(email: string) {
    return getDefaultAuthService().resetPassword(email)
  }

  static async getSession() {
    return getDefaultAuthService().getSession()
  }

  static async getUser() {
    return getDefaultAuthService().getUser()
  }

  async loginWithPassword(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password })
  }

  async signupWithPassword(email: string, password: string, name: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
  }

  async loginWithOAuth(provider: Provider) {
    return await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async signOut() {
    return await this.supabase.auth.signOut()
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
    })
  }

  async getSession() {
    return await this.supabase.auth.getSession()
  }

  async getUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    return user
  }
}

export const authService = new Proxy(Object.create(AuthService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultAuthService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})
