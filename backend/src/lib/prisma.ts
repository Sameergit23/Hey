import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty',
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
