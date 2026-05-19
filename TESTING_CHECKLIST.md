# ✅ Testing Checklist

Complete testing guide for **Hey** messaging platform.

---

## 🔐 Authentication Tests

### OTP Flow
- [ ] Send OTP to valid phone number
- [ ] Receive OTP code (mock: 123456)
- [ ] Verify OTP with correct code
- [ ] Verify OTP with incorrect code (should fail)
- [ ] Verify OTP after expiry (should fail)
- [ ] Resend OTP functionality

### Signup Flow
- [ ] Create account with valid details
- [ ] Create account with existing phone (should fail)
- [ ] Create account with existing username (should fail)
- [ ] Create account with invalid username format (should fail)
- [ ] Receive JWT tokens after signup
- [ ] User data stored in database

### Login Flow
- [ ] Login with registered phone number
- [ ] Login with unregistered phone (should fail)
- [ ] Receive JWT tokens after login
- [ ] Previous session invalidated

### Token Management
- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] Access token included in API requests
- [ ] Token refresh on 401 error
- [ ] Logout clears tokens
- [ ] Expired token redirects to login

---

## 👤 User Management Tests

### Profile
- [ ] View own profile
- [ ] Update display name
- [ ] Update username
- [ ] Update bio/about
- [ ] Update avatar (if Cloudinary configured)
- [ ] View other user's profile

### User Search
- [ ] Search by username
- [ ] Search by display name
- [ ] Search by phone number
- [ ] Search returns relevant results
- [ ] Search with no results
- [ ] Debounced search (doesn't spam API)

### Contacts
- [ ] Add user to contacts
- [ ] Remove user from contacts
- [ ] Set contact nickname
- [ ] View contacts list
- [ ] Contacts sorted alphabetically

### Blocking
- [ ] Block a user
- [ ] Unblock a user
- [ ] Blocked user can't send messages
- [ ] Blocked user can't see online status
- [ ] View blocked users list

---

## 💬 Chat Tests

### Chat Creation
- [ ] Create direct chat with another user
- [ ] Create group chat with multiple users
- [ ] Reuse existing direct chat (don't duplicate)
- [ ] Chat appears in chat list
- [ ] Chat synced across all participants

### Chat List
- [ ] View all chats
- [ ] Chats sorted by last message time
- [ ] Unread count displayed correctly
- [ ] Last message preview shown
- [ ] Online status indicator shown
- [ ] Typing indicator shown in chat list
- [ ] Pinned chats appear at top

### Chat Settings
- [ ] Pin chat
- [ ] Unpin chat
- [ ] Mute chat
- [ ] Unmute chat
- [ ] Archive chat
- [ ] Unarchive chat
- [ ] Clear unread count

### Group Chat Management
- [ ] Update group name
- [ ] Update group description
- [ ] Update group avatar
- [ ] Add members to group
- [ ] Remove members from group
- [ ] Leave group
- [ ] View group members list

---

## 📨 Messaging Tests

### Send Messages
- [ ] Send text message
- [ ] Send emoji
- [ ] Send long message (1000+ characters)
- [ ] Send message with line breaks
- [ ] Send message with special characters
- [ ] Message appears instantly on sender's screen
- [ ] Message appears instantly on recipient's screen

### Message Delivery
- [ ] Message shows "sending" state (clock icon)
- [ ] Message shows "sent" state (single checkmark)
- [ ] Message shows "delivered" state (double checkmark)
- [ ] Message shows "read" state (blue checkmarks)
- [ ] Delivery status updates in realtime

### Message Features
- [ ] Reply to message
- [ ] Reply shows original message context
- [ ] Edit own message
- [ ] Edited message shows "edited" label
- [ ] Delete own message
- [ ] Deleted message shows "Message deleted"
- [ ] Forward message to another chat

### Message Reactions
- [ ] Add reaction to message
- [ ] Remove reaction from message
- [ ] Multiple users can react to same message
- [ ] View all reactions on a message
- [ ] Reaction count displayed correctly

### Message Search
- [ ] Search messages in chat
- [ ] Search returns relevant results
- [ ] Search highlights matched text
- [ ] Search with no results

### Message Pagination
- [ ] Load initial 50 messages
- [ ] Scroll up to load older messages
- [ ] Infinite scroll works smoothly
- [ ] No duplicate messages loaded

---

## 📎 Media & Attachments Tests

### Image Upload
- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload WebP image
- [ ] Upload GIF image
- [ ] Image preview before sending
- [ ] Image appears in chat
- [ ] Image can be opened in full screen
- [ ] Image upload progress shown

### Video Upload
- [ ] Upload MP4 video
- [ ] Upload WebM video
- [ ] Video preview before sending
- [ ] Video appears in chat
- [ ] Video can be played inline
- [ ] Video upload progress shown

### Audio/Voice Notes
- [ ] Record voice note
- [ ] Play voice note
- [ ] Voice note waveform displayed
- [ ] Voice note duration shown
- [ ] Upload audio file

### Document Upload
- [ ] Upload PDF document
- [ ] Upload Word document
- [ ] Document appears in chat
- [ ] Document can be downloaded
- [ ] Document size shown

### Upload Validation
- [ ] File size limit enforced (50MB)
- [ ] File type validation works
- [ ] Invalid file type rejected
- [ ] Upload error handling

---

## 🟢 Presence & Status Tests

### Online Status
- [ ] User shows "Online" when active
- [ ] User shows "Offline" when disconnected
- [ ] User shows "Last seen" timestamp
- [ ] Online status updates in realtime
- [ ] Online status shown in chat list
- [ ] Online status shown in chat header

### Typing Indicators
- [ ] "User is typing..." appears when user types
- [ ] Typing indicator disappears after 3 seconds
- [ ] Typing indicator disappears when message sent
- [ ] Multiple users typing shown correctly
- [ ] Typing indicator shown in chat list

### Recording Indicator
- [ ] "User is recording..." appears when recording
- [ ] Recording indicator disappears when stopped
- [ ] Recording indicator shown in chat header

---

## 📞 Call Tests

### Call Initiation
- [ ] Initiate voice call
- [ ] Initiate video call
- [ ] Call notification sent to recipient
- [ ] Caller sees "Calling..." screen
- [ ] Recipient sees incoming call screen

### Call Actions
- [ ] Accept incoming call
- [ ] Reject incoming call
- [ ] End active call
- [ ] Call ended notification sent

### Call Signaling (WebRTC)
- [ ] SDP offer sent
- [ ] SDP answer received
- [ ] ICE candidates exchanged
- [ ] Peer connection established

### Call History
- [ ] View call history
- [ ] Call history shows call type (voice/video)
- [ ] Call history shows duration
- [ ] Call history shows timestamp
- [ ] Call history shows missed calls

---

## 🔔 Notification Tests

### In-App Notifications
- [ ] New message notification
- [ ] New chat notification
- [ ] Incoming call notification
- [ ] Notification badge count
- [ ] Mark notification as read
- [ ] Mark all notifications as read
- [ ] Delete notification

### Notification Preferences
- [ ] Mute chat notifications
- [ ] Unmute chat notifications
- [ ] Notification sound (if implemented)

---

## 🔌 Socket.IO Tests

### Connection
- [ ] Socket connects on login
- [ ] Socket disconnects on logout
- [ ] Socket reconnects after disconnect
- [ ] Socket authentication works
- [ ] Socket connection status shown

### Realtime Events
- [ ] Message events received instantly
- [ ] Typing events received instantly
- [ ] Presence events received instantly
- [ ] Call events received instantly
- [ ] Chat events received instantly

### Socket Rooms
- [ ] User joins chat rooms automatically
- [ ] User receives events only for their chats
- [ ] User leaves rooms on logout

### Heartbeat
- [ ] Ping/pong heartbeat works
- [ ] Connection stays alive
- [ ] Stale connections cleaned up

---

## 🔒 Security Tests

### Authentication
- [ ] Unauthenticated requests rejected (401)
- [ ] Invalid token rejected
- [ ] Expired token refreshed automatically
- [ ] Logout invalidates tokens

### Authorization
- [ ] User can only access their own data
- [ ] User can't read other user's messages
- [ ] User can't modify other user's data
- [ ] User can't delete other user's messages

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Invalid input rejected
- [ ] Error messages don't leak sensitive data

### Rate Limiting
- [ ] API rate limiting works
- [ ] Too many requests return 429
- [ ] Rate limit resets after window

---

## 🚀 Performance Tests

### API Response Times
- [ ] Auth endpoints < 200ms
- [ ] User endpoints < 100ms
- [ ] Chat endpoints < 150ms
- [ ] Message endpoints < 100ms
- [ ] Search endpoints < 200ms

### Database Queries
- [ ] Queries use proper indexes
- [ ] No N+1 query problems
- [ ] Pagination works efficiently
- [ ] Large result sets handled well

### Frontend Performance
- [ ] Initial page load < 2s
- [ ] Chat list renders smoothly
- [ ] Message list scrolls smoothly
- [ ] No memory leaks
- [ ] Images lazy loaded

### Socket.IO Performance
- [ ] Events delivered < 50ms
- [ ] No event loss
- [ ] Handles 100+ concurrent users
- [ ] Reconnection works smoothly

---

## 🌐 Cross-Browser Tests

### Desktop Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Opera

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## 📱 Responsive Design Tests

### Screen Sizes
- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px+)
- [ ] Large Desktop (1920px+)

### Mobile Features
- [ ] Touch gestures work
- [ ] Swipe actions work
- [ ] Mobile keyboard doesn't break layout
- [ ] Mobile navigation works

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Offline mode detected
- [ ] Retry failed requests
- [ ] Show error messages
- [ ] Graceful degradation

### API Errors
- [ ] 400 Bad Request handled
- [ ] 401 Unauthorized handled
- [ ] 403 Forbidden handled
- [ ] 404 Not Found handled
- [ ] 500 Server Error handled

### Socket Errors
- [ ] Connection error handled
- [ ] Reconnection attempted
- [ ] Max reconnection attempts respected
- [ ] User notified of connection issues

---

## 🔄 Edge Cases

### Concurrent Actions
- [ ] Two users send message simultaneously
- [ ] Two users edit same message
- [ ] Two users delete same message
- [ ] Two users create same chat

### Data Consistency
- [ ] Message order preserved
- [ ] No duplicate messages
- [ ] Unread count accurate
- [ ] Presence status accurate

### Boundary Conditions
- [ ] Empty chat list
- [ ] Empty message list
- [ ] Empty search results
- [ ] Empty contact list
- [ ] Very long messages
- [ ] Very long usernames
- [ ] Special characters in input

---

## 📊 Database Tests

### Data Integrity
- [ ] Foreign keys enforced
- [ ] Cascading deletes work
- [ ] Unique constraints enforced
- [ ] Required fields validated

### Migrations
- [ ] Migrations run successfully
- [ ] Schema matches Prisma schema
- [ ] Indexes created correctly
- [ ] No data loss during migration

---

## 🎯 User Experience Tests

### Onboarding
- [ ] Clear signup flow
- [ ] Helpful error messages
- [ ] Loading states shown
- [ ] Success feedback shown

### Usability
- [ ] Intuitive navigation
- [ ] Clear call-to-actions
- [ ] Consistent UI patterns
- [ ] Accessible keyboard navigation

### Accessibility
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

---

## ✅ Production Readiness

### Configuration
- [ ] Environment variables set
- [ ] Secrets rotated
- [ ] CORS configured properly
- [ ] Rate limits configured
- [ ] File upload limits set

### Monitoring
- [ ] Error logging works
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured
- [ ] Alert system configured

### Deployment
- [ ] Build succeeds
- [ ] Migrations run on deploy
- [ ] Health check endpoint works
- [ ] Rollback plan exists

---

## 📝 Testing Summary

**Total Tests:** 250+

**Categories:**
- Authentication: 15 tests
- User Management: 20 tests
- Chat: 25 tests
- Messaging: 35 tests
- Media: 20 tests
- Presence: 15 tests
- Calls: 15 tests
- Notifications: 10 tests
- Socket.IO: 15 tests
- Security: 15 tests
- Performance: 15 tests
- Cross-Browser: 10 tests
- Error Handling: 15 tests
- Edge Cases: 15 tests
- Database: 10 tests
- UX: 10 tests
- Production: 10 tests

---

**Use this checklist to ensure your Hey messaging platform is production-ready! 🚀**
