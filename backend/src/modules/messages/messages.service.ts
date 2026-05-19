import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS, LIMITS } from '../../config/constants';
import { MessageType, MessageStatus } from '@prisma/client';

interface CreateMessageData {
  chatId: string;
  senderId: string;
  text?: string;
  type?: MessageType;
  replyToId?: string;
  metadata?: any;
}

class MessageService {
  async createMessage(data: CreateMessageData) {
    const { chatId, senderId, text, type = 'TEXT', replyToId, metadata } = data;

    // Verify user is member of chat
    const membership = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: { chatId, userId: senderId },
      },
    });

    if (!membership) {
      throw new AppError(
        'Not a member of this chat',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.NOT_CHAT_MEMBER
      );
    }

    // Validate text length
    if (text && text.length > LIMITS.MESSAGE_TEXT_LENGTH) {
      throw new AppError(
        'Message too long',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.MESSAGE_TOO_LONG
      );
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        text,
        type,
        replyToId,
        metadata,
        status: 'SENT',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        replyTo: {
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
        attachments: true,
        reactions: {
          include: {
            user: {
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

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Increment unread count for other members
    await prisma.chatMember.updateMany({
      where: {
        chatId,
        userId: { not: senderId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  async getMessages(chatId: string, userId: string, limit = 50, cursor?: string) {
    // Verify membership
    const membership = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });

    if (!membership) {
      throw new AppError(
        'Not a member of this chat',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.NOT_CHAT_MEMBER
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        replyTo: {
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
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        readBy: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
    });

    return messages.reverse();
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(
        'Message not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.MESSAGE_NOT_FOUND
      );
    }

    // Create read receipt
    await prisma.readReceipt.upsert({
      where: {
        messageId_userId: { messageId, userId },
      },
      create: {
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    // Update message status to SEEN
    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'SEEN' },
    });

    // Decrement unread count
    await prisma.chatMember.updateMany({
      where: {
        chatId: message.chatId,
        userId,
      },
      data: {
        unreadCount: { decrement: 1 },
        lastReadAt: new Date(),
      },
    });
  }

  async editMessage(messageId: string, userId: string, text: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(
        'Message not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.MESSAGE_NOT_FOUND
      );
    }

    if (message.senderId !== userId) {
      throw new AppError(
        'Cannot edit message',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return prisma.message.update({
      where: { id: messageId },
      data: {
        text,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError(
        'Message not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.MESSAGE_NOT_FOUND
      );
    }

    if (message.senderId !== userId) {
      throw new AppError(
        'Cannot delete message',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        text: null,
      },
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    return prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
      create: {
        messageId,
        userId,
        emoji,
      },
      update: {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return prisma.reaction.delete({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
    });
  }

  async searchMessages(chatId: string, userId: string, query: string, limit = 20) {
    // Verify membership
    const membership = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });

    if (!membership) {
      throw new AppError(
        'Not a member of this chat',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.NOT_CHAT_MEMBER
      );
    }

    return prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false,
        text: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }
}

export const messageService = new MessageService();
