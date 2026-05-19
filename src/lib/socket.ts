import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✓ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.emit('user:online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      this.disconnect();
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    });

    // Heartbeat
    this.socket.on('pong', () => {
      // console.log('Heartbeat pong received');
    });

    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 25000); // Every 25 seconds
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('user:offline');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any, callback?: (response: any) => void) {
    if (this.socket?.connected) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    } else {
      console.warn('Socket not connected. Cannot emit:', event);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ═══════════════════════════════════════════════
  // MESSAGE EVENTS
  // ═══════════════════════════════════════════════
  sendMessage(data: { chatId: string; text: string; type?: string; replyToId?: string }, callback?: (response: any) => void) {
    this.emit('message:send', data, callback);
  }

  onMessageReceived(callback: (message: any) => void) {
    this.on('message:received', callback);
  }

  onMessageDelivered(callback: (data: { messageId: string; userId: string; deliveredAt: Date }) => void) {
    this.on('message:delivered', callback);
  }

  onMessageRead(callback: (data: { messageId: string; userId: string; readAt: Date }) => void) {
    this.on('message:read', callback);
  }

  markMessageDelivered(messageId: string, chatId: string) {
    this.emit('message:delivered', { messageId, chatId });
  }

  markMessageRead(messageId: string, chatId: string) {
    this.emit('message:read', { messageId, chatId });
  }

  editMessage(data: { messageId: string; text: string; chatId: string }, callback?: (response: any) => void) {
    this.emit('message:edit', data, callback);
  }

  deleteMessage(data: { messageId: string; chatId: string }, callback?: (response: any) => void) {
    this.emit('message:delete', data, callback);
  }

  reactToMessage(data: { messageId: string; emoji: string; chatId: string }, callback?: (response: any) => void) {
    this.emit('message:react', data, callback);
  }

  unreactToMessage(data: { messageId: string; emoji: string; chatId: string }, callback?: (response: any) => void) {
    this.emit('message:unreact', data, callback);
  }

  // ═══════════════════════════════════════════════
  // PRESENCE EVENTS
  // ═══════════════════════════════════════════════
  setOnline() {
    this.emit('user:online');
  }

  setOffline() {
    this.emit('user:offline');
  }

  onUserOnline(callback: (data: { userId: string; timestamp: Date }) => void) {
    this.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: string; lastSeen: Date }) => void) {
    this.on('user:offline', callback);
  }

  // ═══════════════════════════════════════════════
  // TYPING EVENTS
  // ═══════════════════════════════════════════════
  startTyping(chatId: string) {
    this.emit('user:typing', { chatId });
  }

  stopTyping(chatId: string) {
    this.emit('user:stop_typing', { chatId });
  }

  onUserTyping(callback: (data: { chatId: string; userId: string }) => void) {
    this.on('user:typing', callback);
  }

  onUserStopTyping(callback: (data: { chatId: string; userId: string }) => void) {
    this.on('user:stop_typing', callback);
  }

  startRecording(chatId: string) {
    this.emit('user:recording', { chatId });
  }

  stopRecording(chatId: string) {
    this.emit('user:stop_recording', { chatId });
  }

  onUserRecording(callback: (data: { chatId: string; userId: string }) => void) {
    this.on('user:recording', callback);
  }

  onUserStopRecording(callback: (data: { chatId: string; userId: string }) => void) {
    this.on('user:stop_recording', callback);
  }

  // ═══════════════════════════════════════════════
  // CALL EVENTS
  // ═══════════════════════════════════════════════
  initiateCall(data: { recipientId: string; type: 'VOICE' | 'VIDEO'; chatId?: string }, callback?: (response: any) => void) {
    this.emit('call:initiate', data, callback);
  }

  acceptCall(data: { callId: string }, callback?: (response: any) => void) {
    this.emit('call:accept', data, callback);
  }

  rejectCall(data: { callId: string }, callback?: (response: any) => void) {
    this.emit('call:reject', data, callback);
  }

  endCall(data: { callId: string }, callback?: (response: any) => void) {
    this.emit('call:end', data, callback);
  }

  onIncomingCall(callback: (data: { call: any; caller: any }) => void) {
    this.on('call:incoming', callback);
  }

  onCallEnded(callback: (data: { callId: string; reason?: string }) => void) {
    this.on('call:ended', callback);
  }

  // WebRTC Signaling
  sendOffer(data: { callId: string; offer: any; recipientId: string }) {
    this.emit('call:offer', data);
  }

  sendAnswer(data: { callId: string; answer: any; recipientId: string }) {
    this.emit('call:answer', data);
  }

  sendIceCandidate(data: { callId: string; candidate: any; recipientId: string }) {
    this.emit('call:ice_candidate', data);
  }

  onCallOffer(callback: (data: { callId: string; offer: any; senderId: string }) => void) {
    this.on('call:offer', callback);
  }

  onCallAnswer(callback: (data: { callId: string; answer: any; senderId: string }) => void) {
    this.on('call:answer', callback);
  }

  onIceCandidate(callback: (data: { callId: string; candidate: any; senderId: string }) => void) {
    this.on('call:ice_candidate', callback);
  }

  // ═══════════════════════════════════════════════
  // CHAT EVENTS
  // ═══════════════════════════════════════════════
  onChatCreated(callback: (chat: any) => void) {
    this.on('chat:created', callback);
  }

  onChatUpdated(callback: (chat: any) => void) {
    this.on('chat:updated', callback);
  }

  onChatDeleted(callback: (data: { chatId: string }) => void) {
    this.on('chat:deleted', callback);
  }

  // ═══════════════════════════════════════════════
  // NOTIFICATION EVENTS
  // ═══════════════════════════════════════════════
  onNotification(callback: (notification: any) => void) {
    this.on('notification', callback);
  }
}

export const socket = new SocketClient();
