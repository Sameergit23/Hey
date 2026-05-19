'use client';

import { motion } from 'framer-motion';
import { useCallStore } from '@/store/callStore';
import { MOCK_USERS } from '@/constants/mockData';
import Avatar from '@/components/ui/avatars/Avatar';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall } from 'lucide-react';
import { formatChatTime, formatCallDuration } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/stagger';

export default function CallsView() {
  const { callLogs, startCall } = useCallStore();

  return (
    <div className="flex flex-col flex-1 h-full bg-light-bg dark:bg-dark-bg overflow-hidden">
      <div className="px-6 pt-8 pb-4 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text font-display">Calls</h1>
        <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Recent call history</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Quick dial */}
        <div className="mb-6">
          <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">Online now</p>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {MOCK_USERS.filter(u => u.isOnline).map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                onClick={() => startCall(user.id, 'voice')}
              >
                <Avatar user={user} size="lg" showOnline isOnline glowing />
                <span className="text-xs text-light-text dark:text-dark-text font-medium">
                  {user.name.split(' ')[0]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call logs */}
        <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">Recent</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {callLogs.map((log) => {
            const StatusIcon = log.status === 'incoming' ? PhoneIncoming
              : log.status === 'outgoing' ? PhoneOutgoing : PhoneMissed;

            return (
              <motion.div
                key={log.id}
                variants={staggerItem}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-dark-surface transition-colors group"
              >
                <div className="relative">
                  <Avatar src={log.participantAvatar} name={log.participantName} size="md" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-light-text dark:text-dark-text">{log.participantName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusIcon className={cn(
                      'w-3.5 h-3.5',
                      log.status === 'missed' ? 'text-red-500' : 'text-green-500'
                    )} />
                    <span className={cn(
                      'text-xs',
                      log.status === 'missed' ? 'text-red-500' : 'text-light-muted dark:text-dark-muted'
                    )}>
                      {log.status === 'incoming' ? 'Incoming' : log.status === 'outgoing' ? 'Outgoing' : 'Missed'}
                      {log.duration ? ` · ${formatCallDuration(log.duration)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-light-muted dark:text-dark-muted">
                    {formatChatTime(log.timestamp)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startCall(log.participantId, 'voice')}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startCall(log.participantId, 'video')}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
