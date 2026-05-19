import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15),
    countryCode: z.string().min(1).max(5),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15),
    countryCode: z.string().min(1).max(5),
    code: z.string().length(6),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15),
    countryCode: z.string().min(1).max(5),
    code: z.string().length(6),
    name: z.string().min(1).max(50),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
    allDevices: z.boolean().optional(),
  }),
});
