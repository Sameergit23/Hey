export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Typed error factories ─────────────────────
export const Errors = {
  BadRequest:    (msg: string, details?: unknown) => new AppError(msg, 400, 'BAD_REQUEST', details),
  Unauthorized:  (msg = 'Unauthorized')            => new AppError(msg, 401, 'UNAUTHORIZED'),
  Forbidden:     (msg = 'Forbidden')               => new AppError(msg, 403, 'FORBIDDEN'),
  NotFound:      (msg: string)                     => new AppError(msg, 404, 'NOT_FOUND'),
  Conflict:      (msg: string, details?: unknown)  => new AppError(msg, 409, 'CONFLICT', details),
  TooMany:       (msg = 'Too many requests')       => new AppError(msg, 429, 'RATE_LIMITED'),
  Validation:    (details: unknown)                => new AppError('Validation failed', 422, 'VALIDATION_ERROR', details),
  Internal:      (msg = 'Internal server error')   => new AppError(msg, 500, 'INTERNAL_ERROR', undefined, false),
};

export const isAppError = (e: unknown): e is AppError =>
  e instanceof AppError;
