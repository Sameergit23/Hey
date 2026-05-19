export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar: string;
  about: string;
  mood?: MoodStatus;
  isOnline: boolean;
  lastSeen: Date;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  phone: string;
  countryCode: string;
  otpSent: boolean;
}

export interface LoginPayload {
  phone: string;
  countryCode: string;
}

export interface OtpPayload {
  phone: string;
  otp: string;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface MoodStatus {
  emoji: string;
  text: string;
  type: 'vibing' | 'gaming' | 'chill' | 'busy' | 'studying' | 'traveling' | 'custom';
}
