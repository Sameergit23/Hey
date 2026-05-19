import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env';
import { socketAuthMiddleware } from './middleware/socketAuth';
import { messageHandlers } from './handlers/message.handlers';
import { presenceHandlers } from './handlers/presence.handlers';
import { callHandlers } from './handlers/call.handlers';
import { typingHandlers } from './handlers/typing.handlers';
import { SOCKET_EVENTS } from '../config/constants';
import logger from '../lib/logger';

export let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ═══════════════════════════════════════════════
  // AUTHENTICATION MIDDLEWARE
  // ═══════════════════════════════════════════════
  io.use(socketAuthMiddleware);

  // ═══════════════════════════════════════════════
  // CONNECTION HANDLER
  // ═══════════════════════════════════════════════
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

    // Register handlers
    messageHandlers(socket);
    presenceHandlers(socket);
    callHandlers(socket);
    typingHandlers(socket);

    // ═══════════════════════════════════════════════
    // HEARTBEAT
    // ═══════════════════════════════════════════════
    socket.on(SOCKET_EVENTS.PING, () => {
      socket.emit(SOCKET_EVENTS.PONG);
    });

    // ═══════════════════════════════════════════════
    // DISCONNECT
    // ═══════════════════════════════════════════════
    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${userId})`);
      
      // Handle presence cleanup
      const { presenceService } = await import('../modules/presence/presence.service');
      await presenceService.handleDisconnect(userId);
    });

    // ═══════════════════════════════════════════════
    // ERROR HANDLING
    // ═══════════════════════════════════════════════
    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
