import { Request, Response } from 'express';
import { presenceService } from './presence.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class PresenceController {
  getOnlineUsers = asyncHandler(async (req: Request, res: Response) => {
    const userIds = await presenceService.getOnlineUsers();
    return successResponse(res, { userIds }, 'Online users retrieved');
  });

  getUserPresence = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const isOnline = await presenceService.isOnline(userId);
    return successResponse(res, { userId, isOnline }, 'User presence retrieved');
  });
}

export const presenceController = new PresenceController();
