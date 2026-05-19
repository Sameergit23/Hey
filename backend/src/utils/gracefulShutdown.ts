import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import logger from '../lib/logger';

export const gracefulShutdown = (server: HTTPServer, io: SocketServer) => {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close all socket connections
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    try {
      // Disconnect from database
      await prisma.$disconnect();
      logger.info('Database disconnected');

      // Disconnect from Redis
      await redis.quit();
      logger.info('Redis disconnected');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
};
