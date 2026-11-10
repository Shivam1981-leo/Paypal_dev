# 🔑 PayGuard AI - Credential Setup Guide

## Where to Get Each Credential

### 1. PayPal Sandbox Credentials (REQUIRED)

**What you need:**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`

**Step-by-step:**

1. **Go to PayPal Developer Portal**
   - URL: https://developer.paypal.com/
   - Click "Log In" (top right)

2. **Create/Login to Account**
   - If you don't have an account, click "Sign Up"
   - Use your existing PayPal account OR create a new developer account
   - It's FREE and takes 2 minutes

3. **Access Dashboard**
   - After login, you'll be on the Dashboard
   - Click "Apps & Credentials" in the left sidebar

4. **Create Sandbox App**
   - Make sure you're on the "Sandbox" tab (NOT "Live")
   - Click the blue "Create App" button
   - Give it a name like "PayGuard AI Dev"
   - Click "Create App"

5. **Copy Your Credentials**
   ```
   You'll see:
   - Client ID: Starts with "A..." (long string)
   - Secret: Click "Show" to reveal it
   ```

6. **Add to Your .env File**
   ```env
   # backend/.env
   PAYPAL_CLIENT_ID=AZaBcDeFgHiJkLmNoPqRsTuVwXyZ...
   PAYPAL_SECRET=EL1234567890abcdefghijklmnop...
   ```

**Screenshot locations:**
```
Dashboard → Apps & Credentials → Sandbox tab → Create App
Then you'll see your Client ID and Secret (click Show to reveal)
```

---

### 2. JWT Secret (✅ Already Generated)

**What it is:** A secret key used to sign authentication tokens

**Current status:** Already set in your `backend/.env`:
```env
JWT_SECRET=kX9vR2mN8pL4wQ7sY6tH1uJ3oK5iP0aZ2bC4dE6fG8hI9jM
```

**If you want to regenerate it:**
```bash
# On Windows (Git Bash):
openssl rand -base64 32

# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Why you need it:** Secures user authentication - prevents token forgery

---

### 3. API Key Salt (✅ Already Generated)

**What it is:** Used to hash merchant API keys

**Current status:** Already set in your `backend/.env`:
```env
API_KEY_SALT=nT8xW1yU4zV7cB9mL2oP5qR3sN6tH0kJ4iF8gD1eA7wX
```

**If you want to regenerate it:**
```bash
openssl rand -base64 32
```

**Why you need it:** Adds extra security layer to API key generation

---

### 4. Database Credentials (✅ Already Configured)

**What it is:** PostgreSQL connection string

**Current status:** Already set for local development:
```env
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev
```

**Format breakdown:**
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**If you need to change it:**
- `payguard` = database username
- `dev_password` = database password
- `localhost:5432` = database location
- `payguard_dev` = database name

**Prerequisites:**
- PostgreSQL must be installed
- Database `payguard_dev` must be created

**To create the database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE payguard_dev;

# Create user
CREATE USER payguard WITH PASSWORD 'dev_password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE payguard_dev TO payguard;
```

---

### 5. Redis URL (✅ Already Configured)

**What it is:** Redis cache connection

**Current status:** Already set for local:
```env
REDIS_URL=redis://localhost:6379
```

**Prerequisites:**
- Redis must be installed and running

**Install Redis:**
- **Windows**: https://github.com/microsoftarchive/redis/releases
- **Mac**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

**Start Redis:**
```bash
# Windows: Run redis-server.exe
# Mac/Linux:
redis-server
```

**Test Redis:**
```bash
redis-cli ping
# Should return: PONG
```

---

### 6. Elasticsearch URL (✅ Already Configured)

**What it is:** Search engine connection

**Current status:** Already set for local:
```env
ELASTIC_NODE=http://localhost:9200
```

**Prerequisites:**
- Elasticsearch must be installed and running

**Install Elasticsearch:**
- Download from: https://www.elastic.co/downloads/elasticsearch
- Choose Elasticsearch 8.x

**Start Elasticsearch:**
```bash
# Extract the downloaded file, then:
cd elasticsearch-8.x.x
bin/elasticsearch  # Mac/Linux
bin\elasticsearch.bat  # Windows
```

**Test Elasticsearch:**
```bash
curl http://localhost:9200
# Should return JSON with cluster info
```

---

## 🎯 Quick Checklist

### What You MUST Get (5 minutes):

- [ ] **PayPal Developer Account** - https://developer.paypal.com/
- [ ] **Create Sandbox App** - Dashboard → Apps & Credentials
- [ ] **Copy Client ID** - Paste into `backend/.env`
- [ ] **Copy Secret** - Click "Show", paste into `backend/.env`

### What's Already Done:

- [x] JWT Secret generated
- [x] API Key Salt generated
- [x] Database URL configured
- [x] Redis URL configured
- [x] Elasticsearch URL configured

### What You Need Installed Locally:

- [ ] PostgreSQL (database)
- [ ] Redis (cache)
- [ ] Elasticsearch (search)
- [ ] Node.js 18+ (to run the backend)

---

## 🚀 After Adding PayPal Credentials

1. **Save the `backend/.env` file**

2. **Start the backend:**
```bash
cd backend
npm install  # If not already installed
npm run dev
```

3. **You should see:**
```
✓ Environment variables validated
✓ Redis connected
✓ Database connected
✓ Elasticsearch connected
🚀 Server running on http://0.0.0.0:3001
```

4. **Test PayPal connection:**
```bash
curl http://localhost:3001/api/v1/health
```

---

## 🆘 Common Issues

### "PayPal authentication failed"
❌ **Problem:** Wrong credentials or using Live instead of Sandbox

✅ **Solution:** 
- Make sure you're on the **Sandbox** tab in PayPal Dashboard
- Copy the credentials again
- No extra spaces before/after the credentials in .env

### "Database connection refused"
❌ **Problem:** PostgreSQL not installed or not running

✅ **Solution:**
```bash
# Check if PostgreSQL is running:
pg_isready -h localhost -p 5432

# If not running, start it:
# Windows: Start PostgreSQL service from Services
# Mac: brew services start postgresql
# Linux: sudo service postgresql start
```

### "Redis connection refused"
❌ **Problem:** Redis not installed or not running

✅ **Solution:**
```bash
# Check if Redis is running:
redis-cli ping

# If not running:
redis-server
```

### "Elasticsearch not available"
❌ **Problem:** Elasticsearch not running

✅ **Solution:**
```bash
# Check if Elasticsearch is running:
curl http://localhost:9200

# If not running, start it:
cd elasticsearch-8.x.x
bin/elasticsearch  # or bin\elasticsearch.bat on Windows
```

---

## 💡 Pro Tips

1. **Sandbox vs Live:**
   - Always use **Sandbox** for development
   - Sandbox is FREE and uses test money
   - Never use Live credentials in development

2. **Keep Credentials Safe:**
   - Never commit `.env` file to Git
   - `.env` is already in `.gitignore`
   - Share credentials only through secure channels

3. **Test Gradually:**
   - Get PayPal credentials first
   - Test with just the backend running
   - Then add frontend later

4. **PayPal Sandbox Accounts:**
   - PayPal also creates test buyer/seller accounts for you
   - Find them in: Dashboard → Sandbox → Accounts
   - Use these for testing transactions

---

## 📞 Need Help?

**PayPal Documentation:**
- Getting Started: https://developer.paypal.com/docs/api/overview/
- Sandbox Guide: https://developer.paypal.com/docs/api-basics/sandbox/

**Backend Logs:**
- Check terminal where backend is running
- Errors will show which service failed to connect

**Still Stuck?**
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for environment setup
- Check [backend/README.md](./backend/README.md) for backend docs
- Review backend logs for specific error messages
