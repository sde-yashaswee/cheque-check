import { createClient } from '@/lib/supabase/client'
import { AppError, mapSupabaseError } from '@/lib/errors'

export abstract class SupabaseRepository {
  protected readonly supabase = createClient()

  protected async handle<T>(
    operation: PromiseLike<{ data: T | null; error: any }>,
  ): Promise<T> {
    const { data, error } = await operation

    if (error) {
      throw mapSupabaseError(error)
    }

    if (data === null || data === undefined) {
      throw new AppError('No data returned from the database', 'NO_DATA')
    }

    return data as T
  }

  protected async handleVoid(
    operation: PromiseLike<{ error: any }>,
  ): Promise<void> {
    const { error } = await operation

    if (error) {
      throw mapSupabaseError(error)
    }
  }
}
