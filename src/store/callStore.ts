import { create } from 'zustand';
import { Call, CallLog, CallType } from '@/types/call.types';
import { MOCK_CALL_LOGS } from '@/constants/mockData';

interface CallStore {
  activeCall: Call | null;
  callLogs: CallLog[];
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
  startCall: (receiverId: string, type: CallType) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  activeCall: null,
  callLogs: MOCK_CALL_LOGS,
  isMuted: false,
  isCameraOff: false,
  isSpeakerOn: false,

  startCall: (receiverId, type) => {
    const call: Call = {
      id: `call-${Date.now()}`,
      type,
      status: 'ringing',
      callerId: 'me',
      receiverId,
      startedAt: new Date(),
    };
    set({ activeCall: call });
    setTimeout(() => {
      set((state) => ({
        activeCall: state.activeCall
          ? { ...state.activeCall, status: 'active' }
          : null,
      }));
    }, 2000);
  },

  endCall: () => set({ activeCall: null, isMuted: false, isCameraOff: false }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleCamera: () => set((state) => ({ isCameraOff: !state.isCameraOff })),
  toggleSpeaker: () => set((state) => ({ isSpeakerOn: !state.isSpeakerOn })),
}));
