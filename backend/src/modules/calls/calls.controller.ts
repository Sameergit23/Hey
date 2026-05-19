import { Request, Response } from 'express';
import { callService } from './calls.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class CallController {
  getCallHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit, cursor } = req.query;

    const calls = await callService.getCallHistory(
      userId,
      limit ? parseInt(limit as string) : undefined,
      cursor as string
    );

    return successResponse(res, { calls }, 'Call history retrieved');
  });

  getCallById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const call = await callService.getCallById(id, userId);
    return successResponse(res, { call }, 'Call retrieved');
  });
}

export const callController = new CallController();
