import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  APP_NAME: z.string().default('Hey'),
  APP_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),

  // OTP
  OTP_EXPIRY_MINUTES: z.string().transform(Number).default('10'),
  OTP_LENGTH: z.string().transform(Number).default('6'),
  OTP_MOCK: z.string().transform((val) => val === 'true').default('false'),
  OTP_MOCK_CODE: z.string().default('123456'),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),

  // File Uploads
  MAX_FILE_SIZE_MB: z.string().transform(Number).default('50'),

  // Logging
  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  appName: parsed.data.APP_NAME,
  appUrl: parsed.data.APP_URL,
  frontendUrl: parsed.data.FRONTEND_URL,
  
  databaseUrl: parsed.data.DATABASE_URL,
  
  redisUrl: parsed.data.REDIS_URL,
  redisPassword: parsed.data.REDIS_PASSWORD,
  
  jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
  jwtAccessExpires: parsed.data.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: parsed.data.JWT_REFRESH_EXPIRES,
  
  otpExpiryMinutes: parsed.data.OTP_EXPIRY_MINUTES,
  otpLength: parsed.data.OTP_LENGTH,
  otpMock: parsed.data.OTP_MOCK,
  otpMockCode: parsed.data.OTP_MOCK_CODE,
  
  twilioAccountSid: parsed.data.TWILIO_ACCOUNT_SID,
  twilioAuthToken: parsed.data.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: parsed.data.TWILIO_PHONE_NUMBER,
  
  cloudinaryCloudName: parsed.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.data.CLOUDINARY_API_SECRET,
  
  rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: parsed.data.RATE_LIMIT_MAX,
  
  maxFileSizeMb: parsed.data.MAX_FILE_SIZE_MB,
  
  logLevel: parsed.data.LOG_LEVEL,
};
