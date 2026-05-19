# 🚀 Hey - Deployment & Testing Guide

## 📋 Overview

This guide will help you deploy and test the **Hey** messaging platform. The application consists of:
- **Backend**: Node.js/Express/TypeScript with PostgreSQL, Redis, Socket.IO
- **Frontend**: Next.js 15 with React 19, Zustand, Socket.IO client

---

## ✅ Prerequisites

Before starting, ensure you have:

- ✓ **Node.js** v18+ installed
- ✓ **PostgreSQL** database (local or Supabase)
- ✓ **Redis** server (local or cloud)
- ✓ **npm** or **yarn** package manager

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Your `.env` file is already configured with:
- ✓ Supabase PostgreSQL database
- ✓ Local Redis connection
- ✓ Mock OTP enabled for development
- ✓ JWT secrets configured

**Important Settings:**
- `OTP_MOCK=true` - Uses mock OTP (123456) for development
- `DATABASE_URL` - Already configured with Supabase
- `REDIS_URL` - Set to localhost:6379

### 3. Start Redis (Required)

**Option A: Docker**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Option B: Local Redis**
```bash
# Windows (if installed)
redis-server

# Or use WSL
wsl redis-server
```

**Option C: Cloud Redis**
Update `REDIS_URL` in `.env` to use a cloud provider like:
- Upstash Redis
- Redis Cloud
- AWS ElastiCache

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

This will:
- Generate Prisma client
- Create all 18 database tables
- Set up relationships and indexes

### 5. Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✓ Database connected
✓ Redis connected
✓ Server running on http://localhost:4000
✓ Socket.IO ready
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd ..  # Back to root directory
npm install
```

### 2. Verify Environment Variables

Your `.env.local` is already configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3000
```

---

## 🧪 Testing the Application

### Step 1: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Step 2: Create First User Account

1. **Click "Get Started" or "Sign Up"**
2. **Enter phone number**: `+1 555-0001`
3. **Enter OTP**: `123456` (mock OTP for development)
4. **Complete profile**:
   - Name: `John Doe`
   - Username: `johndoe`
5. **Click "Create Account"**

### Step 3: Create Second User (Different Browser/Incognito)

1. Open a **new incognito window** or **different browser**
2. Navigate to `http://localhost:3000`
3. **Sign up with different phone**: `+1 555-0002`
4. **Enter OTP**: `123456`
5. **Complete profile**:
   - Name: `Jane Smith`
   - Username: `janesmith`

### Step 4: Test User Search & Chat Creation

**In User 1's browser:**
1. Click **"New Chat"** or **search icon**
2. Search for: `janesmith` or `Jane Smith`
3. Click on **Jane Smith** in results
4. A new chat should be created

### Step 5: Test Realtime Messaging

**In User 1's browser:**
1. Type a message: `Hey Jane! 👋`
2. Press **Send**

**In User 2's browser:**
3. The message should appear **instantly**
4. You should see **delivery status** (✓✓)

**In User 2's browser:**
5. Type a reply: `Hi John! How are you?`
6. Press **Send**

**In User 1's browser:**
7. The reply should appear **instantly**

### Step 6: Test Typing Indicators

**In User 1's browser:**
1. Start typing (don't send)

**In User 2's browser:**
2. You should see: `John is typing...`

### Step 7: Test Presence System

**In User 1's browser:**
1. Check User 2's status - should show **"Online"** with green dot

**In User 2's browser:**
2. Close the tab or logout

**In User 1's browser:**
3. User 2's status should change to **"Offline"** or show **"Last seen"**

### Step 8: Test Message Features

**Test Reactions:**
1. Hover over a message
2. Click the **emoji icon**
3. Select an emoji (❤️, 👍, 😂)
4. The reaction should appear on both users' screens

**Test Reply:**
1. Hover over a message
2. Click **"Reply"**
3. Type your reply
4. The reply should show the original message context

**Test Message Editing:**
1. Hover over your own message
2. Click **"Edit"**
3. Modify the text
4. Press **Save**
5. The message should update on both screens with "edited" label

**Test Message Deletion:**
1. Hover over your own message
2. Click **"Delete"**
3. Confirm deletion
4. The message should be removed on both screens

### Step 9: Test Media Upload

1. Click the **attachment icon**
2. Select an image file
3. The image should upload to Cloudinary (if configured)
4. The image should appear in the chat

**Note:** Cloudinary must be configured in `.env` for this to work. Otherwise, you'll see an error.

### Step 10: Test Voice/Video Call Signaling

1. Click the **phone icon** or **video icon**
2. The call should initiate
3. User 2 should receive an **incoming call notification**
4. User 2 can **accept** or **reject**

**Note:** Full WebRTC audio/video requires additional frontend implementation.

---

## 🔍 Monitoring & Debugging

### Check Backend Logs

The backend logs all activity:
```
[INFO] User authenticated: johndoe
[INFO] Socket connected: socket_id_123
[INFO] Message sent: chatId=abc123
[INFO] User typing: chatId=abc123, userId=user1
```

### Check Browser Console

Open **DevTools** (F12) and check:
- **Console tab**: Socket connection status, API calls
- **Network tab**: API requests, WebSocket frames
- **Application tab**: LocalStorage (tokens)

### Common Issues & Solutions

**Issue: Backend won't start**
```
Error: Redis connection failed
```
**Solution:** Start Redis server first

---

**Issue: Frontend can't connect to backend**
```
Error: Network Error
```
**Solution:** Ensure backend is running on port 4000

---

**Issue: Socket.IO not connecting**
```
Socket disconnected: transport error
```
**Solution:** Check CORS settings in backend, verify token is valid

---

**Issue: Database migration fails**
```
Error: Can't reach database server
```
**Solution:** Verify DATABASE_URL in `.env`, check Supabase connection

---

**Issue: OTP not working**
```
Error: Twilio credentials invalid
```
**Solution:** Use `OTP_MOCK=true` for development, or configure Twilio credentials

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- [ ] Set `OTP_MOCK=false` and configure real Twilio credentials
- [ ] Configure Cloudinary for media uploads
- [ ] Set up proper CORS origins (not `*`)
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific database URLs
- [ ] Enable rate limiting in production
- [ ] Set up proper logging and monitoring
- [ ] Configure Redis password/authentication
- [ ] Review and update security headers

---

## 📊 Database Schema

The application uses 18 tables:

**Core Tables:**
- `User` - User accounts and profiles
- `Chat` - Chat rooms (direct & group)
- `ChatMember` - Chat participants with settings
- `Message` - All messages
- `MessageReaction` - Message reactions
- `Attachment` - Media attachments

**Communication:**
- `Call` - Voice/video call records
- `CallParticipant` - Call participants
- `Notification` - User notifications

**Social:**
- `Contact` - User contacts
- `BlockedUser` - Blocked users list

**System:**
- `Device` - User devices
- `Session` - Active sessions
- `RefreshToken` - JWT refresh tokens

---

## 🚀 Production Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Set environment variables** in your hosting platform
2. **Add build command**: `npm run build`
3. **Add start command**: `npm start`
4. **Add PostgreSQL addon** (or use Supabase)
5. **Add Redis addon** (or use Upstash)
6. **Run migrations**: `npm run db:migrate:deploy`

### Frontend Deployment (Vercel/Netlify)

1. **Connect GitHub repository**
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.com
   ```
3. **Deploy** - Vercel will auto-detect Next.js

---

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/otp/send       - Send OTP
POST /api/v1/auth/otp/verify     - Verify OTP
POST /api/v1/auth/signup         - Create account
POST /api/v1/auth/login          - Login
POST /api/v1/auth/logout         - Logout
POST /api/v1/auth/refresh        - Refresh token
```

### User Endpoints

```
GET    /api/v1/users/me          - Get current user
PATCH  /api/v1/users/me          - Update profile
GET    /api/v1/users/search      - Search users
GET    /api/v1/users/:id         - Get user by ID
POST   /api/v1/users/block/:id   - Block user
DELETE /api/v1/users/block/:id   - Unblock user
```

### Chat Endpoints

```
GET    /api/v1/chats             - Get all chats
POST   /api/v1/chats/direct      - Create direct chat
POST   /api/v1/chats/group       - Create group chat
GET    /api/v1/chats/:id         - Get chat details
PATCH  /api/v1/chats/:id         - Update chat
POST   /api/v1/chats/:id/members - Add members
DELETE /api/v1/chats/:id/members/:userId - Remove member
```

### Message Endpoints

```
GET    /api/v1/messages/:chatId  - Get messages
POST   /api/v1/messages          - Send message
PATCH  /api/v1/messages/:id      - Edit message
DELETE /api/v1/messages/:id      - Delete message
POST   /api/v1/messages/:id/react - Add reaction
```

### Socket.IO Events

**Client → Server:**
```
message:send              - Send message
message:delivered         - Mark delivered
message:read              - Mark read
user:typing               - Start typing
user:stop_typing          - Stop typing
user:online               - Set online
user:offline              - Set offline
call:initiate             - Start call
call:accept               - Accept call
call:reject               - Reject call
```

**Server → Client:**
```
message:received          - New message
message:delivered         - Message delivered
message:read              - Message read
user:typing               - User typing
user:stop_typing          - User stopped typing
user:online               - User online
user:offline              - User offline
call:incoming             - Incoming call
call:ended                - Call ended
```

---

## 🎯 Next Steps

1. **Test all features** using the testing guide above
2. **Configure Cloudinary** for media uploads
3. **Set up Twilio** for production OTP
4. **Implement WebRTC** for actual voice/video calls
5. **Add E2E encryption** using Signal Protocol
6. **Deploy to production** using the deployment guide
7. **Set up monitoring** (Sentry, LogRocket, etc.)
8. **Add analytics** (Mixpanel, Amplitude, etc.)

---

## 📞 Support

If you encounter any issues:

1. Check the **Common Issues** section above
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure Redis and PostgreSQL are running

---

## 🎉 Success Criteria

Your application is working correctly if:

- ✓ Users can sign up and login
- ✓ Users can search and find other users
- ✓ Users can create chats
- ✓ Messages appear instantly on both sides
- ✓ Typing indicators work in realtime
- ✓ Online/offline status updates correctly
- ✓ Message reactions work
- ✓ Message editing/deletion works
- ✓ Call signaling works (incoming call notifications)

---

**Built with ❤️ for production-grade realtime messaging**
