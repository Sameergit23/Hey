import { Request, Response } from 'express';
import { notificationService } from './notifications.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class NotificationController {
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit, cursor } = req.query;

    const notifications = await notificationService.getNotifications(
      userId,
      limit ? parseInt(limit as string) : undefined,
      cursor as string
    );

    return successResponse(res, { notifications }, 'Notifications retrieved');
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);
    return successResponse(res, { notification }, 'Notification marked as read');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    return successResponse(res, null, 'All notifications marked as read');
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    return successResponse(res, { count }, 'Unread count retrieved');
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);
    return successResponse(res, null, 'Notification deleted');
  });
}

export const notificationController = new NotificationController();
