import { z } from 'zod';

export const createDirectChatSchema = z.object({
  body: z.object({
    recipientId: z.string().uuid(),
  }),
});

export const createGroupChatSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    memberIds: z.array(z.string().uuid()).min(1).max(256),
    description: z.string().max(500).optional(),
  }),
});

export const updateChatSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
  }),
});

export const addMembersSchema = z.object({
  body: z.object({
    memberIds: z.array(z.string().uuid()).min(1),
  }),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    isPinned: z.boolean().optional(),
    isMuted: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});
