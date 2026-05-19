import { redis } from '../../lib/redis';
import { prisma } from '../../lib/prisma';
import { REDIS_KEYS, TIMEOUTS } from '../../config/constants';

class PresenceService {
  async setOnline(userId: string, socketId: string) {
    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // Update Redis
    await redis.setex(
      REDIS_KEYS.USER_PRESENCE(userId),
      TIMEOUTS.PRESENCE_OFFLINE_THRESHOLD / 1000,
      'online'
    );

    await redis.set(REDIS_KEYS.USER_SOCKET(userId), socketId);
    await redis.sadd(REDIS_KEYS.ONLINE_USERS, userId);
  }

  async setOffline(userId: string) {
    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });

    // Update Redis
    await redis.del(REDIS_KEYS.USER_PRESENCE(userId));
    await redis.del(REDIS_KEYS.USER_SOCKET(userId));
    await redis.srem(REDIS_KEYS.ONLINE_USERS, userId);
  }

  async isOnline(userId: string): Promise<boolean> {
    const presence = await redis.get(REDIS_KEYS.USER_PRESENCE(userId));
    return presence === 'online';
  }

  async getOnlineUsers(): Promise<string[]> {
    return redis.smembers(REDIS_KEYS.ONLINE_USERS);
  }

  async getUserContacts(userId: string): Promise<string[]> {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: { contactId: true },
    });

    return contacts.map((c) => c.contactId);
  }

  async setTyping(chatId: string, userId: string) {
    await redis.setex(
      REDIS_KEYS.USER_TYPING(chatId, userId),
      TIMEOUTS.TYPING_INDICATOR / 1000,
      '1'
    );

    await redis.sadd(REDIS_KEYS.CHAT_TYPING_USERS(chatId), userId);
  }

  async clearTyping(chatId: string, userId: string) {
    await redis.del(REDIS_KEYS.USER_TYPING(chatId, userId));
    await redis.srem(REDIS_KEYS.CHAT_TYPING_USERS(chatId), userId);
  }

  async getTypingUsers(chatId: string): Promise<string[]> {
    return redis.smembers(REDIS_KEYS.CHAT_TYPING_USERS(chatId));
  }

  async setRecording(chatId: string, userId: string) {
    await redis.setex(
      REDIS_KEYS.USER_RECORDING(chatId, userId),
      TIMEOUTS.RECORDING_INDICATOR / 1000,
      '1'
    );
  }

  async clearRecording(chatId: string, userId: string) {
    await redis.del(REDIS_KEYS.USER_RECORDING(chatId, userId));
  }

  async handleDisconnect(userId: string) {
    await this.setOffline(userId);

    // Clear all typing indicators for this user
    const chats = await prisma.chatMember.findMany({
      where: { userId },
      select: { chatId: true },
    });

    for (const chat of chats) {
      await this.clearTyping(chat.chatId, userId);
      await this.clearRecording(chat.chatId, userId);
    }
  }
}

export const presenceService = new PresenceService();
