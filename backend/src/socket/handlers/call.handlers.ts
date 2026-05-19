import { Socket } from 'socket.io';
import { callService } from '../../modules/calls/calls.service';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../config/constants';
import { getIO } from '../index';
import logger from '../../lib/logger';

export const callHandlers = (socket: Socket) => {
  const userId = socket.data.userId;

  // ═══════════════════════════════════════════════
  // INITIATE CALL
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_INITIATE, async (data, callback) => {
    try {
      const { recipientId, type, chatId } = data;

      const call = await callService.initiateCall({
        callerId: userId,
        recipientId,
        type,
        chatId,
      });

      // Join call room
      socket.join(SOCKET_ROOMS.CALL(call.id));

      // Notify recipient
      const io = getIO();
      io.to(SOCKET_ROOMS.USER(recipientId)).emit(SOCKET_EVENTS.CALL_INCOMING, {
        call,
        caller: { id: userId },
      });

      callback?.({ success: true, call });
      logger.info(`Call initiated: ${call.id} from ${userId} to ${recipientId}`);
    } catch (error) {
      logger.error('Error initiating call:', error);
      callback?.({ success: false, error: 'Failed to initiate call' });
    }
  });

  // ═══════════════════════════════════════════════
  // ACCEPT CALL
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, async (data, callback) => {
    try {
      const { callId } = data;

      const call = await callService.acceptCall(callId, userId);

      // Join call room
      socket.join(SOCKET_ROOMS.CALL(callId));

      // Notify caller
      const io = getIO();
      io.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_ACCEPT, {
        callId,
        acceptedBy: userId,
        call,
      });

      callback?.({ success: true, call });
      logger.info(`Call accepted: ${callId} by ${userId}`);
    } catch (error) {
      logger.error('Error accepting call:', error);
      callback?.({ success: false, error: 'Failed to accept call' });
    }
  });

  // ═══════════════════════════════════════════════
  // REJECT CALL
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_REJECT, async (data, callback) => {
    try {
      const { callId } = data;

      await callService.rejectCall(callId, userId);

      // Notify caller
      const io = getIO();
      io.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_ENDED, {
        callId,
        reason: 'rejected',
        rejectedBy: userId,
      });

      callback?.({ success: true });
      logger.info(`Call rejected: ${callId} by ${userId}`);
    } catch (error) {
      logger.error('Error rejecting call:', error);
      callback?.({ success: false, error: 'Failed to reject call' });
    }
  });

  // ═══════════════════════════════════════════════
  // END CALL
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_END, async (data, callback) => {
    try {
      const { callId } = data;

      const call = await callService.endCall(callId, userId);

      // Notify all participants
      const io = getIO();
      io.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_ENDED, {
        callId,
        endedBy: userId,
        call,
      });

      // Leave call room
      socket.leave(SOCKET_ROOMS.CALL(callId));

      callback?.({ success: true, call });
      logger.info(`Call ended: ${callId} by ${userId}`);
    } catch (error) {
      logger.error('Error ending call:', error);
      callback?.({ success: false, error: 'Failed to end call' });
    }
  });

  // ═══════════════════════════════════════════════
  // WEBRTC SIGNALING - OFFER
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_OFFER, async (data) => {
    try {
      const { callId, offer, recipientId } = data;

      const io = getIO();
      io.to(SOCKET_ROOMS.USER(recipientId)).emit(SOCKET_EVENTS.CALL_OFFER, {
        callId,
        offer,
        senderId: userId,
      });

      logger.debug(`WebRTC offer sent for call ${callId}`);
    } catch (error) {
      logger.error('Error sending WebRTC offer:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // WEBRTC SIGNALING - ANSWER
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_ANSWER, async (data) => {
    try {
      const { callId, answer, recipientId } = data;

      const io = getIO();
      io.to(SOCKET_ROOMS.USER(recipientId)).emit(SOCKET_EVENTS.CALL_ANSWER, {
        callId,
        answer,
        senderId: userId,
      });

      logger.debug(`WebRTC answer sent for call ${callId}`);
    } catch (error) {
      logger.error('Error sending WebRTC answer:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // WEBRTC SIGNALING - ICE CANDIDATE
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, async (data) => {
    try {
      const { callId, candidate, recipientId } = data;

      const io = getIO();
      io.to(SOCKET_ROOMS.USER(recipientId)).emit(SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
        callId,
        candidate,
        senderId: userId,
      });

      logger.debug(`ICE candidate sent for call ${callId}`);
    } catch (error) {
      logger.error('Error sending ICE candidate:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // PARTICIPANT MUTED
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_MUTED, async (data) => {
    try {
      const { callId } = data;

      await callService.updateParticipantStatus(callId, userId, { isMuted: true });

      const io = getIO();
      socket.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_PARTICIPANT_MUTED, {
        callId,
        userId,
      });
    } catch (error) {
      logger.error('Error updating mute status:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // PARTICIPANT UNMUTED
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_UNMUTED, async (data) => {
    try {
      const { callId } = data;

      await callService.updateParticipantStatus(callId, userId, { isMuted: false });

      const io = getIO();
      socket.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_PARTICIPANT_UNMUTED, {
        callId,
        userId,
      });
    } catch (error) {
      logger.error('Error updating mute status:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // PARTICIPANT CAMERA OFF
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_CAM_OFF, async (data) => {
    try {
      const { callId } = data;

      await callService.updateParticipantStatus(callId, userId, { isCamOff: true });

      const io = getIO();
      socket.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_PARTICIPANT_CAM_OFF, {
        callId,
        userId,
      });
    } catch (error) {
      logger.error('Error updating camera status:', error);
    }
  });

  // ═══════════════════════════════════════════════
  // PARTICIPANT CAMERA ON
  // ═══════════════════════════════════════════════
  socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_CAM_ON, async (data) => {
    try {
      const { callId } = data;

      await callService.updateParticipantStatus(callId, userId, { isCamOff: false });

      const io = getIO();
      socket.to(SOCKET_ROOMS.CALL(callId)).emit(SOCKET_EVENTS.CALL_PARTICIPANT_CAM_ON, {
        callId,
        userId,
      });
    } catch (error) {
      logger.error('Error updating camera status:', error);
    }
  });
};
