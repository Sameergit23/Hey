# Hey Backend - Complete Setup Guide

## 🔧 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with these values:

```env
# ─── App ─────────────────────────────────────────
NODE_ENV=development
PORT=4000
APP_NAME=Hey
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# ─── Database ─────────────────────────────────────
DATABASE_URL=postgresql://hey_user:hey_password@localhost:5432/hey_db

# ─── Redis ────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# ─── JWT ──────────────────────────────────────────
# IMPORTANT: Generate strong secrets (min 32 characters)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# ─── OTP ──────────────────────────────────────────
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# FOR DEVELOPMENT: Use mock OTP (no Twilio needed)
OTP_MOCK=true
OTP_MOCK_CODE=123456

# FOR PRODUCTION: Set OTP_MOCK=false and configure Twilio below

# ─── Twilio (for production OTP) ──────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ─── Cloudinary ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Rate Limiting ────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# ─── File Uploads ─────────────────────────────────
MAX_FILE_SIZE_MB=50

# ─── Logging ──────────────────────────────────────
LOG_LEVEL=debug
```

### 3. Start PostgreSQL and Redis

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual Installation**
- Install PostgreSQL 14+
- Install Redis 6+
- Start both services

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

If you get errors, you may need to create the database first:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hey_db;
CREATE USER hey_user WITH PASSWORD 'hey_password';
GRANT ALL PRIVILEGES ON DATABASE hey_db TO hey_user;
\q

# Then run migrations again
npm run db:migrate
```

### 5. Create uploads directory

```bash
mkdir -p uploads/temp
```

### 6. Start Development Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 Hey Backend Server Running               ║
║                                               ║
║   Environment: development                    ║
║   Port: 4000                                  ║
║   URL: http://localhost:4000                  ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

## 🧪 Testing OTP System

### Test with Mock OTP (Development)

When `OTP_MOCK=true` in `.env`, the system will:
- Skip Twilio SMS sending
- Always use the code from `OTP_MOCK_CODE` (default: 123456)
- Return the OTP code in the API response

**1. Send OTP Request:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+1"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresAt": "2024-01-01T12:10:00.000Z",
    "code": "123456"
  }
}
```

**2. Verify OTP:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+1",
    "code": "123456"
  }'
```

**3. Complete Signup:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+1",
    "code": "123456",
    "name": "John Doe",
    "username": "johndoe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+11234567890",
      "name": "John Doe",
      "username": "johndoe",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### Test with Real Twilio (Production)

**1. Get Twilio Credentials:**
- Sign up at https://www.twilio.com
- Get your Account SID and Auth Token
- Get a Twilio phone number

**2. Update `.env`:**
```env
OTP_MOCK=false
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**3. Test with real phone number:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "YOUR_REAL_PHONE",
    "countryCode": "+1"
  }'
```

You should receive an SMS with the OTP code.

## 🐛 Troubleshooting

### Issue: "OTP already sent. Please wait before requesting again."

**Solution:** Wait 10 minutes or clear Redis cache:
```bash
redis-cli
> DEL otp:+11234567890
> exit
```

### Issue: "User not found"

**Solution:** Send OTP first to create user record:
```bash
curl -X POST http://localhost:4000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "countryCode": "+1"}'
```

### Issue: "Invalid OTP code"

**Causes:**
1. Wrong code entered
2. OTP expired (10 minutes)
3. Too many attempts (max 5)

**Solution:** Request a new OTP

### Issue: "Twilio send error"

**Causes:**
1. Invalid Twilio credentials
2. Invalid phone number format
3. Twilio account not verified

**Solution:** 
- Verify Twilio credentials in `.env`
- Use E.164 format: `+[country code][number]`
- Verify your Twilio account

### Issue: Database connection error

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# Or if installed locally
pg_isready

# Check connection string in .env
DATABASE_URL=postgresql://hey_user:hey_password@localhost:5432/hey_db
```

### Issue: Redis connection error

**Solution:**
```bash
# Check if Redis is running
docker ps

# Or test connection
redis-cli ping
# Should return: PONG

# Check Redis URL in .env
REDIS_URL=redis://localhost:6379
```

## 📊 Database Management

### View Database with Prisma Studio
```bash
npm run db:studio
```

Opens at `http://localhost:5555`

### Reset Database
```bash
# Drop all tables and re-run migrations
npx prisma migrate reset

# Then regenerate client
npm run db:generate
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## 🔍 Monitoring & Logs

### View Logs
Logs are output to console in development mode.

### Check OTP in Database
```bash
psql -U hey_user -d hey_db

SELECT * FROM otps ORDER BY created_at DESC LIMIT 5;
```

### Check Users
```bash
SELECT id, phone, name, username, is_verified FROM users;
```

### Check Redis Keys
```bash
redis-cli

# List all OTP keys
KEYS otp:*

# Get OTP value
GET otp:+11234567890

# List online users
SMEMBERS presence:online
```

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Redis is running
- [ ] `.env` file is configured
- [ ] Database migrations completed
- [ ] `uploads/temp` directory exists
- [ ] Server starts without errors
- [ ] Can send OTP request
- [ ] Can verify OTP
- [ ] Can complete signup
- [ ] Receive access & refresh tokens

## 🚀 Next Steps

1. Test all authentication endpoints
2. Test Socket.IO connection
3. Test messaging features
4. Test file uploads
5. Test call signaling
6. Configure Cloudinary for media uploads
7. Set up production environment

## 📞 Support

If you encounter issues:
1. Check logs in console
2. Verify environment variables
3. Check database connection
4. Check Redis connection
5. Review error messages

## 🎉 Success!

If you can successfully:
- Send OTP
- Verify OTP
- Complete signup
- Receive JWT tokens

Your OTP system is working correctly! 🎊
