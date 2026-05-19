import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validator';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter';
import {
  sendOtpSchema,
  verifyOtpSchema,
  signupSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.validators';

const router = Router();

// ═══════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════
router.post('/otp/send', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/otp/verify', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(signupSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// ═══════════════════════════════════════════════
// PROTECTED ROUTES
// ═══════════════════════════════════════════════
router.post('/logout', authenticate, validate(logoutSchema), authController.logout);
router.get('/sessions', authenticate, authController.getActiveSessions);

export default router;
