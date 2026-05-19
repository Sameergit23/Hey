'use client';

import { motion } from 'framer-motion';
import { useCallStore } from '@/store/callStore';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/avatars/Avatar';
import { MOCK_USERS } from '@/constants/mockData';
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  Volume2, VolumeX, RotateCcw, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActiveCallOverlay() {
  const { activeCall, endCall, toggleMute, toggleCamera, toggleSpeaker, isMuted, isCameraOff, isSpeakerOn } = useCallStore();
  if (!activeCall) return null;

  const participant = MOCK_USERS.find(u => u.id === activeCall.receiverId);
  const isVideo = activeCall.type === 'video';
  const isRinging = activeCall.status === 'ringing';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-between py-16',
        isVideo
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]'
      )}
    >
      {/* Background orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ top: '-10%', left: '20%' }}
      />

      {/* Call info */}
      <div className="relative z-10 flex flex-col items-center gap-4 mt-8">
        <div className="relative">
          <Avatar
            user={participant}
            size="2xl"
            glowing
            isOnline
          />
          {/* Pulsing rings */}
          {isRinging && [1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary/50"
              animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white font-display">{participant?.name}</h2>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/70 mt-1"
          >
            {isRinging ? 'Ringing...' : activeCall.status === 'active' ? '🟢 Connected' : 'Connecting...'}
          </motion.p>
        </div>

        {/* Waveform (active only) */}
        {activeCall.status === 'active' && !isVideo && (
          <div className="flex gap-1 items-end h-12">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="waveform-bar bg-primary/60" style={{ height: `${Math.random() * 30 + 5}px`, animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Secondary controls */}
        <div className="flex gap-4">
          <ControlBtn icon={isSpeakerOn ? Volume2 : VolumeX} label={isSpeakerOn ? 'Speaker' : 'Earpiece'} onClick={toggleSpeaker} />
          {isVideo && <ControlBtn icon={RotateCcw} label="Flip" onClick={() => {}} />}
          <ControlBtn icon={MessageCircle} label="Message" onClick={() => {}} />
        </div>

        {/* Main controls */}
        <div className="flex gap-5 items-center">
          <ControlBtn
            icon={isMuted ? MicOff : Mic}
            label={isMuted ? 'Unmute' : 'Mute'}
            onClick={toggleMute}
            active={isMuted}
          />
          {isVideo && (
            <ControlBtn
              icon={isCameraOff ? VideoOff : Video}
              label={isCameraOff ? 'Cam On' : 'Cam Off'}
              onClick={toggleCamera}
              active={isCameraOff}
            />
          )}
          <motion.button
            onClick={endCall}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ControlBtn({ icon: Icon, label, onClick, active = false }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
        active ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </motion.button>
  );
}
