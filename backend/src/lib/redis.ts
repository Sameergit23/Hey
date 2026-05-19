import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

const createRedisClient = (): Redis => {
  const client = new Redis(env.REDIS_URL, {
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis: Too many reconnect attempts. Giving up.');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
    lazyConnect: false,
  });

  client.on('connect', () => logger.info('Redis: Connected'));
  client.on('ready', () => logger.info('Redis: Ready'));
  client.on('error', (err) => logger.error('Redis error:', err));
  client.on('close', () => logger.warn('Redis: Connection closed'));
  client.on('reconnecting', () => logger.info('Redis: Reconnecting...'));

  return client;
};

// Singleton pattern — main client and pub/sub client
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
  // eslint-disable-next-line no-var
  var __redisSub: Redis | undefined;
}

export const redis = global.__redis ?? createRedisClient();
export const redisSub = global.__redisSub ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis;
  global.__redisSub = redisSub;
}

// ─── Redis key helpers ─────────────────────────
export const RedisKeys = {
  userPresence:   (userId: string) => `presence:${userId}`,
  userSockets:    (userId: string) => `sockets:${userId}`,
  typingIndicator:(chatId: string, userId: string) => `typing:${chatId}:${userId}`,
  session:        (sessionId: string) => `session:${sessionId}`,
  rateLimit:      (key: string)  => `ratelimit:${key}`,
  otp:            (phone: string) => `otp:${phone}`,
  chatOnline:     (chatId: string) => `chat_online:${chatId}`,
  unreadCount:    (userId: string, chatId: string) => `unread:${userId}:${chatId}`,
};

export const RedisExpiry = {
  PRESENCE: 60 * 5,          // 5 minutes
  TYPING:   10,              // 10 seconds
  SESSION:  60 * 60 * 24 * 30, // 30 days
  OTP:      60 * 10,         // 10 minutes
};
