import { describe, expect, it } from 'vitest'
import {
  AppError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
  mapSupabaseError,
} from './errors'

describe('mapSupabaseError', () => {
  it('preserves existing application errors', () => {
    const error = new ValidationError('Invalid input')

    expect(mapSupabaseError(error)).toBe(error)
  })

  it('maps known database error codes to typed errors', () => {
    expect(
      mapSupabaseError({ code: '23505', message: 'Duplicate' }),
    ).toBeInstanceOf(ConflictError)
    expect(
      mapSupabaseError({ code: 'PGRST116', message: 'Missing' }),
    ).toBeInstanceOf(NotFoundError)
    expect(
      mapSupabaseError({ code: '42501', message: 'Denied' }),
    ).toBeInstanceOf(ValidationError)
  })

  it('maps unknown values to DatabaseError', () => {
    const error = mapSupabaseError('unexpected')

    expect(error).toBeInstanceOf(DatabaseError)
    expect(error).toBeInstanceOf(AppError)
  })
})
