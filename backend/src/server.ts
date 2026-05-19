import 'module-alias/register';
import http from 'http';
import { createApp } from './app';
import { config } from './config/env';
import { initializeSocket } from './socket';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import logger from './lib/logger';
import { gracefulShutdown } from './utils/gracefulShutdown';

const startServer = async () => {
  try {
    // ═══════════════════════════════════════════════
    // DATABASE CONNECTION
    // ═══════════════════════════════════════════════
    await prisma.$connect();
    logger.info('✓ PostgreSQL connected');

    // ═══════════════════════════════════════════════
    // REDIS CONNECTION
    // ═══════════════════════════════════════════════
    await redis.ping();
    logger.info('✓ Redis connected');

    // ═══════════════════════════════════════════════
    // CREATE EXPRESS APP
    // ═══════════════════════════════════════════════
    const app = createApp();

    // ═══════════════════════════════════════════════
    // CREATE HTTP SERVER
    // ═══════════════════════════════════════════════
    const server = http.createServer(app);

    // ═══════════════════════════════════════════════
    // INITIALIZE SOCKET.IO
    // ═══════════════════════════════════════════════
    const io = initializeSocket(server);
    logger.info('✓ Socket.IO initialized');

    // ═══════════════════════════════════════════════
    // START SERVER
    // ═══════════════════════════════════════════════
    server.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 Hey Backend Server Running               ║
║                                               ║
║   Environment: ${config.nodeEnv.padEnd(31)}║
║   Port: ${String(config.port).padEnd(38)}║
║   URL: ${config.appUrl.padEnd(39)}║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });

    // ═══════════════════════════════════════════════
    // GRACEFUL SHUTDOWN
    // ═══════════════════════════════════════════════
    gracefulShutdown(server, io);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
