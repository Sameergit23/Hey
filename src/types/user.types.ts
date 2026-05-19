export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar: string;
  about: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified?: boolean;
  mood?: {
    emoji: string;
    text: string;
  };
}

export type Theme = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  messages: boolean;
  calls: boolean;
  mentions: boolean;
  sounds: boolean;
  vibration: boolean;
}

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  about: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
}
