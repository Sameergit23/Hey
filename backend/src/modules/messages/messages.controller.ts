import { Request, Response } from 'express';
import { messageService } from './messages.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class MessageController {
  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { limit, cursor } = req.query;
    const userId = req.user!.id;

    const messages = await messageService.getMessages(
      chatId,
      userId,
      limit ? parseInt(limit as string) : undefined,
      cursor as string
    );

    return successResponse(res, { messages }, 'Messages retrieved');
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, text, type, replyToId, metadata } = req.body;
    const userId = req.user!.id;

    const message = await messageService.createMessage({
      chatId,
      senderId: userId,
      text,
      type,
      replyToId,
      metadata,
    });

    return successResponse(res, { message }, 'Message sent', 201);
  });

  editMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user!.id;

    const message = await messageService.editMessage(id, userId, text);
    return successResponse(res, { message }, 'Message edited');
  });

  deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await messageService.deleteMessage(id, userId);
    return successResponse(res, null, 'Message deleted');
  });

  addReaction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user!.id;

    const reaction = await messageService.addReaction(id, userId, emoji);
    return successResponse(res, { reaction }, 'Reaction added');
  });

  removeReaction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user!.id;

    await messageService.removeReaction(id, userId, emoji);
    return successResponse(res, null, 'Reaction removed');
  });

  searchMessages = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { q, limit } = req.query;
    const userId = req.user!.id;

    const messages = await messageService.searchMessages(
      chatId,
      userId,
      q as string,
      limit ? parseInt(limit as string) : undefined
    );

    return successResponse(res, { messages }, 'Search results');
  });
}

export const messageController = new MessageController();
