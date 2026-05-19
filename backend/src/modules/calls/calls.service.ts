import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS } from '../../config/constants';
import { CallType, CallStatus } from '@prisma/client';

interface InitiateCallData {
  callerId: string;
  recipientId: string;
  type: CallType;
  chatId?: string;
}

class CallService {
  async initiateCall(data: InitiateCallData) {
    const { callerId, recipientId, type, chatId } = data;

    // Check if recipient is already in a call
    const activeCall = await prisma.call.findFirst({
      where: {
        status: { in: ['RINGING', 'ACTIVE'] },
        participants: {
          some: { userId: recipientId },
        },
      },
    });

    if (activeCall) {
      throw new AppError(
        'User is busy',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.USER_BUSY
      );
    }

    // Create call
    const call = await prisma.call.create({
      data: {
        callerId,
        type,
        chatId,
        status: 'RINGING',
        participants: {
          create: [
            { userId: callerId },
            { userId: recipientId },
          ],
        },
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return call;
  }

  async acceptCall(callId: string, userId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { participants: true },
    });

    if (!call) {
      throw new AppError(
        'Call not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CALL_NOT_FOUND
      );
    }

    if (call.status !== 'RINGING') {
      throw new AppError(
        'Call is not in ringing state',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Verify user is a participant
    const isParticipant = call.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new AppError(
        'Not a participant of this call',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async rejectCall(callId: string, userId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { participants: true },
    });

    if (!call) {
      throw new AppError(
        'Call not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CALL_NOT_FOUND
      );
    }

    // Verify user is a participant
    const isParticipant = call.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new AppError(
        'Not a participant of this call',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return prisma.call.update({
      where: { id: callId },
      data: {
        status: 'DECLINED',
        endedAt: new Date(),
      },
    });
  }

  async endCall(callId: string, userId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { participants: true },
    });

    if (!call) {
      throw new AppError(
        'Call not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CALL_NOT_FOUND
      );
    }

    // Calculate duration
    const duration = call.startedAt
      ? Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000)
      : 0;

    return prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        duration,
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async updateParticipantStatus(callId: string, userId: string, status: { isMuted?: boolean; isCamOff?: boolean }) {
    return prisma.callParticipant.update({
      where: {
        callId_userId: { callId, userId },
      },
      data: status,
    });
  }

  async getCallHistory(userId: string, limit = 50, cursor?: string) {
    const calls = await prisma.call.findMany({
      where: {
        participants: {
          some: { userId },
        },
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return calls;
  }

  async getCallById(callId: string, userId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!call) {
      throw new AppError(
        'Call not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CALL_NOT_FOUND
      );
    }

    // Verify user is a participant
    const isParticipant = call.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new AppError(
        'Not a participant of this call',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return call;
  }
}

export const callService = new CallService();
