import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AccessTokenPayload, RefreshTokenPayload, TokenPair } from '@/types';

export const JWTService = {
  signAccess(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES,
      issuer: env.APP_NAME,
      audience: 'hey-client',
    } as jwt.SignOptions);
  },

  signRefresh(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES,
      issuer: env.APP_NAME,
    } as jwt.SignOptions);
  },

  verifyAccess(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.APP_NAME,
      audience: 'hey-client',
    }) as AccessTokenPayload;
  },

  verifyRefresh(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: env.APP_NAME,
    }) as RefreshTokenPayload;
  },

  generatePair(
    userId: string,
    phone: string,
    sessionId: string
  ): TokenPair {
    const accessToken  = JWTService.signAccess({ sub: userId, phone, sessionId });
    const refreshToken = JWTService.signRefresh({ sub: userId, sessionId });
    // parse expires_in from '15m' → seconds
    const decoded = jwt.decode(accessToken) as AccessTokenPayload;
    return {
      accessToken,
      refreshToken,
      expiresIn: (decoded.exp ?? 0) - (decoded.iat ?? 0),
    };
  },
};
