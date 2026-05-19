import { z } from 'zod';

export const addContactSchema = z.object({
  body: z.object({
    contactId: z.string().uuid(),
    nickname: z.string().max(50).optional(),
  }),
});

export const updateNicknameSchema = z.object({
  body: z.object({
    nickname: z.string().max(50),
  }),
});
