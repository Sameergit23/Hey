import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import logger from '../lib/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // ═══════════════════════════════════════════════
  // APP ERROR (Custom)
  // ═══════════════════════════════════════════════
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // ═══════════════════════════════════════════════
  // ZOD VALIDATION ERROR
  // ═══════════════════════════════════════════════
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // ═══════════════════════════════════════════════
  // PRISMA ERRORS
  // ═══════════════════════════════════════════════
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: ERROR_CODES.USER_ALREADY_EXISTS,
          message: 'Resource already exists',
          details: err.meta,
        },
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
      });
    }
  }

  // ═══════════════════════════════════════════════
  // JWT ERRORS
  // ═══════════════════════════════════════════════
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token expired',
      },
    });
  }

  // ═══════════════════════════════════════════════
  // MULTER ERRORS
  // ═══════════════════════════════════════════════
  if (err.name === 'MulterError') {
    if (err.message.includes('File too large')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: 'File size exceeds limit',
        },
      });
    }
  }

  // ═══════════════════════════════════════════════
  // DEFAULT ERROR
  // ═══════════════════════════════════════════════
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
  });
};
