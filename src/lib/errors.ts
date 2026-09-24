export abstract class AppError extends Error {
  readonly code: string
  readonly cause?: unknown

  constructor(message: string, code: string, cause?: unknown) {
    super(message)
    this.name = new.target.name
    this.code = code
    this.cause = cause
  }
}

export class ValidationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NOT_FOUND', cause)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONFLICT', cause)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause)
  }
}

export function mapSupabaseError(error: any): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (!error || typeof error !== 'object') {
    return new DatabaseError('Unknown database error')
  }

  const code = typeof error.code === 'string' ? error.code : undefined
  const message =
    typeof error.message === 'string' && error.message.trim().length > 0
      ? error.message
      : 'Database request failed'

  if (code === '23505') {
    return new ConflictError(message, error)
  }

  if (code === 'PGRST116' || error?.details?.includes('0 rows')) {
    return new NotFoundError(message, error)
  }

  if (code === '42501') {
    return new ValidationError(message, error)
  }

  return new DatabaseError(message, error)
}
