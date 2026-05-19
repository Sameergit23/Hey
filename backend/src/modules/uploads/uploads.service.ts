import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS, ALLOWED_FILE_TYPES, LIMITS } from '../../config/constants';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  size: number;
  format: string;
}

class UploadService {
  async uploadImage(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hey/images',
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1920, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      });

      // Generate thumbnail
      const thumbnailUrl = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto:low',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
      };
    } catch (error) {
      throw new AppError(
        'Image upload failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.UPLOAD_FAILED
      );
    }
  }

  async uploadVideo(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hey/videos',
        resource_type: 'video',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      });

      // Generate thumbnail
      const thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl,
        width: result.width,
        height: result.height,
        duration: result.duration,
        size: result.bytes,
        format: result.format,
      };
    } catch (error) {
      throw new AppError(
        'Video upload failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.UPLOAD_FAILED
      );
    }
  }

  async uploadAudio(file: Express.Multer.File, userId: string, waveform?: number[]): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hey/audio',
        resource_type: 'video', // Cloudinary treats audio as video
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        size: result.bytes,
        format: result.format,
      };
    } catch (error) {
      throw new AppError(
        'Audio upload failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.UPLOAD_FAILED
      );
    }
  }

  async uploadDocument(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hey/documents',
        resource_type: 'raw',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
      };
    } catch (error) {
      throw new AppError(
        'Document upload failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.UPLOAD_FAILED
      );
    }
  }

  async createAttachment(messageId: string, userId: string, uploadResult: UploadResult, type: string, fileName: string, mimeType: string, waveform?: number[]) {
    return prisma.attachment.create({
      data: {
        messageId,
        uploadedBy: userId,
        type,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        thumbnailUrl: uploadResult.thumbnailUrl,
        fileName,
        mimeType,
        size: uploadResult.size,
        duration: uploadResult.duration,
        width: uploadResult.width,
        height: uploadResult.height,
        waveform: waveform ? JSON.parse(JSON.stringify(waveform)) : undefined,
      },
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      throw new AppError(
        'File deletion failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  validateFileType(file: Express.Multer.File, allowedTypes: string[]) {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        'Invalid file type',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_FILE_TYPE
      );
    }
  }

  validateFileSize(file: Express.Multer.File, maxSize: number = LIMITS.MAX_FILE_SIZE) {
    if (file.size > maxSize) {
      throw new AppError(
        'File too large',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.FILE_TOO_LARGE
      );
    }
  }
}

export const uploadService = new UploadService();
