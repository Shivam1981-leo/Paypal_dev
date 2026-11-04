# PayGuard AI - Setup Guide

## 🔑 Required Credentials

### 1. PayPal Sandbox Account (REQUIRED for payment processing)

**Where to get it:**
1. Go to https://developer.paypal.com/
2. Log in or create a free developer account
3. Navigate to "Dashboard" → "Apps & Credentials"
4. Under "Sandbox", click "Create App"
5. Copy your **Client ID** and **Secret**

**Add to:** `backend/.env`
```env
PAYPAL_CLIENT_ID=your_actual_sandbox_client_id_here
PAYPAL_SECRET=your_actual_sandbox_secret_here
```

---

### 2. JWT Secret (REQUIRED for authentication)

**Current Status:** ✓ Already generated and configured

The JWT secret is already set in `backend/.env`. If you need to regenerate it:
```bash
openssl rand -base64 32
```

---

### 3. API Key Salt (REQUIRED for merchant API keys)

**Current Status:** ✓ Already generated and configured

The API key salt is already set in `backend/.env`. If you need to regenerate it:
```bash
openssl rand -base64 32
```

---

## 📁 Environment Files

### Backend (`backend/.env`)
```env
# ✓ Already configured - No changes needed
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# ✓ Already configured - Default local database
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev

# ✓ Already configured - Default local Redis
REDIS_URL=redis://localhost:6379

# ✓ Already configured - Default local Elasticsearch
ELASTIC_NODE=http://localhost:9200

# ⚠️ REQUIRED - Get from PayPal Developer Dashboard
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=test_client_id_placeholder    # ← REPLACE THIS
PAYPAL_SECRET=test_secret_placeholder          # ← REPLACE THIS
PAYPAL_WEBHOOK_ID=                             # Optional for now

# ✓ Already configured
JWT_SECRET=kX9vR2mN8pL4wQ7sY6tH1uJ3oK5iP0aZ2bC4dE6fG8hI9jM
API_KEY_SALT=nT8xW1yU4zV7cB9mL2oP5qR3sN6tH0kJ4iF8gD1eA7wX
```

### Frontend (`frontend/.env.local`)
```env
# ✓ Already configured - Points to local backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

---

## 🚀 Quick Start

### If you have PayPal credentials:

1. **Update PayPal credentials in `backend/.env`:**
   ```env
   PAYPAL_CLIENT_ID=your_real_client_id
   PAYPAL_SECRET=your_real_secret
   ```

2. **Restart the backend server:**
   - Stop the current backend ([c3](#terminal/c3) - press Ctrl+C)
   - Run: `cd backend && npm run dev`

3. **Test the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### If you DON'T have PayPal credentials yet:

**The app will run but PayPal features will fail.** You can still:
- ✓ View the landing page
- ✓ Test the API endpoints (non-PayPal)
- ✓ Explore the UI
- ✗ Cannot create real transactions
- ✗ Cannot test fraud detection with PayPal

**To get credentials:** Follow step 1 in "Required Credentials" above (takes ~5 minutes)

---

## 🗄️ Database Services

The following services need to be running locally. If you're seeing connection errors:

### PostgreSQL (Database)
```bash
# Check if running
pg_isready -h localhost -p 5432

# If not installed, install PostgreSQL 16+
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql@16
# Linux: sudo apt-get install postgresql-16
```

### Redis (Cache)
```bash
# Check if running
redis-cli ping  # Should return "PONG"

# If not installed:
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

### Elasticsearch (Search)
```bash
# Check if running
curl http://localhost:9200

# If not installed, download Elasticsearch 8.x from:
# https://www.elastic.co/downloads/elasticsearch
```

**Note:** The backend server shows connection status for all services on startup.

---

## 🔍 What Each Credential Does

| Credential | Purpose | Required? |
|------------|---------|-----------|
| **PAYPAL_CLIENT_ID** | Authenticates with PayPal API | Yes for transactions |
| **PAYPAL_SECRET** | Signs PayPal API requests | Yes for transactions |
| **JWT_SECRET** | Signs authentication tokens | Yes (already set) |
| **API_KEY_SALT** | Generates merchant API keys | Yes (already set) |
| **DATABASE_URL** | Connects to PostgreSQL | Yes (already set) |
| **REDIS_URL** | Connects to Redis cache | Yes (already set) |
| **ELASTIC_NODE** | Connects to Elasticsearch | Yes (already set) |

---

## ⚙️ Current Status

✓ **Frontend** running at http://localhost:3000  
✓ **Backend** running at http://localhost:3001  
✓ **Environment files** created  
✓ **JWT & API keys** configured  
⚠️ **PayPal credentials** need to be added (placeholders currently)  

---

## 🆘 Troubleshooting

### "PayPal authentication failed"
- You need to add real PayPal sandbox credentials to `backend/.env`
- Make sure you're using **Sandbox** credentials, not Live

### "Database connection failed"
- Ensure PostgreSQL is installed and running on port 5432
- Check that the database `payguard_dev` exists
- Verify the password in `DATABASE_URL` matches your PostgreSQL setup

### "Redis connection failed"
- Install and start Redis server
- Default port should be 6379

### "Port 3000/3001 already in use"
- Kill existing processes: `taskkill /F /IM node.exe` (Windows)
- Or use different ports in the .env files

---

## 📝 Next Steps

1. **Get PayPal credentials** (5 minutes)
2. **Update `backend/.env`** with real credentials
3. **Restart backend server**
4. **Create a merchant account** via the registration page
5. **Test transaction processing**

Need help? Check the backend logs in terminal [c3](#terminal/c3) or frontend logs in your browser console (F12).
