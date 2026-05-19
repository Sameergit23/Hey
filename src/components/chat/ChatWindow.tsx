'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { CURRENT_USER, MOCK_USERS } from '@/constants/mockData';
import Avatar from '@/components/ui/avatars/Avatar';
import { Message } from '@/types/chat.types';
import { formatMessageTime, formatGroupDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import {
  Phone, Video, Info, ArrowLeft,
  Send, Smile, Paperclip, Mic, ImageIcon,
  CheckCheck, Check, Clock, Forward,
} from 'lucide-react';
import { isSameDay } from 'date-fns';
import { messageBubble, messageStagger } from '@/animations/stagger';
import { MessageSkeleton } from '@/components/ui/loaders/Skeleton';
import { useCallStore } from '@/store/callStore';
import HeyPing from './HeyPing';

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '😡', '⚡'];

// Pre-compute waveform heights to avoid hydration mismatch from Math.random()
const WAVEFORM_HEIGHTS = [8, 16, 12, 20, 14, 22, 10, 18, 14, 20, 12, 16];

export default function ChatWindow() {
  const {
    activeChat, messages, typingUsers, isLoadingMessages,
    sendMessage, addReaction, toggleRightPanel, setActiveChat,
  } = useChatStore();
  const { addToast } = useUIStore();
  const { startCall } = useCallStore();
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chatMessages = useMemo(
    () => (activeChat ? messages[activeChat.id] || [] : []),
    [activeChat, messages]
  );
  const participant = activeChat?.participants[0];
  const isTyping = activeChat
    ? typingUsers.some((t) => t.chatId === activeChat.id)
    : false;

  // Scroll to bottom on new messages / typing
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, isTyping]);

  // Auto-resize textarea
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeChat) return;
    sendMessage(activeChat.id, text.trim());
    setText('');
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = '46px';
    inputRef.current?.focus();
  }, [text, activeChat, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleVoiceCall = useCallback(() => {
    if (!participant) return;
    startCall(participant.id, 'voice');
    addToast({ type: 'info', title: `Calling ${participant.name}...`, duration: 2000 });
  }, [participant, startCall, addToast]);

  const handleVideoCall = useCallback(() => {
    if (!participant) return;
    startCall(participant.id, 'video');
    addToast({ type: 'info', title: `Video calling ${participant.name}...`, duration: 2000 });
  }, [participant, startCall, addToast]);

  const dismissPopovers = useCallback(() => setReactionTarget(null), []);

  // Group messages by date
  const grouped = useMemo(() => {
    const groups: { date: Date; messages: Message[] }[] = [];
    chatMessages.forEach((msg) => {
      const last = groups[groups.length - 1];
      if (!last || !isSameDay(last.date, msg.timestamp)) {
        groups.push({ date: msg.timestamp, messages: [msg] });
      } else {
        last.messages.push(msg);
      }
    });
    return groups;
  }, [chatMessages]);

  if (!activeChat) return <EmptyState />;

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 relative bg-light-bg dark:bg-dark-bg">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border z-10 shrink-0">
        <button
          onClick={() => setActiveChat(null)}
          aria-label="Go back"
          className="md:hidden p-2 -ml-1 rounded-xl hover:bg-primary/10 text-light-muted dark:text-dark-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Avatar
          user={participant}
          src={activeChat.avatar}
          name={activeChat.name}
          size="md"
          showOnline={activeChat.type === 'direct'}
          isOnline={participant?.isOnline}
          glowing
          onClick={toggleRightPanel}
        />

        <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={toggleRightPanel}>
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text truncate leading-tight">
              {activeChat.name || participant?.name}
            </h2>
            {participant?.mood && (
              <span className="text-sm leading-none">{participant.mood.emoji}</span>
            )}
          </div>
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 mt-0.5"
              >
                <div className="flex gap-0.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs text-primary font-medium">typing…</span>
              </motion.div>
            ) : (
              <motion.p
                key="status"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs text-light-muted dark:text-dark-muted mt-0.5 truncate"
              >
                {participant?.isOnline
                  ? '● Online'
                  : participant?.mood
                    ? `${participant.mood.emoji} ${participant.mood.text}`
                    : 'Offline'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <HeyPing chatId={activeChat.id} participantName={participant?.name || ''} />
          {[
            { icon: Phone, label: 'Voice call', action: handleVoiceCall },
            { icon: Video, label: 'Video call', action: handleVideoCall },
            { icon: Info,  label: 'Info',       action: toggleRightPanel },
          ].map(({ icon: Icon, label, action }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.88 }}
              onClick={action}
              aria-label={label}
              className="p-2 rounded-xl text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Icon className="w-[18px] h-[18px]" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain chat-bg-pattern pb-2"
        onClick={dismissPopovers}
      >
        {isLoadingMessages ? (
          <div className="space-y-5 px-4 pt-4">
            {([false, true, false, true, false] as boolean[]).map((sent, i) => (
              <MessageSkeleton key={i} isSent={sent} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={messageStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col pt-2"
          >
            {grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date.toISOString()}>
                {/* Date chip */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 h-px bg-light-border/60 dark:bg-dark-border/60" />
                  <span className="text-[11px] text-light-muted dark:text-dark-muted font-medium px-2.5 py-1 bg-white dark:bg-dark-surface rounded-full border border-light-border dark:border-dark-border select-none">
                    {formatGroupDate(date)}
                  </span>
                  <div className="flex-1 h-px bg-light-border/60 dark:bg-dark-border/60" />
                </div>

                <div className="space-y-0.5">
                  {dayMsgs.map((msg, idx) => {
                    const prevMsg = idx > 0 ? dayMsgs[idx - 1] : null;
                    const isConsecutive = prevMsg?.senderId === msg.senderId;
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSent={msg.senderId === CURRENT_USER.id}
                        isConsecutive={isConsecutive}
                        showReactions={reactionTarget === msg.id}
                        onReactionToggle={(id) =>
                          setReactionTarget(id === reactionTarget ? null : id)
                        }
                        onReact={(emoji) => {
                          if (activeChat) addReaction(activeChat.id, msg.id, emoji);
                          setReactionTarget(null);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing bubble */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="flex items-end gap-2 px-4 pb-1 mt-1"
                >
                  <Avatar user={participant} size="sm" />
                  <div className="message-bubble-received flex items-center gap-1.5 !py-3 !px-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── Composer ── */}
      <div className="shrink-0 px-3 sm:px-4 py-2.5 bg-white dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
        {/* Attachment tray */}
        <AnimatePresence>
          {showAttach && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex gap-4 pb-3 pt-1">
                {[
                  { icon: ImageIcon, label: 'Photo',    bg: 'bg-blue-100 dark:bg-blue-900/30',   color: 'text-blue-600 dark:text-blue-400' },
                  { icon: Paperclip, label: 'File',     bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
                  { icon: Mic,       label: 'Audio',    bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
                ].map(({ icon: Icon, label, bg, color }) => (
                  <motion.button
                    key={label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label={label}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={cn('p-3.5 rounded-2xl', bg, color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-light-muted dark:text-dark-muted font-medium">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div className="flex items-end gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowAttach(!showAttach)}
            aria-label="Attachments"
            className={cn(
              'p-2.5 rounded-xl transition-colors shrink-0 mb-0.5',
              showAttach
                ? 'text-primary bg-primary/10'
                : 'text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10'
            )}
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          <div className="flex-1 relative min-w-0">
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Message…"
              rows={1}
              aria-label="Message input"
              className="w-full input-field resize-none py-2.5 pr-10 min-h-[42px] max-h-[120px] leading-relaxed text-[15px]"
              style={{ height: '42px' }}
            />
            <button
              aria-label="Emoji"
              className="absolute right-3 bottom-2.5 text-light-muted dark:text-dark-muted hover:text-primary transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {text.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleSend}
                aria-label="Send"
                className="p-2.5 rounded-2xl text-white shrink-0 mb-0.5"
                style={{ background: 'linear-gradient(135deg,#6C63FF,#8B5CF6)' }}
              >
                <Send className="w-[18px] h-[18px]" />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                whileTap={{ scale: 0.88 }}
                onPointerDown={() => setIsRecording(true)}
                onPointerUp={() => setIsRecording(false)}
                onPointerLeave={() => setIsRecording(false)}
                aria-label={isRecording ? 'Recording' : 'Hold to record'}
                className={cn(
                  'p-2.5 rounded-2xl transition-all duration-200 shrink-0 mb-0.5',
                  isRecording
                    ? 'bg-red-500 text-white shadow-lg scale-110'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <Mic className="w-[18px] h-[18px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-2 overflow-hidden"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
              <div className="flex gap-0.5 items-end h-5">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="waveform-bar"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-red-500 font-medium ml-1">Recording…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({
  message,
  isSent,
  isConsecutive,
  showReactions,
  onReactionToggle,
  onReact,
}: {
  message: Message;
  isSent: boolean;
  isConsecutive: boolean;
  showReactions: boolean;
  onReactionToggle: (id: string) => void;
  onReact: (emoji: string) => void;
}) {
  const participant = useMemo(
    () => MOCK_USERS.find((u) => u.id === message.senderId),
    [message.senderId]
  );

  return (
    <motion.div
      variants={messageBubble}
      className={cn(
        'flex items-end gap-2 px-4 group',
        isSent && 'flex-row-reverse',
        isConsecutive ? 'mt-0.5' : 'mt-3'
      )}
    >
      {/* Avatar — hide for consecutive messages from same sender */}
      {!isSent && (
        <div className="w-7 shrink-0">
          {!isConsecutive && <Avatar user={participant} size="sm" />}
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5 max-w-[72%] sm:max-w-[65%]', isSent && 'items-end')}>
        {message.isForwarded && (
          <span className="text-[11px] text-light-muted dark:text-dark-muted italic flex items-center gap-1 px-1">
            <Forward className="w-3 h-3" /> Forwarded
          </span>
        )}

        <div className="relative group/bubble">
          <motion.div
            className={isSent ? 'message-bubble-sent' : 'message-bubble-received'}
            onDoubleClick={() => onReact('❤️')}
            layout
          >
            {message.isDeleted ? (
              <span className="italic opacity-50 text-[13px]">Message deleted</span>
            ) : (
              <span className="text-[14.5px] leading-[1.45]">{message.text}</span>
            )}
            {message.isEdited && !message.isDeleted && (
              <span className="text-[10px] opacity-50 ml-1.5">edited</span>
            )}
          </motion.div>

          {/* Reaction trigger — appears on hover */}
          <motion.button
            className={cn(
              'absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full',
              'bg-white dark:bg-dark-surface-2 shadow-md',
              'opacity-0 group-hover/bubble:opacity-100',
              'transition-opacity duration-150 z-10',
              isSent ? 'right-full mr-1.5' : 'left-full ml-1.5'
            )}
            onClick={() => onReactionToggle(message.id)}
            whileTap={{ scale: 0.88 }}
            aria-label="React"
          >
            <Smile className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
          </motion.button>
        </div>

        {/* Reaction chips */}
        <AnimatePresence>
          {message.reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn('flex flex-wrap gap-1 px-1', isSent && 'justify-end')}
            >
              {Object.entries(
                message.reactions.reduce<Record<string, number>>((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(emoji)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-dark-surface-2 rounded-full text-[12px] border border-light-border dark:border-dark-border shadow-sm"
                >
                  {emoji}{count > 1 && <span className="ml-0.5 text-light-muted dark:text-dark-muted">{count}</span>}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'flex gap-0.5 p-1.5 bg-white dark:bg-dark-surface-2 rounded-2xl',
                'shadow-xl border border-light-border dark:border-dark-border z-30',
                isSent ? 'self-end' : 'self-start'
              )}
            >
              {REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.35, y: -2 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => onReact(emoji)}
                  className="text-[18px] p-1 leading-none"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timestamp + status */}
        <div className={cn('flex items-center gap-1 px-1', isSent && 'flex-row-reverse')}>
          <span className="text-[10px] text-light-muted dark:text-dark-muted tabular-nums select-none">
            {formatMessageTime(message.timestamp)}
          </span>
          {isSent && <MessageStatus status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
});

function MessageStatus({ status }: { status: Message['status'] }) {
  if (status === 'sending')   return <Clock      className="w-3 h-3 text-light-muted dark:text-dark-muted" />;
  if (status === 'sent')      return <Check      className="w-3 h-3 text-light-muted dark:text-dark-muted" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-light-muted dark:text-dark-muted" />;
  if (status === 'seen')      return <CheckCheck className="w-3 h-3 text-primary" />;
  return null;
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden md:flex flex-1 flex-col items-center justify-center gap-5 bg-light-bg dark:bg-dark-bg select-none"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl"
      >
        👋
      </motion.div>
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text font-display">Say Hey!</h2>
        <p className="text-light-muted dark:text-dark-muted text-sm max-w-[240px] leading-relaxed">
          Pick a conversation to start messaging. End-to-end encrypted.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-light-muted dark:text-dark-muted bg-white dark:bg-dark-surface px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border">
        <div className="w-1.5 h-1.5 bg-online rounded-full" />
        End-to-end encrypted
      </div>
    </motion.div>
  );
}
