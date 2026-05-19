'use client';

import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { Chat } from '@/types/chat.types';
import Avatar from '@/components/ui/avatars/Avatar';
import { formatChatTime, truncate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { Pin, VolumeX, Search, Plus, Filter, X } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/animations/stagger';

export default function ChatList() {
  const { chats, activeChat, setActiveChat, searchQuery, setSearchQuery } = useChatStore();
  const [filterPinned, setFilterPinned] = useState(false);

  const filtered = useMemo(() =>
    chats
      .filter((c) => {
        const name = c.name || c.participants[0]?.name || '';
        const lastMsg = c.lastMessage?.text || '';
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q || name.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
        return matchesSearch && (!filterPinned || c.isPinned);
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [chats, searchQuery, filterPinned]
  );

  const pinnedCount = chats.filter((c) => c.isPinned).length;

  return (
    <div className="flex flex-col h-full w-full md:w-[310px] lg:w-[340px] bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[19px] font-bold text-light-text dark:text-dark-text font-display tracking-tight">
            Messages
          </h1>
          <div className="flex items-center gap-1">
            {pinnedCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setFilterPinned(!filterPinned)}
                aria-label={filterPinned ? 'Show all chats' : 'Show pinned only'}
                className={cn(
                  'p-2 rounded-xl transition-colors text-sm font-medium',
                  filterPinned
                    ? 'text-primary bg-primary/10'
                    : 'text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10'
                )}
              >
                <Filter className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              aria-label="New chat"
              className="p-2 rounded-xl text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-light-muted dark:text-dark-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search messages"
            className="input-field pl-8 py-2 text-sm"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-20 md:pb-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
            >
              <span className="text-3xl">
                {searchQuery ? '🔍' : filterPinned ? '📌' : '💬'}
              </span>
              <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : filterPinned
                    ? 'No pinned chats yet'
                    : 'No conversations yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-0.5"
            >
              {filtered.map((chat) => (
                <motion.div key={chat.id} variants={staggerItem} layout>
                  <ChatCard
                    chat={chat}
                    isActive={activeChat?.id === chat.id}
                    onClick={() => setActiveChat(chat)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ChatCard = memo(function ChatCard({
  chat,
  isActive,
  onClick,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}) {
  const participant = chat.participants[0];
  const displayName = chat.name || participant?.name || 'Unknown';
  const lastMsg = chat.lastMessage;
  const hasUnread = chat.unreadCount > 0;
  const { typingUsers } = useChatStore();
  const isTyping = typingUsers.some((t) => t.chatId === chat.id);

  const lastMsgText = useMemo(() => {
    if (!lastMsg) return 'No messages yet';
    if (lastMsg.isDeleted) return '🚫 Message deleted';
    if (lastMsg.senderId === 'me' && lastMsg.text) return `You: ${truncate(lastMsg.text, 35)}`;
    return truncate(lastMsg.text || '', 40);
  }, [lastMsg]);

  return (
    <motion.button
      onClick={onClick}
      layout
      className={cn(
        'chat-card w-full text-left',
        isActive && 'active'
      )}
      whileHover={isActive ? {} : { x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      aria-label={`Chat with ${displayName}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="relative shrink-0">
        <Avatar
          user={participant}
          src={chat.avatar}
          name={chat.name}
          size="md"
          showOnline={chat.type === 'direct'}
          isOnline={participant?.isOnline}
          showMood={!isActive && !isTyping}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className={cn(
              'font-semibold text-[13.5px] truncate leading-tight',
              isActive ? 'text-primary' : 'text-light-text dark:text-dark-text'
            )}>
              {displayName}
            </span>
            {chat.isPinned && <Pin className="w-2.5 h-2.5 text-primary/60 shrink-0" />}
            {chat.isMuted && <VolumeX className="w-2.5 h-2.5 text-light-muted dark:text-dark-muted shrink-0" />}
          </div>
          <span className="text-[11px] text-light-muted dark:text-dark-muted shrink-0 tabular-nums">
            {lastMsg ? formatChatTime(lastMsg.timestamp) : ''}
          </span>
        </div>

        {/* Preview row */}
        <div className="flex items-center justify-between gap-2">
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="typing-dot !w-1.5 !h-1.5" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-[12px] text-primary font-medium">typing…</span>
              </motion.div>
            ) : (
              <motion.p
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'text-[12.5px] truncate leading-tight',
                  hasUnread
                    ? 'text-light-text dark:text-dark-text font-medium'
                    : 'text-light-muted dark:text-dark-muted'
                )}
              >
                {lastMsgText}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasUnread && !isTyping && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="glow-badge shrink-0"
              >
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
});
