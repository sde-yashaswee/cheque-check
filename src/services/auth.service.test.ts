import { describe, expect, it, vi } from 'vitest'
import { AuthService } from './auth.service'
import type { IAuthRepository } from '@/repositories/auth.repository'

describe('AuthService', () => {
  it('delegates password login to the injected repository', async () => {
    const repository = {
      loginWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as unknown as IAuthRepository
    const service = new AuthService(repository)

    await service.loginWithPassword('user@example.com', 'password')

    expect(repository.loginWithPassword).toHaveBeenCalledWith(
      'user@example.com',
      'password',
    )
  })

  it('returns the authenticated user from the repository response', async () => {
    const user = { id: 'user-1' }
    const repository = {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    } as unknown as IAuthRepository
    const service = new AuthService(repository)

    await expect(service.getUser()).resolves.toEqual(user)
  })
})
