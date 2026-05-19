// ═══════════════════════════════════════════════
// REDIS KEYS
// ═══════════════════════════════════════════════
export const REDIS_KEYS = {
  USER_PRESENCE: (userId: string) => `presence:${userId}`,
  USER_TYPING: (chatId: string, userId: string) => `typing:${chatId}:${userId}`,
  USER_RECORDING: (chatId: string, userId: string) => `recording:${chatId}:${userId}`,
  CHAT_TYPING_USERS: (chatId: string) => `typing:${chatId}:users`,
  ONLINE_USERS: 'presence:online',
  USER_SOCKET: (userId: string) => `socket:${userId}`,
  RATE_LIMIT: (identifier: string) => `ratelimit:${identifier}`,
  OTP: (phone: string) => `otp:${phone}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  UNREAD_COUNT: (userId: string) => `unread:${userId}`,
  CALL_ROOM: (callId: string) => `call:${callId}`,
} as const;

// ═══════════════════════════════════════════════
// SOCKET EVENTS
// ═══════════════════════════════════════════════
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'auth_error',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  USER_STOP_TYPING: 'user:stop_typing',
  USER_RECORDING: 'user:recording',
  USER_STOP_RECORDING: 'user:stop_recording',
  PRESENCE_UPDATE: 'presence:update',
  
  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_REACT: 'message:react',
  MESSAGE_UNREACT: 'message:unreact',
  
  // Chats
  CHAT_CREATED: 'chat:created',
  CHAT_UPDATED: 'chat:updated',
  CHAT_DELETED: 'chat:deleted',
  CHAT_MEMBER_ADDED: 'chat:member_added',
  CHAT_MEMBER_REMOVED: 'chat:member_removed',
  CHAT_MEMBER_ROLE_UPDATED: 'chat:member_role_updated',
  
  // Calls
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
  
  // WebRTC Signaling
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE_CANDIDATE: 'call:ice_candidate',
  CALL_PARTICIPANT_JOINED: 'call:participant_joined',
  CALL_PARTICIPANT_LEFT: 'call:participant_left',
  CALL_PARTICIPANT_MUTED: 'call:participant_muted',
  CALL_PARTICIPANT_UNMUTED: 'call:participant_unmuted',
  CALL_PARTICIPANT_CAM_OFF: 'call:participant_cam_off',
  CALL_PARTICIPANT_CAM_ON: 'call:participant_cam_on',
  
  // Notifications
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',
  
  // Heartbeat
  PING: 'ping',
  PONG: 'pong',
} as const;

// ═══════════════════════════════════════════════
// SOCKET ROOMS
// ═══════════════════════════════════════════════
export const SOCKET_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  CHAT: (chatId: string) => `chat:${chatId}`,
  CALL: (callId: string) => `call:${callId}`,
} as const;

// ═══════════════════════════════════════════════
// TIMEOUTS
// ═══════════════════════════════════════════════
export const TIMEOUTS = {
  TYPING_INDICATOR: 3000, // 3 seconds
  RECORDING_INDICATOR: 5000, // 5 seconds
  PRESENCE_HEARTBEAT: 30000, // 30 seconds
  PRESENCE_OFFLINE_THRESHOLD: 60000, // 1 minute
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  SESSION_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// ═══════════════════════════════════════════════
// LIMITS
// ═══════════════════════════════════════════════
export const LIMITS = {
  MESSAGE_TEXT_LENGTH: 4096,
  CHAT_NAME_LENGTH: 100,
  USER_NAME_LENGTH: 50,
  USERNAME_LENGTH: 30,
  ABOUT_LENGTH: 139,
  GROUP_MAX_MEMBERS: 256,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VOICE_NOTE_DURATION: 300, // 5 minutes
  MAX_VIDEO_DURATION: 600, // 10 minutes
  PAGINATION_DEFAULT: 50,
  PAGINATION_MAX: 100,
} as const;

// ═══════════════════════════════════════════════
// FILE TYPES
// ═══════════════════════════════════════════════
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// ═══════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // OTP
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  
  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  
  // Chat
  CHAT_NOT_FOUND: 'CHAT_NOT_FOUND',
  NOT_CHAT_MEMBER: 'NOT_CHAT_MEMBER',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Message
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  
  // Call
  CALL_NOT_FOUND: 'CALL_NOT_FOUND',
  CALL_ALREADY_ACTIVE: 'CALL_ALREADY_ACTIVE',
  USER_BUSY: 'USER_BUSY',
  
  // Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// ═══════════════════════════════════════════════
// HTTP STATUS CODES
// ═══════════════════════════════════════════════
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
