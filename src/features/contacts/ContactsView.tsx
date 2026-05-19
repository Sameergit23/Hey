'use client';

import { motion } from 'framer-motion';
import { MOCK_USERS } from '@/constants/mockData';
import Avatar from '@/components/ui/avatars/Avatar';
import { Search, UserPlus, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { formatLastSeen } from '@/utils/formatDate';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';

export default function ContactsView() {
  const [search, setSearch] = useState('');
  const { setActiveTab } = useUIStore();
  const { chats, setActiveChat } = useChatStore();

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessage = (userId: string) => {
    const chat = chats.find(c => c.participants.some(p => p.id === userId));
    if (chat) {
      setActiveChat(chat);
      setActiveTab('chats');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text font-display">Contacts</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Online */}
        <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">
          Online — {filtered.filter(u => u.isOnline).length}
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1 mb-6"
        >
          {filtered.filter(u => u.isOnline).map(user => (
            <ContactCard key={user.id} user={user} onMessage={() => handleMessage(user.id)} />
          ))}
        </motion.div>

        <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">
          All contacts — {filtered.length}
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {filtered.map(user => (
            <ContactCard key={user.id} user={user} onMessage={() => handleMessage(user.id)} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ContactCard({ user, onMessage }: { user: typeof MOCK_USERS[0]; onMessage: () => void }) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-dark-surface transition-colors group cursor-pointer"
      whileHover={{ x: 2 }}
    >
      <Avatar user={user} size="md" showOnline isOnline={user.isOnline} glowing={user.isOnline} showMood />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm text-light-text dark:text-dark-text truncate">{user.name}</p>
          {user.mood && <span className="text-xs">{user.mood.emoji}</span>}
        </div>
        <p className="text-xs text-light-muted dark:text-dark-muted truncate">
          {user.isOnline ? 'Active now' : `Last seen ${formatLastSeen(user.lastSeen)}`}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMessage}
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
