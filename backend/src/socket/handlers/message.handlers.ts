import { Socket } from 'socket.io';
import { messageService } from '../../modules/messages/messages.service';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../config/constants';
import { getIO } from '../index';
import logger from '../../lib/logger';

export const messageHandlers = (socket: Socket) => {
  const userId = socket.data.userId;

  // ═══════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data, callback) => {
    try {
      const { chatId, text, type, replyToId, metadata } = data;

      // Create message
      const message = await messageService.createMessage({
        chatId,
        senderId: userId,
        text,
        type,
        replyToId,
        metadata,
      });

      // Emit to chat room
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, message);

      // Send delivery confirmation to sender
      callback?.({ success: true, message });

      logger.debug(`Message sent: ${message.id} in chat ${chatId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      callback?.({ success: false, error: 'Failed to send message' });
    }
  });

  // ═══════════════════════════════════════════════
  // MARK MESSAGE AS DELIVERED
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, async (data) => {
    try {
      const { messageId, chatId } = data;

      await messageService.updateMessageStatus(messageId, 'DELIVERED');

      // Notify sender
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        messageId,
        userId,
        deliveredAt: new Date(),
      });
    } catch (error) {
      logger.error('Error marking message as delivered:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // MARK MESSAGE AS READ
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data) => {
    try {
      const { messageId, chatId } = data;

      await messageService.markAsRead(messageId, userId);

      // Notify chat members
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_READ, {
        messageId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // EDIT MESSAGE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_EDIT, async (data, callback) => {
    try {
      const { messageId, text, chatId } = data;

      const message = await messageService.editMessage(messageId, userId, text);

      // Notify chat members
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_EDIT, message);

      callback?.({ success: true, message });
    } catch (error) {
      logger.error('Error editing message:', error);
      callback?.({ success: false, error: 'Failed to edit message' });
    }
  });

  // ═══════════════════════════════════════════════
  // DELETE MESSAGE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (data, callback) => {
    try {
      const { messageId, chatId } = data;

      await messageService.deleteMessage(messageId, userId);

      // Notify chat members
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_DELETE, {
        messageId,
        deletedBy: userId,
        deletedAt: new Date(),
      });

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error deleting message:', error);
      callback?.({ success: false, error: 'Failed to delete message' });
    }
  });

  // ═══════════════════════════════════════════════
  // REACT TO MESSAGE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_REACT, async (data, callback) => {
    try {
      const { messageId, emoji, chatId } = data;

      const reaction = await messageService.addReaction(messageId, userId, emoji);

      // Notify chat members
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_REACT, reaction);

      callback?.({ success: true, reaction });
    } catch (error) {
      logger.error('Error adding reaction:', error);
      callback?.({ success: false, error: 'Failed to add reaction' });
    }
  });

  // ═══════════════════════════════════════════════
  // REMOVE REACTION
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.MESSAGE_UNREACT, async (data, callback) => {
    try {
      const { messageId, emoji, chatId } = data;

      await messageService.removeReaction(messageId, userId, emoji);

      // Notify chat members
      const io = getIO();
      io.to(SOCKET_ROOMS.CHAT(chatId)).emit(SOCKET_EVENTS.MESSAGE_UNREACT, {
        messageId,
        userId,
        emoji,
      });

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error removing reaction:', error);
      callback?.({ success: false, error: 'Failed to remove reaction' });
    }
  });
};
