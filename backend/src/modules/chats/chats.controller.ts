import { Request, Response } from 'express';
import { chatService } from './chats.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class ChatController {
  getUserChats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit, cursor } = req.query;

    const chats = await chatService.getUserChats(
      userId,
      limit ? parseInt(limit as string) : undefined,
      cursor as string
    );

    return successResponse(res, { chats }, 'Chats retrieved');
  });

  getChatById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const chat = await chatService.getChatById(id, userId);
    return successResponse(res, { chat }, 'Chat retrieved');
  });

  createDirectChat = asyncHandler(async (req: Request, res: Response) => {
    const { recipientId } = req.body;
    const userId = req.user!.id;

    const chat = await chatService.createDirectChat(userId, recipientId);
    return successResponse(res, { chat }, 'Direct chat created', 201);
  });

  createGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { name, memberIds, description } = req.body;
    const userId = req.user!.id;

    const chat = await chatService.createGroupChat(userId, name, memberIds, description);
    return successResponse(res, { chat }, 'Group chat created', 201);
  });

  updateChat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const chat = await chatService.updateChat(id, userId, data);
    return successResponse(res, { chat }, 'Chat updated');
  });

  addMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { memberIds } = req.body;
    const userId = req.user!.id;

    const chat = await chatService.addMembers(id, userId, memberIds);
    return successResponse(res, { chat }, 'Members added');
  });

  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user!.id;

    await chatService.removeMember(id, userId, targetUserId);
    return successResponse(res, null, 'Member removed');
  });

  leaveChat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await chatService.leaveChat(id, userId);
    return successResponse(res, null, 'Left chat');
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const settings = req.body;

    const member = await chatService.updateMemberSettings(id, userId, settings);
    return successResponse(res, { member }, 'Settings updated');
  });

  clearUnread = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await chatService.clearUnreadCount(id, userId);
    return successResponse(res, null, 'Unread count cleared');
  });
}

export const chatController = new ChatController();
