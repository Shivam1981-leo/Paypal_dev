# 🚀 PayGuard AI - Quick Start Checklist

## Current Status: PayPal Credentials ✅ Added!

Your PayPal credentials are configured. Now you need to install and start the local services.

---

## 📋 3 Services You Need to Install

### 1. PostgreSQL (Database) - Port 5432

**Download:**
- **Windows**: https://www.postgresql.org/download/windows/
  - Download the installer (EDB installer recommended)
  - Run the installer
  - Set password: `dev_password` (or change it in `backend/.env`)
  - Port: Keep default `5432`
  - Click through the installation

**After Installation:**
```bash
# Open Git Bash or PowerShell and create database:
psql -U postgres
# Enter password when prompted

# Then run these commands:
CREATE DATABASE payguard_dev;
CREATE USER payguard WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE payguard_dev TO payguard;
\q
```

**Verify:**
```bash
pg_isready -h localhost -p 5432
# Should show: localhost:5432 - accepting connections
```

---

### 2. Redis (Cache) - Port 6379

**Download:**
- **Windows**: https://github.com/tporadowski/redis/releases
  - Download `Redis-x64-5.0.14.1.msi` (or latest version)
  - Run the installer
  - Keep default port `6379`
  - Check "Add Redis to PATH"

**Start Redis:**
```bash
# Option 1: Run as Windows Service (recommended)
# It should auto-start after installation

# Option 2: Run manually
redis-server
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

---

### 3. Elasticsearch (Search) - Port 9200

**Download:**
- **Windows**: https://www.elastic.co/downloads/elasticsearch
  - Choose "Windows" version
  - Download the ZIP file (not MSI)
  - Extract to `C:\elasticsearch` or similar

**Start Elasticsearch:**
```bash
# Navigate to extracted folder
cd C:\elasticsearch-8.x.x\bin

# Run:
elasticsearch.bat
```

**Verify:**
```bash
curl http://localhost:9200
# Should return JSON with cluster info
```

---

## 🎯 Quick Start Steps

### Step 1: Install All Services (15-20 minutes one-time setup)
- [ ] Install PostgreSQL
- [ ] Install Redis
- [ ] Download & Extract Elasticsearch

### Step 2: Start All Services
```bash
# PostgreSQL: Should auto-start as Windows service
# Check with:
pg_isready -h localhost -p 5432

# Redis: Should auto-start as Windows service
# Or run manually:
redis-server

# Elasticsearch: Start manually
cd C:\elasticsearch-8.x.x\bin
elasticsearch.bat
```

### Step 3: Create Database
```bash
psql -U postgres
CREATE DATABASE payguard_dev;
CREATE USER payguard WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE payguard_dev TO payguard;
\q
```

### Step 4: Run Database Migrations
```bash
cd backend
npm run db:generate
npm run db:push
```

### Step 5: Start Backend
```bash
cd backend
npm run dev
```

**You should see:**
```
✅ Environment variables validated
✅ Redis connected
✅ Database connected
✅ Elasticsearch connected - Status: yellow
🚀 Server running on http://0.0.0.0:3001
```

### Step 6: Start Frontend (Optional)
```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```

---

## ⚡ Alternative: Use Docker (Easier!)

If you have Docker installed, you can skip installing services individually:

```bash
# Start all services with one command:
docker-compose up -d

# This starts:
# - PostgreSQL on port 5432
# - Redis on port 6379
# - Elasticsearch on port 9200
```

**Check if Docker is installed:**
```bash
docker --version
```

**If Docker is not installed:**
- Download Docker Desktop: https://www.docker.com/products/docker-desktop/

---

## 🔍 Troubleshooting

### "Redis connection refused"
```bash
# Check if Redis is running:
redis-cli ping

# If not, start it:
redis-server
```

### "PostgreSQL connection refused"
```bash
# Check if PostgreSQL is running:
pg_isready -h localhost -p 5432

# Windows: Check Services
# Press Win + R, type "services.msc"
# Look for "postgresql-x64-XX" service
# Right-click → Start
```

### "Elasticsearch not available"
```bash
# Check if Elasticsearch is running:
curl http://localhost:9200

# If not, start it:
cd C:\elasticsearch-8.x.x\bin
elasticsearch.bat
```

### Need to change passwords?
Edit `backend/.env`:
```env
DATABASE_URL=postgresql://payguard:YOUR_PASSWORD@localhost:5432/payguard_dev
```

---

## 📞 What to Do Next?

**Option A: Install Services Manually** (20 minutes)
1. Download and install PostgreSQL, Redis, Elasticsearch
2. Follow steps above
3. Start backend

**Option B: Use Docker** (5 minutes if you have Docker)
1. Install Docker Desktop
2. Run `docker-compose up -d`
3. Run `npm run db:push` in backend
4. Start backend

**Option C: Cloud/Remote Database** (Advanced)
- Use hosted PostgreSQL (ElephantSQL, Supabase)
- Use hosted Redis (Redis Cloud, Upstash)
- Update URLs in `backend/.env`

---

## ✅ After Everything is Running

Test your setup:

```bash
# Health check
curl http://localhost:3001/health

# Test login (demo account will be created)
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

Open frontend: http://localhost:3000

---

**Current Status:**
- ✅ Backend code ready
- ✅ Frontend code ready  
- ✅ PayPal credentials configured
- ⏳ Waiting for local services to be installed

**Time Estimate:**
- Manual installation: ~20 minutes
- Docker: ~5 minutes
