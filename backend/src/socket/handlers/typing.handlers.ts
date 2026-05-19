import { Socket } from 'socket.io';
import { presenceService } from '../../modules/presence/presence.service';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../config/constants';
import { getIO } from '../index';
import logger from '../../lib/logger';

export const typingHandlers = (socket: Socket) => {
  const userId = socket.data.userId;

  // ═══════════════════════════════════════════════
  // USER TYPING
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_TYPING, async (data) => {
    try {
      const { chatId } = data;

      await presenceService.setTyping(chatId, userId);

      // Notify chat members
      const io = getIO();
      socket.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.USER_TYPING, {
        chatId,
        userId,
      });
    } catch (error) {
      logger.error('Error setting typing indicator:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // USER STOP TYPING
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_STOP_TYPING, async (data) => {
    try {
      const { chatId } = data;

      await presenceService.clearTyping(chatId, userId);

      // Notify chat members
      const io = getIO();
      socket.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.USER_STOP_TYPING, {
        chatId,
        userId,
      });
    } catch (error) {
      logger.error('Error clearing typing indicator:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // USER RECORDING AUDIO
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_RECORDING, async (data) => {
    try {
      const { chatId } = data;

      await presenceService.setRecording(chatId, userId);

      // Notify chat members
      const io = getIO();
      socket.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.USER_RECORDING, {
        chatId,
        userId,
      });
    } catch (error) {
      logger.error('Error setting recording indicator:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // USER STOP RECORDING
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.USER_STOP_RECORDING, async (data) => {
    try {
      const { chatId } = data;

      await presenceService.clearRecording(chatId, userId);

      // Notify chat members
      const io = getIO();
      socket.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.USER_STOP_RECORDING, {
        chatId,
        userId,
      });
    } catch (error) {
      logger.error('Error clearing recording indicator:', error);
    }
  });
};
