import { create } from 'zustand';
import { Chat, Message, TypingUser } from '@/types/chat.types';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';

interface ChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  searchQuery: string;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  rightPanelOpen: boolean;
  onlineUsers: Set<string>;

  // Chat actions
  fetchChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => Promise<void>;
  createDirectChat: (recipientId: string) => Promise<Chat | null>;
  createGroupChat: (name: string, memberIds: string[], description?: string) => Promise<Chat | null>;
  updateChat: (chatId: string, updates: any) => Promise<void>;
  pinChat: (chatId: string) => Promise<void>;
  muteChat: (chatId: string) => Promise<void>;
  archiveChat: (chatId: string) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;

  // Message actions
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string, replyToId?: string) => void;
  editMessage: (chatId: string, messageId: string, text: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  addReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;
  removeReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;

  // Realtime actions
  handleNewMessage: (message: Message) => void;
  handleMessageDelivered: (data: { messageId: string; userId: string }) => void;
  handleMessageRead: (data: { messageId: string; userId: string }) => void;
  handleUserOnline: (userId: string) => void;
  handleUserOffline: (userId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;

  // UI actions
  setSearchQuery: (q: string) => void;
  toggleRightPanel: () => void;
  clearUnreadCount: (chatId: string) => Promise<void>;

  // Socket setup
  setupSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: [],
  searchQuery: '',
  isLoadingChats: false,
  isLoadingMessages: false,
  rightPanelOpen: false,
  onlineUsers: new Set(),

  // ═══════════════════════════════════════════════
  // CHAT ACTIONS
  // ═══════════════════════════════════════════════
  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const chats = await api.getChats();
      set({ chats, isLoadingChats: false });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      set({ isLoadingChats: false });
    }
  },

  setActiveChat: async (chat) => {
    set({ activeChat: chat, isLoadingMessages: true });
    
    if (chat) {
      try {
        const messages = await api.getMessages(chat.id);
        set((state) => ({
          messages: { ...state.messages, [chat.id]: messages },
          isLoadingMessages: false,
        }));

        // Clear unread count
        await get().clearUnreadCount(chat.id);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        set({ isLoadingMessages: false });
      }
    } else {
      set({ isLoadingMessages: false });
    }
  },

  createDirectChat: async (recipientId) => {
    try {
      const chat = await api.createDirectChat(recipientId);
      set((state) => ({
        chats: [chat, ...state.chats],
      }));
      return chat;
    } catch (error) {
      console.error('Failed to create direct chat:', error);
      return null;
    }
  },

  createGroupChat: async (name, memberIds, description) => {
    try {
      const chat = await api.createGroupChat(name, memberIds, description);
      set((state) => ({
        chats: [chat, ...state.chats],
      }));
      return chat;
    } catch (error) {
      console.error('Failed to create group chat:', error);
      return null;
    }
  },

  updateChat: async (chatId, updates) => {
    try {
      const updatedChat = await api.updateChat(chatId, updates);
      set((state) => ({
        chats: state.chats.map((c) => (c.id === chatId ? updatedChat : c)),
        activeChat: state.activeChat?.id === chatId ? updatedChat : state.activeChat,
      }));
    } catch (error) {
      console.error('Failed to update chat:', error);
    }
  },

  pinChat: async (chatId) => {
    try {
      const chat = get().chats.find((c) => c.id === chatId);
      if (!chat) return;

      await api.updateChatSettings(chatId, { isPinned: !chat.isPinned });
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
        ),
      }));
    } catch (error) {
      console.error('Failed to pin chat:', error);
    }
  },

  muteChat: async (chatId) => {
    try {
      const chat = get().chats.find((c) => c.id === chatId);
      if (!chat) return;

      await api.updateChatSettings(chatId, { isMuted: !chat.isMuted });
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
        ),
      }));
    } catch (error) {
      console.error('Failed to mute chat:', error);
    }
  },

  archiveChat: async (chatId) => {
    try {
      const chat = get().chats.find((c) => c.id === chatId);
      if (!chat) return;

      await api.updateChatSettings(chatId, { isArchived: !chat.isArchived });
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, isArchived: !c.isArchived } : c
        ),
      }));
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  },

  leaveChat: async (chatId) => {
    try {
      await api.leaveChat(chatId);
      set((state) => ({
        chats: state.chats.filter((c) => c.id !== chatId),
        activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
      }));
    } catch (error) {
      console.error('Failed to leave chat:', error);
    }
  },

  // ═══════════════════════════════════════════════
  // MESSAGE ACTIONS
  // ═══════════════════════════════════════════════
  fetchMessages: async (chatId) => {
    try {
      const messages = await api.getMessages(chatId);
      set((state) => ({
        messages: { ...state.messages, [chatId]: messages },
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: (chatId, text, replyToId) => {
    // Send via Socket.IO for realtime delivery
    socket.sendMessage({ chatId, text, replyToId }, (response) => {
      if (!response.success) {
        console.error('Failed to send message:', response.error);
      }
    });
  },

  editMessage: async (chatId, messageId, text) => {
    try {
      socket.editMessage({ messageId, text, chatId }, (response) => {
        if (response.success) {
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.map((m) =>
                m.id === messageId ? response.message : m
              ),
            },
          }));
        }
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  },

  deleteMessage: async (chatId, messageId) => {
    try {
      socket.deleteMessage({ messageId, chatId }, (response) => {
        if (response.success) {
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.map((m) =>
                m.id === messageId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m
              ),
            },
          }));
        }
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  },

  addReaction: async (chatId, messageId, emoji) => {
    try {
      socket.reactToMessage({ messageId, emoji, chatId }, (response) => {
        if (response.success) {
          // Reaction will be updated via socket event
        }
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  },

  removeReaction: async (chatId, messageId, emoji) => {
    try {
      socket.unreactToMessage({ messageId, emoji, chatId }, (response) => {
        if (response.success) {
          // Reaction will be updated via socket event
        }
      });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  },

  // ═══════════════════════════════════════════════
  // REALTIME HANDLERS
  // ═══════════════════════════════════════════════
  handleNewMessage: (message) => {
    set((state) => {
      const chatId = message.chatId;
      const existingMessages = state.messages[chatId] || [];
      
      // Check if message already exists
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message],
        },
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: message,
                updatedAt: message.timestamp,
                unreadCount: state.activeChat?.id === chatId ? 0 : c.unreadCount + 1,
              }
            : c
        ),
      };
    });

    // Mark as delivered if chat is active
    const { activeChat } = get();
    if (activeChat?.id === message.chatId) {
      socket.markMessageDelivered(message.id, message.chatId);
      socket.markMessageRead(message.id, message.chatId);
    }
  },

  handleMessageDelivered: (data) => {
    set((state) => {
      const chatMessages = state.messages[state.activeChat?.id || ''];
      if (!chatMessages) return state;

      return {
        messages: {
          ...state.messages,
          [state.activeChat!.id]: chatMessages.map((m) =>
            m.id === data.messageId ? { ...m, status: 'delivered' } : m
          ),
        },
      };
    });
  },

  handleMessageRead: (data) => {
    set((state) => {
      const chatMessages = state.messages[state.activeChat?.id || ''];
      if (!chatMessages) return state;

      return {
        messages: {
          ...state.messages,
          [state.activeChat!.id]: chatMessages.map((m) =>
            m.id === data.messageId ? { ...m, status: 'seen' } : m
          ),
        },
      };
    });
  },

  handleUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
      chats: state.chats.map((chat) => ({
        ...chat,
        participants: chat.participants?.map((p) =>
          p.id === userId ? { ...p, isOnline: true } : p
        ),
      })),
    }));
  },

  handleUserOffline: (userId) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      
      return {
        onlineUsers: newOnlineUsers,
        chats: state.chats.map((chat) => ({
          ...chat,
          participants: chat.participants?.map((p) =>
            p.id === userId ? { ...p, isOnline: false, lastSeen: new Date() } : p
          ),
        })),
      };
    });
  },

  setTyping: (chatId, userId, isTyping) => {
    set((state) => ({
      typingUsers: isTyping
        ? [...state.typingUsers.filter((t) => t.userId !== userId), { userId, chatId }]
        : state.typingUsers.filter((t) => t.userId !== userId),
    }));
  },

  startTyping: (chatId) => {
    socket.startTyping(chatId);
  },

  stopTyping: (chatId) => {
    socket.stopTyping(chatId);
  },

  // ═══════════════════════════════════════════════
  // UI ACTIONS
  // ═══════════════════════════════════════════════
  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  clearUnreadCount: async (chatId) => {
    try {
      await api.clearUnreadCount(chatId);
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (error) {
      console.error('Failed to clear unread count:', error);
    }
  },

  // ═══════════════════════════════════════════════
  // SOCKET SETUP
  // ═══════════════════════════════════════════════
  setupSocketListeners: () => {
    const store = get();

    // Message events
    socket.onMessageReceived(store.handleNewMessage);
    socket.onMessageDelivered(store.handleMessageDelivered);
    socket.onMessageRead(store.handleMessageRead);

    // Presence events
    socket.onUserOnline((data) => store.handleUserOnline(data.userId));
    socket.onUserOffline((data) => store.handleUserOffline(data.userId));

    // Typing events
    socket.onUserTyping((data) => store.setTyping(data.chatId, data.userId, true));
    socket.onUserStopTyping((data) => store.setTyping(data.chatId, data.userId, false));

    // Chat events
    socket.onChatCreated((chat) => {
      set((state) => ({
        chats: [chat, ...state.chats],
      }));
    });

    socket.onChatUpdated((chat) => {
      set((state) => ({
        chats: state.chats.map((c) => (c.id === chat.id ? chat : c)),
      }));
    });
  },

  cleanupSocketListeners: () => {
    socket.off('message:received');
    socket.off('message:delivered');
    socket.off('message:read');
    socket.off('user:online');
    socket.off('user:offline');
    socket.off('user:typing');
    socket.off('user:stop_typing');
    socket.off('chat:created');
    socket.off('chat:updated');
  },
}));
