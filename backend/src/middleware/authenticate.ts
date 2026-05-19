import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/services/jwt.service';
import { Errors } from '@/utils/errors';
import prisma from '@/lib/prisma';
import { redis, RedisKeys } from '@/lib/redis';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw Errors.Unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const payload = JWTService.verifyAccess(token);

    // Check session validity in Redis cache first (fast path)
    const sessionCacheKey = RedisKeys.session(payload.sessionId);
    const cachedSession = await redis.get(sessionCacheKey);
    if (cachedSession === 'invalid') {
      throw Errors.Unauthorized('Session has been revoked');
    }

    // Lazy DB check: verify session still valid
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: { select: { id: true, phone: true, name: true, username: true, avatar: true, status: true } } },
    });

    if (!session || !session.isValid || session.expiresAt < new Date()) {
      await redis.setex(sessionCacheKey, 60, 'invalid');
      throw Errors.Unauthorized('Session expired or revoked');
    }

    if (session.user.status === 'DELETED' || session.user.status === 'SUSPENDED') {
      throw Errors.Forbidden('Account is suspended or deleted');
    }

    req.user = {
      id:       session.user.id,
      phone:    session.user.phone,
      name:     session.user.name,
      username: session.user.username,
      avatar:   session.user.avatar,
    };
    req.deviceId = session.deviceId ?? undefined;

    next();
  } catch (err) {
    next(err);
  }
};

// Optional auth — doesn't throw if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  return authenticate(req, res, next);
};
