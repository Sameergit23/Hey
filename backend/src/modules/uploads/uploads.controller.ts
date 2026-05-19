import { Request, Response } from 'express';
import { uploadService } from './uploads.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';
import { ALLOWED_FILE_TYPES } from '../../config/constants';

class UploadController {
  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    uploadService.validateFileType(file, ALLOWED_FILE_TYPES.IMAGE);
    uploadService.validateFileSize(file);

    const result = await uploadService.uploadImage(file, userId);
    return successResponse(res, { upload: result }, 'Image uploaded', 201);
  });

  uploadVideo = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    uploadService.validateFileType(file, ALLOWED_FILE_TYPES.VIDEO);
    uploadService.validateFileSize(file);

    const result = await uploadService.uploadVideo(file, userId);
    return successResponse(res, { upload: result }, 'Video uploaded', 201);
  });

  uploadAudio = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const file = req.file;
    const { waveform } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    uploadService.validateFileType(file, ALLOWED_FILE_TYPES.AUDIO);
    uploadService.validateFileSize(file);

    const result = await uploadService.uploadAudio(file, userId, waveform ? JSON.parse(waveform) : undefined);
    return successResponse(res, { upload: result }, 'Audio uploaded', 201);
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    uploadService.validateFileType(file, ALLOWED_FILE_TYPES.DOCUMENT);
    uploadService.validateFileSize(file);

    const result = await uploadService.uploadDocument(file, userId);
    return successResponse(res, { upload: result }, 'Document uploaded', 201);
  });
}

export const uploadController = new UploadController();
