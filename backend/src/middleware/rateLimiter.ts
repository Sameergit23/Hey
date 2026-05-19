import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { config } from '../config/env';

export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: 'Too many requests, please try again later',
        },
      });
    },
  });
};

// ═══════════════════════════════════════════════
// PRESET RATE LIMITERS
// ═══════════════════════════════════════════════

// General API rate limiter
export const apiLimiter = createRateLimiter(
  config.rateLimitWindowMs,
  config.rateLimitMax
);

// Strict limiter for auth endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5 // 5 requests
);

// OTP limiter
export const otpLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  3 // 3 requests
);

// Upload limiter
export const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10 // 10 uploads
);
