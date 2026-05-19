import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    chatId: z.string().uuid(),
    text: z.string().max(4096).optional(),
    type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE_NOTE', 'DOCUMENT', 'STICKER', 'LOCATION', 'SYSTEM']).optional(),
    replyToId: z.string().uuid().optional(),
    metadata: z.any().optional(),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(4096),
  }),
});

export const reactionSchema = z.object({
  body: z.object({
    emoji: z.string().min(1).max(10),
  }),
});
