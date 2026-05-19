import { User } from '@prisma/client';
import { Request } from 'express';

// ─── Extend Express Request ────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      deviceId?: string;
    }
  }
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  username: string;
  avatar?: string | null;
}

// ─── JWT Payloads ──────────────────────────────
export interface AccessTokenPayload {
  sub: string;       // user id
  phone: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// ─── Socket types ──────────────────────────────
export interface AuthenticatedSocket extends SocketIO.Socket {
  userId: string;
  deviceId?: string;
}

export interface TypingPayload {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface MessageDeliveryPayload {
  messageId: string;
  chatId: string;
  status: 'delivered' | 'seen';
  userId: string;
}

export interface CallSignalPayload {
  callId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  targetUserId: string;
}

// ─── Service types ─────────────────────────────
export type UserPublic = Omit<
  User,
  'publicKey' | 'keyVersion'
>;

export interface PaginationParams {
  page: number;
  limit: number;
  cursor?: string;
}

export interface SendOtpResult {
  success: boolean;
  expiresAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
