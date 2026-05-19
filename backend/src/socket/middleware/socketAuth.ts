import { Socket } from 'socket.io';
import { jwtService } from '../../services/jwt.service';
import logger from '../../lib/logger';

export const socketAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const payload = jwtService.verifyAccessToken(token);
    
    // Attach user data to socket
    socket.data.userId = payload.userId;
    socket.data.token = token;

    logger.debug(`Socket authenticated: ${socket.id} (User: ${payload.userId})`);
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error);
    next(new Error('Authentication failed'));
  }
};
