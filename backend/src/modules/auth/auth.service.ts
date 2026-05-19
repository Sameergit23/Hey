import { nanoid } from 'nanoid';
import { addMinutes, addDays } from 'date-fns';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { jwtService } from '../../services/jwt.service';
import { twilioService } from '../../services/twilio.service';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS, REDIS_KEYS } from '../../config/constants';
import { config } from '../../config/env';
import logger from '../../lib/logger';

class AuthService {
  // ═══════════════════════════════════════════════
  // SEND OTP
  // ═══════════════════════════════════════════════
  async sendOtp(phone: string, countryCode: string) {
    const fullPhone = `${countryCode}${phone}`;

    // Check rate limiting
    const otpKey = REDIS_KEYS.OTP(fullPhone);
    const existing = await redis.get(otpKey);
    
    if (existing) {
      throw new AppError(
        'OTP already sent. Please wait before requesting again.',
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      );
    }

    // Generate OTP
    const code = config.otpMock 
      ? config.otpMockCode 
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = addMinutes(new Date(), config.otpExpiryMinutes);

    // Save OTP to database
    let user = await prisma.user.findUnique({ where: { phone: fullPhone } });
    
    if (!user) {
      // Create temporary user record
      user = await prisma.user.create({
        data: {
          phone: fullPhone,
          countryCode,
          name: '',
          username: `user_${nanoid(10)}`,
          isVerified: false,
        },
      });
    }

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code,
        phone: fullPhone,
        expiresAt,
      },
    });

    // Cache OTP in Redis
    await redis.setex(otpKey, config.otpExpiryMinutes * 60, code);

    // Send OTP via Twilio (skip in mock mode)
    if (!config.otpMock) {
      await twilioService.sendOtp(fullPhone, code);
    }

    logger.info(`OTP sent to ${fullPhone}${config.otpMock ? ` (mock: ${code})` : ''}`);

    return {
      message: 'OTP sent successfully',
      expiresAt,
      ...(config.otpMock && { code }), // Include code in dev mode
    };
  }

  // ═══════════════════════════════════════════════
  // VERIFY OTP
  // ═══════════════════════════════════════════════
  async verifyOtp(phone: string, countryCode: string, code: string) {
    const fullPhone = `${countryCode}${phone}`;

    const user = await prisma.user.findUnique({ where: { phone: fullPhone } });
    
    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Find latest OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        phone: fullPhone,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new AppError(
        'No OTP found. Please request a new one.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_OTP
      );
    }

    // Check expiry
    if (new Date() > otp.expiresAt) {
      throw new AppError(
        'OTP expired. Please request a new one.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.OTP_EXPIRED
      );
    }

    // Check attempts
    if (otp.attempts >= 5) {
      throw new AppError(
        'Maximum OTP attempts exceeded. Please request a new one.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.OTP_MAX_ATTEMPTS
      );
    }

    // Verify code
    if (otp.code !== code) {
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });

      throw new AppError(
        'Invalid OTP code',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_OTP
      );
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Clear Redis cache
    await redis.del(REDIS_KEYS.OTP(fullPhone));

    return { verified: true, userId: user.id };
  }

  // ═══════════════════════════════════════════════
  // SIGNUP
  // ═══════════════════════════════════════════════
  async signup(
    phone: string,
    countryCode: string,
    code: string,
    name: string,
    username: string,
    deviceInfo?: { name: string; platform: string; fcmToken?: string }
  ) {
    // Verify OTP first
    const { userId } = await this.verifyOtp(phone, countryCode, code);

    // Check if username is taken
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername && existingUsername.id !== userId) {
      throw new AppError(
        'Username already taken',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.USERNAME_TAKEN
      );
    }

    // Update user with profile info
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        isVerified: true,
      },
      select: {
        id: true,
        phone: true,
        countryCode: true,
        name: true,
        username: true,
        avatar: true,
        about: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Create device if provided
    let device;
    if (deviceInfo) {
      device = await prisma.device.create({
        data: {
          userId: user.id,
          name: deviceInfo.name,
          platform: deviceInfo.platform,
          fcmToken: deviceInfo.fcmToken,
        },
      });
    }

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceId: device?.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    logger.info(`User signed up: ${user.id}`);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  // ═══════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════
  async login(
    phone: string,
    countryCode: string,
    code: string,
    deviceInfo?: { name: string; platform: string; fcmToken?: string }
  ) {
    // Verify OTP
    const { userId } = await this.verifyOtp(phone, countryCode, code);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        countryCode: true,
        name: true,
        username: true,
        avatar: true,
        about: true,
        isVerified: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    if (!user.isVerified) {
      throw new AppError(
        'User not verified. Please complete signup.',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Create or update device
    let device;
    if (deviceInfo) {
      device = await prisma.device.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: deviceInfo.name,
          },
        },
        create: {
          userId: user.id,
          name: deviceInfo.name,
          platform: deviceInfo.platform,
          fcmToken: deviceInfo.fcmToken,
        },
        update: {
          fcmToken: deviceInfo.fcmToken,
          lastActive: new Date(),
          isActive: true,
        },
      });
    }

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceId: device?.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    logger.info(`User logged in: ${user.id}`);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  // ═══════════════════════════════════════════════
  // REFRESH TOKEN
  // ═══════════════════════════════════════════════
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || !session.isValid) {
      throw new AppError(
        'Invalid session',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_TOKEN
      );
    }

    if (new Date() > session.expiresAt) {
      throw new AppError(
        'Session expired',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_EXPIRED
      );
    }

    // Generate new tokens
    const newAccessToken = jwtService.generateAccessToken(session.userId);
    const newRefreshToken = jwtService.generateRefreshToken(session.userId);

    // Update session with new refresh token (token rotation)
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        updatedAt: new Date(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ═══════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════
  async logout(userId: string, refreshToken?: string, allDevices = false) {
    if (allDevices) {
      // Invalidate all sessions
      await prisma.session.updateMany({
        where: { userId },
        data: { isValid: false },
      });

      logger.info(`User logged out from all devices: ${userId}`);
    } else if (refreshToken) {
      // Invalidate specific session
      await prisma.session.updateMany({
        where: { userId, refreshToken },
        data: { isValid: false },
      });

      logger.info(`User logged out: ${userId}`);
    }

    return { message: 'Logged out successfully' };
  }

  // ═══════════════════════════════════════════════
  // GET ACTIVE SESSIONS
  // ═══════════════════════════════════════════════
  async getActiveSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        device: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }
}

export const authService = new AuthService();
