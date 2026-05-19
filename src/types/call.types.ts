export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined' | 'reconnecting';

export interface Call {
  id: string;
  type: CallType;
  status: CallStatus;
  callerId: string;
  receiverId: string;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
}

export interface CallLog {
  id: string;
  type: CallType;
  status: 'missed' | 'incoming' | 'outgoing';
  participantId: string;
  participantName: string;
  participantAvatar: string;
  duration?: number;
  timestamp: Date;
}

export interface CallState {
  activeCall: Call | null;
  callLogs: CallLog[];
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
}
