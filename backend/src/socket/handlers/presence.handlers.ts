import { Socket } from 'socket.io';
import { presenceService } from '../../modules/presence/presence.service';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../config/constants';
import { getIO } from '../index';
import logger from '../../lib/logger';

export const presenceHandlers = (socket: Socket) => {
  const userId = socket.data.userId;

  // ═══════════════════════════════════════════════
  // USER COMES ONLINE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_ONLINE, async () => {
    try {
      await presenceService.setOnline(userId, socket.id);

      // Join user's personal room
      socket.join(SOCKET_ROOMS.USER(userId));

      // Notify contacts
      const contacts = await presenceService.getUserContacts(userId);
      const io = getIO();
      
      contacts.forEach((contactId) => {
        io.to(SOCKET_ROOMS.USER(contactId)).emit(SOCKET_EVENTS.USER_ONLINE, {
          userId,
          timestamp: new Date(),
        });
      });

      logger.debug(`User ${userId} is now online`);
    } catch (error) {
      logger.error('Error setting user online:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // USER GOES OFFLINE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_OFFLINE, async () => {
    try {
      await presenceService.setOffline(userId);

      // Notify contacts
      const contacts = await presenceService.getUserContacts(userId);
      const io = getIO();
      
      contacts.forEach((contactId) => {
        io.to(SOCKET_ROOMS.USER(contactId)).emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId,
          lastSeen: new Date(),
        });
      });

      logger.debug(`User ${userId} is now offline`);
    } catch (error) {
      logger.error('Error setting user offline:', error);
    }
  });
};
