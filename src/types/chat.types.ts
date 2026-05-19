import { User } from './auth.types';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'voice' | 'document' | 'gif' | 'sticker';
export type ChatType = 'direct' | 'group' | 'channel';

export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Reply {
  messageId: string;
  text: string;
  senderId: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  media?: MediaAttachment;
  reactions: Reaction[];
  reply?: Reply;
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  timestamp: Date;
  readBy: string[];
}

export interface MediaAttachment {
  url: string;
  thumbnail?: string;
  name?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface TypingUser {
  userId: string;
  chatId: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  theme?: ChatTheme;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatTheme {
  type: 'default' | 'rain' | 'neon' | 'romantic' | 'gaming' | 'midnight';
  bgColor?: string;
  bgImage?: string;
  animated?: boolean;
}

export interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  searchQuery: string;
  isLoading: boolean;
}
