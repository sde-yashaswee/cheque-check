import { Provider } from '@supabase/supabase-js'
import {
  IAuthRepository,
  SupabaseAuthRepository,
} from '@/repositories/auth.repository'

let defaultAuthService: AuthService | undefined

function getDefaultAuthService(): AuthService {
  if (!defaultAuthService) defaultAuthService = new AuthService()
  return defaultAuthService
}

export class AuthService {
  constructor(
    private readonly repository: IAuthRepository = new SupabaseAuthRepository(),
  ) {}

  static loginWithPassword(email: string, password: string) {
    return getDefaultAuthService().loginWithPassword(email, password)
  }

  static signupWithPassword(email: string, password: string, name: string) {
    return getDefaultAuthService().signupWithPassword(email, password, name)
  }

  static loginWithOAuth(provider: Provider) {
    return getDefaultAuthService().loginWithOAuth(provider)
  }

  static signOut() {
    return getDefaultAuthService().signOut()
  }

  static resetPassword(email: string) {
    return getDefaultAuthService().resetPassword(email)
  }

  static getSession() {
    return getDefaultAuthService().getSession()
  }

  static getUser() {
    return getDefaultAuthService().getUser()
  }

  loginWithPassword(email: string, password: string) {
    return this.repository.loginWithPassword(email, password)
  }

  signupWithPassword(email: string, password: string, name: string) {
    return this.repository.signupWithPassword(email, password, name)
  }

  loginWithOAuth(provider: Provider) {
    return this.repository.loginWithOAuth(
      provider,
      `${window.location.origin}/auth/callback`,
    )
  }

  signOut() {
    return this.repository.signOut()
  }

  resetPassword(email: string) {
    return this.repository.resetPassword(
      email,
      `${window.location.origin}/auth/callback?next=/settings/password`,
    )
  }

  getSession() {
    return this.repository.getSession()
  }

  async getUser() {
    const {
      data: { user },
    } = await this.repository.getUser()
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
