import { prisma } from '../../lib/prisma';
import { NotificationType } from '@prisma/client';

class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    data?: any
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data,
      },
    });
  }

  async getNotifications(userId: string, limit = 50, cursor?: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.delete({
      where: {
        id: notificationId,
        userId,
      },
    });
  }
}

export const notificationService = new NotificationService();
