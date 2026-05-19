import { v2 as cloudinaryV2 } from 'cloudinary';
import { env } from '@/config/env';

cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export const cloudinary = cloudinaryV2;

export const CloudinaryFolders = {
  AVATARS:     'hey/avatars',
  IMAGES:      'hey/messages/images',
  VIDEOS:      'hey/messages/videos',
  AUDIO:       'hey/messages/audio',
  VOICE_NOTES: 'hey/messages/voice-notes',
  DOCUMENTS:   'hey/messages/documents',
  STATUSES:    'hey/statuses',
};
