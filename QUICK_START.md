# ⚡ Quick Start Guide

Get **Hey** running in 5 minutes!

---

## 🚀 Step 1: Start Redis

**Option A - Docker (Recommended):**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Option B - Local Redis:**
```bash
redis-server
```

**Option C - Skip Redis for now:**
Update `backend/.env`:
```env
# Comment out Redis temporarily
# REDIS_URL=redis://localhost:6379
```

---

## 🔧 Step 2: Start Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

**Wait for:**
```
✓ Server running on http://localhost:4000
```

---

## 🎨 Step 3: Start Frontend

**Open a new terminal:**

```bash
cd ..  # Back to root
npm install
npm run dev
```

**Wait for:**
```
✓ Ready on http://localhost:3000
```

---

## 🧪 Step 4: Test It!

### Create User 1:
1. Open: `http://localhost:3000`
2. Phone: `+1 555-0001`
3. OTP: `123456`
4. Name: `John Doe`
5. Username: `johndoe`

### Create User 2:
1. Open **incognito window**: `http://localhost:3000`
2. Phone: `+1 555-0002`
3. OTP: `123456`
4. Name: `Jane Smith`
5. Username: `janesmith`

### Start Chatting:
1. **User 1**: Search for `janesmith`
2. Click on Jane Smith
3. Send message: `Hey! 👋`
4. **User 2**: See message appear instantly!
5. Reply: `Hi John!`

---

## ✅ Success!

If messages appear instantly on both screens, **you're all set!** 🎉

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check if Redis is running: `redis-cli ping` (should return `PONG`)
- Check if port 4000 is free
- Verify DATABASE_URL in `backend/.env`

**Frontend won't start?**
- Check if port 3000 is free
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**Messages not appearing?**
- Check browser console (F12)
- Check backend terminal for errors
- Verify Socket.IO connection in Network tab

---

## 📖 Full Documentation

For detailed setup, testing, and deployment:
- See `DEPLOYMENT_GUIDE.md`
- See `backend/README.md`
- See `backend/SETUP_GUIDE.md`

---

**Ready to build the next WhatsApp? Let's go! 🚀**
