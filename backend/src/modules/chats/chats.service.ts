import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS, LIMITS } from '../../config/constants';
import { ChatType, MemberRole } from '@prisma/client';

class ChatService {
  async createDirectChat(userId: string, recipientId: string) {
    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          every: {
            userId: { in: [userId, recipientId] },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new direct chat
    const chat = await prisma.chat.create({
      data: {
        type: 'DIRECT',
        createdBy: userId,
        members: {
          create: [
            { userId, role: 'MEMBER' },
            { userId: recipientId, role: 'MEMBER' },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    return chat;
  }

  async createGroupChat(userId: string, name: string, memberIds: string[], description?: string) {
    if (memberIds.length > LIMITS.GROUP_MAX_MEMBERS) {
      throw new AppError(
        `Group cannot have more than ${LIMITS.GROUP_MAX_MEMBERS} members`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const chat = await prisma.chat.create({
      data: {
        type: 'GROUP',
        name,
        description,
        createdBy: userId,
        members: {
          create: [
            { userId, role: 'OWNER' },
            ...memberIds.map((id) => ({ userId: id, role: 'MEMBER' as MemberRole })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    return chat;
  }

  async getUserChats(userId: string, limit = 50, cursor?: string) {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId,
            leftAt: null,
          },
        },
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return chats;
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                about: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        pinnedMessage: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new AppError(
        'Chat not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CHAT_NOT_FOUND
      );
    }

    // Verify membership
    const isMember = chat.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError(
        'Not a member of this chat',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.NOT_CHAT_MEMBER
      );
    }

    return chat;
  }

  async updateChat(chatId: string, userId: string, data: { name?: string; description?: string; avatar?: string }) {
    const chat = await this.getChatById(chatId, userId);

    // Check permissions (only admins/owners can update group info)
    if (chat.type === 'GROUP') {
      const member = chat.members.find((m) => m.userId === userId);
      if (!member || (member.role !== 'ADMIN' && member.role !== 'OWNER')) {
        throw new AppError(
          'Insufficient permissions',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.INSUFFICIENT_PERMISSIONS
        );
      }
    }

    return prisma.chat.update({
      where: { id: chatId },
      data,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async addMembers(chatId: string, userId: string, memberIds: string[]) {
    const chat = await this.getChatById(chatId, userId);

    if (chat.type !== 'GROUP') {
      throw new AppError(
        'Can only add members to group chats',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Check permissions
    const member = chat.members.find((m) => m.userId === userId);
    if (!member || (member.role !== 'ADMIN' && member.role !== 'OWNER')) {
      throw new AppError(
        'Insufficient permissions',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Add members
    await prisma.chatMember.createMany({
      data: memberIds.map((id) => ({
        chatId,
        userId: id,
        role: 'MEMBER',
      })),
      skipDuplicates: true,
    });

    return this.getChatById(chatId, userId);
  }

  async removeMember(chatId: string, userId: string, targetUserId: string) {
    const chat = await this.getChatById(chatId, userId);

    if (chat.type !== 'GROUP') {
      throw new AppError(
        'Can only remove members from group chats',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Check permissions
    const member = chat.members.find((m) => m.userId === userId);
    if (!member || (member.role !== 'ADMIN' && member.role !== 'OWNER')) {
      throw new AppError(
        'Insufficient permissions',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    await prisma.chatMember.update({
      where: {
        chatId_userId: { chatId, userId: targetUserId },
      },
      data: {
        leftAt: new Date(),
      },
    });

    return { success: true };
  }

  async leaveChat(chatId: string, userId: string) {
    await prisma.chatMember.update({
      where: {
        chatId_userId: { chatId, userId },
      },
      data: {
        leftAt: new Date(),
      },
    });

    return { success: true };
  }

  async updateMemberSettings(chatId: string, userId: string, settings: { isPinned?: boolean; isMuted?: boolean; isArchived?: boolean }) {
    return prisma.chatMember.update({
      where: {
        chatId_userId: { chatId, userId },
      },
      data: settings,
    });
  }

  async clearUnreadCount(chatId: string, userId: string) {
    return prisma.chatMember.update({
      where: {
        chatId_userId: { chatId, userId },
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });
  }
}

export const chatService = new ChatService();
