import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              this.setTokens(data.data.accessToken, data.data.refreshToken);
              originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // ═══════════════════════════════════════════════
  // AUTH ENDPOINTS
  // ═══════════════════════════════════════════════
  async sendOtp(phone: string, countryCode: string) {
    const { data } = await this.client.post('/auth/otp/send', { phone, countryCode });
    return data;
  }

  async verifyOtp(phone: string, countryCode: string, code: string) {
    const { data } = await this.client.post('/auth/otp/verify', { phone, countryCode, code });
    return data;
  }

  async signup(phone: string, countryCode: string, code: string, name: string, username: string) {
    const { data } = await this.client.post('/auth/signup', {
      phone,
      countryCode,
      code,
      name,
      username,
    });
    this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
    return data;
  }

  async login(phone: string, countryCode: string, code: string) {
    const { data } = await this.client.post('/auth/login', { phone, countryCode, code });
    this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
    return data;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    await this.client.post('/auth/logout', { refreshToken });
    this.clearTokens();
  }

  // ═══════════════════════════════════════════════
  // USER ENDPOINTS
  // ═══════════════════════════════════════════════
  async getMe() {
    const { data } = await this.client.get('/users/me');
    return data.data.user;
  }

  async getUserById(userId: string) {
    const { data } = await this.client.get(`/users/${userId}`);
    return data.data.user;
  }

  async getUserByUsername(username: string) {
    const { data } = await this.client.get(`/users/username/${username}`);
    return data.data.user;
  }

  async updateProfile(updates: { name?: string; username?: string; about?: string; avatar?: string }) {
    const { data } = await this.client.patch('/users/me', updates);
    return data.data.user;
  }

  async searchUsers(query: string, limit = 20) {
    const { data } = await this.client.get('/users/search', { params: { q: query, limit } });
    return data.data.users;
  }

  async blockUser(userId: string) {
    const { data } = await this.client.post(`/users/block/${userId}`);
    return data;
  }

  async unblockUser(userId: string) {
    const { data } = await this.client.delete(`/users/block/${userId}`);
    return data;
  }

  async getBlockedUsers() {
    const { data } = await this.client.get('/users/blocked');
    return data.data.users;
  }

  // ═══════════════════════════════════════════════
  // CHAT ENDPOINTS
  // ═══════════════════════════════════════════════
  async getChats(limit = 50, cursor?: string) {
    const { data } = await this.client.get('/chats', { params: { limit, cursor } });
    return data.data.chats;
  }

  async getChatById(chatId: string) {
    const { data } = await this.client.get(`/chats/${chatId}`);
    return data.data.chat;
  }

  async createDirectChat(recipientId: string) {
    const { data } = await this.client.post('/chats/direct', { recipientId });
    return data.data.chat;
  }

  async createGroupChat(name: string, memberIds: string[], description?: string) {
    const { data } = await this.client.post('/chats/group', { name, memberIds, description });
    return data.data.chat;
  }

  async updateChat(chatId: string, updates: { name?: string; description?: string; avatar?: string }) {
    const { data } = await this.client.patch(`/chats/${chatId}`, updates);
    return data.data.chat;
  }

  async addMembers(chatId: string, memberIds: string[]) {
    const { data } = await this.client.post(`/chats/${chatId}/members`, { memberIds });
    return data.data.chat;
  }

  async removeMember(chatId: string, userId: string) {
    const { data } = await this.client.delete(`/chats/${chatId}/members/${userId}`);
    return data;
  }

  async leaveChat(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/leave`);
    return data;
  }

  async updateChatSettings(chatId: string, settings: { isPinned?: boolean; isMuted?: boolean; isArchived?: boolean }) {
    const { data } = await this.client.patch(`/chats/${chatId}/settings`, settings);
    return data.data.member;
  }

  async clearUnreadCount(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/clear-unread`);
    return data;
  }

  // ═══════════════════════════════════════════════
  // MESSAGE ENDPOINTS
  // ═══════════════════════════════════════════════
  async getMessages(chatId: string, limit = 50, cursor?: string) {
    const { data } = await this.client.get(`/messages/${chatId}`, { params: { limit, cursor } });
    return data.data.messages;
  }

  async sendMessage(chatId: string, text: string, type = 'TEXT', replyToId?: string) {
    const { data } = await this.client.post('/messages', { chatId, text, type, replyToId });
    return data.data.message;
  }

  async editMessage(messageId: string, text: string) {
    const { data } = await this.client.patch(`/messages/${messageId}`, { text });
    return data.data.message;
  }

  async deleteMessage(messageId: string) {
    const { data } = await this.client.delete(`/messages/${messageId}`);
    return data;
  }

  async addReaction(messageId: string, emoji: string) {
    const { data } = await this.client.post(`/messages/${messageId}/react`, { emoji });
    return data.data.reaction;
  }

  async removeReaction(messageId: string, emoji: string) {
    const { data } = await this.client.delete(`/messages/${messageId}/react`, { data: { emoji } });
    return data;
  }

  async searchMessages(chatId: string, query: string, limit = 20) {
    const { data } = await this.client.get(`/messages/${chatId}/search`, { params: { q: query, limit } });
    return data.data.messages;
  }

  // ═══════════════════════════════════════════════
  // CONTACT ENDPOINTS
  // ═══════════════════════════════════════════════
  async getContacts() {
    const { data } = await this.client.get('/contacts');
    return data.data.contacts;
  }

  async addContact(contactId: string, nickname?: string) {
    const { data } = await this.client.post('/contacts', { contactId, nickname });
    return data.data.contact;
  }

  async removeContact(contactId: string) {
    const { data } = await this.client.delete(`/contacts/${contactId}`);
    return data;
  }

  async updateContactNickname(contactId: string, nickname: string) {
    const { data } = await this.client.patch(`/contacts/${contactId}`, { nickname });
    return data.data.contact;
  }

  // ═══════════════════════════════════════════════
  // CALL ENDPOINTS
  // ═══════════════════════════════════════════════
  async getCallHistory(limit = 50, cursor?: string) {
    const { data } = await this.client.get('/calls/history', { params: { limit, cursor } });
    return data.data.calls;
  }

  async getCallById(callId: string) {
    const { data } = await this.client.get(`/calls/${callId}`);
    return data.data.call;
  }

  // ═══════════════════════════════════════════════
  // NOTIFICATION ENDPOINTS
  // ═══════════════════════════════════════════════
  async getNotifications(limit = 50, cursor?: string) {
    const { data } = await this.client.get('/notifications', { params: { limit, cursor } });
    return data.data.notifications;
  }

  async markNotificationAsRead(notificationId: string) {
    const { data } = await this.client.patch(`/notifications/${notificationId}/read`);
    return data.data.notification;
  }

  async markAllNotificationsAsRead() {
    const { data } = await this.client.post('/notifications/read-all');
    return data;
  }

  async getUnreadNotificationCount() {
    const { data } = await this.client.get('/notifications/unread-count');
    return data.data.count;
  }

  async deleteNotification(notificationId: string) {
    const { data } = await this.client.delete(`/notifications/${notificationId}`);
    return data;
  }

  // ═══════════════════════════════════════════════
  // PRESENCE ENDPOINTS
  // ═══════════════════════════════════════════════
  async getOnlineUsers() {
    const { data } = await this.client.get('/presence/online');
    return data.data.userIds;
  }

  async getUserPresence(userId: string) {
    const { data } = await this.client.get(`/presence/${userId}`);
    return data.data;
  }

  // ═══════════════════════════════════════════════
  // UPLOAD ENDPOINTS
  // ═══════════════════════════════════════════════
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.upload;
  }

  async uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/uploads/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.upload;
  }

  async uploadAudio(file: File, waveform?: number[]) {
    const formData = new FormData();
    formData.append('file', file);
    if (waveform) {
      formData.append('waveform', JSON.stringify(waveform));
    }
    const { data } = await this.client.post('/uploads/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.upload;
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.upload;
  }
}

export const api = new ApiClient();
