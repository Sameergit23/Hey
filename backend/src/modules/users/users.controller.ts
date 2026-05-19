import { Request, Response } from 'express';
import { userService } from './users.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class UserController {
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await userService.getUserById(userId);
    return successResponse(res, { user }, 'User retrieved');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return successResponse(res, { user }, 'User retrieved');
  });

  getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    return successResponse(res, { user }, 'User retrieved');
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body;
    const user = await userService.updateProfile(userId, data);
    return successResponse(res, { user }, 'Profile updated');
  });

  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q, limit } = req.query;
    const users = await userService.searchUsers(
      q as string,
      limit ? parseInt(limit as string) : undefined
    );
    return successResponse(res, { users }, 'Search results');
  });

  blockUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { userId: targetUserId } = req.params;
    await userService.blockUser(userId, targetUserId);
    return successResponse(res, null, 'User blocked');
  });

  unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { userId: targetUserId } = req.params;
    await userService.unblockUser(userId, targetUserId);
    return successResponse(res, null, 'User unblocked');
  });

  getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const users = await userService.getBlockedUsers(userId);
    return successResponse(res, { users }, 'Blocked users retrieved');
  });
}

export const userController = new UserController();
