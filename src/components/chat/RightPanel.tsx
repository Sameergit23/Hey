'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import Avatar from '@/components/ui/avatars/Avatar';
import { X, Phone, Video, Bell, BellOff, Trash2, Shield, Image, Link, File, ChevronRight } from 'lucide-react';
import { formatLastSeen } from '@/utils/formatDate';
import { useCallStore } from '@/store/callStore';
import { useUIStore } from '@/store/uiStore';
import { CHAT_THEMES } from '@/constants/mockData';
import { cn } from '@/lib/utils';

export default function RightPanel() {
  const { activeChat, rightPanelOpen, toggleRightPanel, muteChat, pinChat } = useChatStore();
  const { startCall } = useCallStore();
  const { addToast } = useUIStore();
  const participant = activeChat?.participants[0];

  return (
    <AnimatePresence>
      {rightPanelOpen && activeChat && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-80 h-full bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border flex flex-col overflow-y-auto shrink-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-light-border dark:border-dark-border">
            <h3 className="font-semibold text-light-text dark:text-dark-text">Contact Info</h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleRightPanel}
              className="p-2 rounded-xl hover:bg-primary/10 text-light-muted dark:text-dark-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center gap-3 px-4 py-6 border-b border-light-border dark:border-dark-border">
            <Avatar
              user={participant}
              src={activeChat.avatar}
              name={activeChat.name}
              size="xl"
              showOnline
              isOnline={participant?.isOnline}
              glowing={participant?.isOnline}
              showMood
            />
            <div className="text-center">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text font-display">
                {activeChat.name || participant?.name}
              </h2>
              {participant?.mood && (
                <p className="text-sm text-primary font-medium mt-0.5">
                  {participant.mood.emoji} {participant.mood.text}
                </p>
              )}
              <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
                {participant?.isOnline
                  ? '🟢 Active now'
                  : participant?.lastSeen
                    ? `Last seen ${formatLastSeen(participant.lastSeen)}`
                    : 'Offline'}
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-4 mt-2">
              {[
                { icon: Phone, label: 'Voice', onClick: () => participant && startCall(participant.id, 'voice') },
                { icon: Video, label: 'Video', onClick: () => participant && startCall(participant.id, 'video') },
              ].map(({ icon: Icon, label, onClick }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary hover:bg-primary hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-light-muted dark:text-dark-muted">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* About */}
          {participant?.about && (
            <div className="px-4 py-4 border-b border-light-border dark:border-dark-border">
              <p className="text-xs text-light-muted dark:text-dark-muted mb-1 font-medium uppercase tracking-wide">About</p>
              <p className="text-sm text-light-text dark:text-dark-text">{participant.about}</p>
            </div>
          )}

          {/* Phone */}
          {participant?.phone && (
            <div className="px-4 py-4 border-b border-light-border dark:border-dark-border">
              <p className="text-xs text-light-muted dark:text-dark-muted mb-1 font-medium uppercase tracking-wide">Phone</p>
              <p className="text-sm text-light-text dark:text-dark-text font-medium">{participant.phone}</p>
            </div>
          )}

          {/* Media section */}
          <div className="px-4 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wide">Media</p>
              <button className="text-xs text-primary hover:underline">See all</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: `hsl(${240 + i * 20}, 70%, ${70 + i * 3}%)` }}
                />
              ))}
            </div>
          </div>

          {/* Chat theme */}
          <div className="px-4 py-4 border-b border-light-border dark:border-dark-border">
            <p className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wide mb-3">Chat Theme</p>
            <div className="flex gap-2 flex-wrap">
              {CHAT_THEMES.slice(0, 4).map((theme) => (
                <motion.button
                  key={theme.type}
                  whileTap={{ scale: 0.9 }}
                  title={theme.name}
                  className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-dark-surface ring-offset-2"
                  style={{ background: theme.preview }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-4 space-y-1">
            {[
              {
                icon: activeChat.isMuted ? Bell : BellOff,
                label: activeChat.isMuted ? 'Unmute' : 'Mute',
                onClick: () => {
                  muteChat(activeChat.id);
                  addToast({ type: 'info', title: activeChat.isMuted ? 'Unmuted' : 'Muted', duration: 2000 });
                },
                color: 'text-light-text dark:text-dark-text',
              },
              {
                icon: Shield,
                label: 'Block',
                onClick: () => addToast({ type: 'warning', title: 'User blocked', duration: 2000 }),
                color: 'text-amber-500',
              },
              {
                icon: Trash2,
                label: 'Delete chat',
                onClick: () => addToast({ type: 'error', title: 'Chat deleted', duration: 2000 }),
                color: 'text-red-500',
              },
            ].map(({ icon: Icon, label, onClick, color }) => (
              <motion.button
                key={label}
                onClick={onClick}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors',
                  color
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
