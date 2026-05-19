# Hey Backend - Production-Grade Realtime Messaging Platform

A scalable, production-ready backend for a modern realtime messaging application built with Node.js, Express, TypeScript, PostgreSQL, Redis, and Socket.IO.

## 🚀 Features

### Core Messaging
- ✅ Realtime messaging with Socket.IO
- ✅ Text, image, video, audio, voice notes, documents
- ✅ Message editing and deletion
- ✅ Message reactions (emojis)
- ✅ Reply to messages
- ✅ Forward messages
- ✅ Read receipts
- ✅ Delivery states (sent, delivered, seen)
- ✅ Message search

### Authentication & Security
- ✅ Mobile number + OTP authentication
- ✅ JWT access & refresh tokens
- ✅ Refresh token rotation
- ✅ Session management
- ✅ Device tracking
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input validation (Zod)

### Chats
- ✅ Direct (1-on-1) chats
- ✅ Group chats (up to 256 members)
- ✅ Pin/mute/archive chats
- ✅ Unread count tracking
- ✅ Chat member roles (owner, admin, member)
- ✅ Add/remove members
- ✅ Leave chat

### Presence System
- ✅ Online/offline status
- ✅ Last seen tracking
- ✅ Typing indicators
- ✅ Recording audio indicators
- ✅ Redis-based realtime presence

### Voice & Video Calls
- ✅ WebRTC signaling backend
- ✅ Voice and video call support
- ✅ Call initiation, accept, reject, end
- ✅ SDP offer/answer exchange
- ✅ ICE candidate exchange
- ✅ Call history
- ✅ Participant status (muted, camera off)

### Media Uploads
- ✅ Cloudinary integration
- ✅ Image upload with compression
- ✅ Video upload with thumbnails
- ✅ Voice note upload with waveform
- ✅ Document upload
- ✅ File validation & size limits

### Additional Features
- ✅ Contacts management
- ✅ Block/unblock users
- ✅ User search
- ✅ Notifications system
- ✅ Status/Stories (prepared)
- ✅ E2EE-ready architecture

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (ioredis)
- **Realtime**: Socket.IO
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **SMS**: Twilio
- **Security**: Helmet, CORS
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Setup

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hey_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate strong secrets)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio (optional for production OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# For development, use mock OTP
OTP_MOCK=true
OTP_MOCK_CODE=123456
```

4. **Database setup**
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

5. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:4000`

## 🐳 Docker Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Stop services
docker-compose down
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication Endpoints

#### Send OTP
```http
POST /auth/otp/send
Content-Type: application/json

{
  "phone": "1234567890",
  "countryCode": "+1"
}
```

#### Verify OTP
```http
POST /auth/otp/verify
Content-Type: application/json

{
  "phone": "1234567890",
  "countryCode": "+1",
  "code": "123456"
}
```

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "phone": "1234567890",
  "countryCode": "+1",
  "code": "123456",
  "name": "John Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "1234567890",
  "countryCode": "+1",
  "code": "123456"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Protected Endpoints
All endpoints below require `Authorization: Bearer <access_token>` header.

#### Users
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update profile
- `GET /users/search?q=john` - Search users
- `POST /users/block/:userId` - Block user
- `DELETE /users/block/:userId` - Unblock user

#### Chats
- `GET /chats` - Get user chats
- `POST /chats/direct` - Create direct chat
- `POST /chats/group` - Create group chat
- `GET /chats/:id` - Get chat details
- `PATCH /chats/:id` - Update chat
- `POST /chats/:id/members` - Add members
- `DELETE /chats/:id/members/:userId` - Remove member

#### Messages
- `GET /messages/:chatId` - Get messages
- `POST /messages` - Send message
- `PATCH /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message
- `POST /messages/:id/react` - Add reaction
- `DELETE /messages/:id/react` - Remove reaction

#### Uploads
- `POST /uploads/image` - Upload image
- `POST /uploads/video` - Upload video
- `POST /uploads/audio` - Upload audio/voice note
- `POST /uploads/document` - Upload document

#### Calls
- `GET /calls/history` - Get call history
- `GET /calls/:id` - Get call details

#### Contacts
- `GET /contacts` - Get contacts
- `POST /contacts` - Add contact
- `DELETE /contacts/:id` - Remove contact

#### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

## 🔌 Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your-access-token'
  }
});
```

### Message Events
```javascript
// Send message
socket.emit('message:send', {
  chatId: 'chat-id',
  text: 'Hello!',
  type: 'TEXT'
}, (response) => {
  console.log(response);
});

// Listen for new messages
socket.on('message:received', (message) => {
  console.log('New message:', message);
});

// Mark as delivered
socket.emit('message:delivered', {
  messageId: 'message-id',
  chatId: 'chat-id'
});

// Mark as read
socket.emit('message:read', {
  messageId: 'message-id',
  chatId: 'chat-id'
});
```

### Presence Events
```javascript
// Set online
socket.emit('user:online');

// Typing indicator
socket.emit('user:typing', { chatId: 'chat-id' });
socket.emit('user:stop_typing', { chatId: 'chat-id' });

// Recording indicator
socket.emit('user:recording', { chatId: 'chat-id' });
socket.emit('user:stop_recording', { chatId: 'chat-id' });

// Listen for presence updates
socket.on('user:online', (data) => {
  console.log('User online:', data.userId);
});

socket.on('user:typing', (data) => {
  console.log('User typing:', data.userId);
});
```

### Call Events
```javascript
// Initiate call
socket.emit('call:initiate', {
  recipientId: 'user-id',
  type: 'VIDEO'
}, (response) => {
  console.log('Call initiated:', response.call);
});

// Accept call
socket.emit('call:accept', { callId: 'call-id' });

// Reject call
socket.emit('call:reject', { callId: 'call-id' });

// End call
socket.emit('call:end', { callId: 'call-id' });

// WebRTC signaling
socket.emit('call:offer', {
  callId: 'call-id',
  offer: sdpOffer,
  recipientId: 'user-id'
});

socket.emit('call:answer', {
  callId: 'call-id',
  answer: sdpAnswer,
  recipientId: 'user-id'
});

socket.emit('call:ice_candidate', {
  callId: 'call-id',
  candidate: iceCandidate,
  recipientId: 'user-id'
});
```

## 🗄️ Database Schema

The database includes:
- Users (with E2EE preparation)
- OTPs
- Sessions & Devices
- Chats (direct, group)
- Messages
- Attachments
- Reactions
- Read Receipts
- Calls & Call Participants
- Contacts
- Blocked Users
- Notifications
- Statuses

See `prisma/schema.prisma` for full schema.

## 🔐 Security Features

- JWT authentication with access & refresh tokens
- Refresh token rotation
- Rate limiting on all endpoints
- Helmet security headers
- CORS protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- File upload validation
- Session management

## 📈 Scalability

- Modular architecture
- Service layer pattern
- Redis caching for presence & sessions
- Database indexing
- Pagination support
- Connection pooling
- Graceful shutdown handling

## 🔮 E2EE Preparation

The architecture is prepared for future End-to-End Encryption:
- Public key storage in user schema
- Key version tracking
- Encrypted content fields in messages
- IV (initialization vector) storage
- Ready for Signal Protocol integration

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets
3. Configure Twilio for real OTP
4. Set up proper PostgreSQL and Redis instances
5. Configure Cloudinary
6. Build the application: `npm run build`
7. Start: `npm start`
8. Use a process manager like PM2
9. Set up reverse proxy (Nginx)
10. Enable HTTPS

## 📄 License

MIT

## 👥 Contributing

Contributions welcome! Please read contributing guidelines first.

## 🐛 Issues

Report issues on GitHub Issues page.

## 📧 Contact

For questions or support, contact the development team.

---

Built with ❤️ for modern realtime communication
