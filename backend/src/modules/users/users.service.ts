import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS } from '../../config/constants';

class UserService {
  async getUserById(userId: string) {
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
        isOnline: true,
        lastSeen: true,
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

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        about: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; username?: string; about?: string; avatar?: string }) {
    // Check if username is taken
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing && existing.id !== userId) {
        throw new AppError(
          'Username already taken',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.USERNAME_TAKEN
        );
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        about: true,
        isOnline: true,
        lastSeen: true,
      },
    });
  }

  async searchUsers(query: string, limit = 20) {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
        isVerified: true,
      },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        about: true,
        isOnline: true,
      },
    });
  }

  async blockUser(userId: string, targetUserId: string) {
    return prisma.blockedUser.create({
      data: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    });
  }

  async unblockUser(userId: string, targetUserId: string) {
    return prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetUserId,
        },
      },
    });
  }

  async getBlockedUsers(userId: string) {
    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return blocked.map((b) => b.blocked);
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetUserId,
        },
      },
    });

    return !!blocked;
  }
}

export const userService = new UserService();
