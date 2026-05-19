import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user.types';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  phone: string;
  countryCode: string;
  countryFlag: string;
  otpSent: boolean;
  isLoading: boolean;
  error: string | null;
  setPhone: (phone: string) => void;
  setCountry: (code: string, flag: string) => void;
  sendOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  signup: (name: string, username: string, otp: string) => Promise<boolean>;
  login: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (updates: { name?: string; username?: string; about?: string; avatar?: string }) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      phone: '',
      countryCode: '+91',
      countryFlag: '🇮🇳',
      otpSent: false,
      isLoading: false,
      error: null,

      setPhone: (phone) => set({ phone, error: null }),
      setCountry: (code, flag) => set({ countryCode: code, countryFlag: flag }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      sendOtp: async () => {
        const { phone, countryCode } = get();
        set({ isLoading: true, error: null });
        
        try {
          await api.sendOtp(phone, countryCode);
          set({ isLoading: false, otpSent: true });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Failed to send OTP';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      verifyOtp: async (otp) => {
        const { phone, countryCode } = get();
        set({ isLoading: true, error: null });
        
        try {
          await api.verifyOtp(phone, countryCode, otp);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Invalid OTP';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      signup: async (name, username, otp) => {
        const { phone, countryCode } = get();
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.signup(phone, countryCode, otp, name, username);
          const user = response.data.user;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            otpSent: false,
          });

          // Connect socket
          const token = localStorage.getItem('accessToken');
          if (token) {
            socket.connect(token);
          }

          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Signup failed';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      login: async (otp) => {
        const { phone, countryCode } = get();
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.login(phone, countryCode, otp);
          const user = response.data.user;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            otpSent: false,
          });

          // Connect socket
          const token = localStorage.getItem('accessToken');
          if (token) {
            socket.connect(token);
          }

          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.logout();
          socket.disconnect();
          
          set({
            user: null,
            isAuthenticated: false,
            phone: '',
            otpSent: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if API call fails
          socket.disconnect();
          set({
            user: null,
            isAuthenticated: false,
            phone: '',
            otpSent: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });

          // Connect socket if not connected
          const token = localStorage.getItem('accessToken');
          if (token && !socket.isConnected()) {
            socket.connect(token);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, isAuthenticated: false });
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await api.updateProfile(updates);
          set({ user, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Failed to update profile';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },
    }),
    {
      name: 'hey-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
