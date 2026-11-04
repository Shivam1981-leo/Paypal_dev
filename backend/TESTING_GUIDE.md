# PayGuard AI Backend - Testing Guide

## 🚦 Prerequisites

Before testing, ensure the following are installed and running:

### 1. Docker Desktop
**Status:** ⚠️ Not currently running

**To start:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon should be stable)
3. Verify with: `docker info`

### 2. Node.js 22.11+
**Check:** `node --version`

### 3. npm 10.0+
**Check:** `npm --version`

---

## 🧪 Testing Steps

### Step 1: Start Infrastructure Services

```bash
# Make sure Docker Desktop is running first!
docker info

# Start PostgreSQL, Redis, and Elasticsearch
./start-services.sh

# Or manually:
docker-compose up -d

# Wait for services to be ready (30-60 seconds for Elasticsearch)
```

**Verify Services:**
```bash
# Check all services are running
docker-compose ps

# Test PostgreSQL
docker-compose exec postgres pg_isready -U payguard

# Test Redis
docker-compose exec redis redis-cli ping

# Test Elasticsearch
curl http://localhost:9200/_cluster/health
```

**Expected Output:**
- PostgreSQL: "accepting connections"
- Redis: "PONG"
- Elasticsearch: JSON with status "yellow" or "green"

---

### Step 2: Setup Database

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and add your PayPal credentials:
# PAYPAL_CLIENT_ID=your_sandbox_client_id
# PAYPAL_SECRET=your_sandbox_secret
# JWT_SECRET=your_32_char_secret
# API_KEY_SALT=your_32_char_salt

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed
```

**Expected Output:**
- Migrations: SQL files created in `src/db/migrations/`
- Seed: Demo merchant credentials printed to console

---

### Step 3: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev
```

**Expected Output:**
```
✅ Environment variables validated
✅ Database connected
✅ Redis connected
✅ Elasticsearch connected - Status: yellow
✅ Transactions index created
✅ Risk scores index created
✅ Plugins registered
✅ Routes registered
🚀 Server running on http://0.0.0.0:3001
🔌 WebSocket available at ws://0.0.0.0:3001/ws
🌍 Environment: development
```

---

### Step 4: Test API Endpoints

#### 4.1 Health Check
```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-04T06:59:00.000Z",
  "services": {
    "database": "up",
    "redis": "up",
    "elasticsearch": "up"
  }
}
```

#### 4.2 Register New Merchant
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmerchant@test.com",
    "password": "SecurePass123!",
    "name": "Test Merchant Store"
  }'
```

**Expected:**
```json
{
  "message": "Registration successful",
  "merchant": {
    "id": "uuid-here",
    "email": "newmerchant@test.com",
    "name": "Test Merchant Store",
    "apiKey": "pk_...",
    "isActive": true
  },
  "token": "eyJhbGciOi..."
}
```

**Save the token for next steps!**

#### 4.3 Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@payguard.ai",
    "password": "Demo123!"
  }'
```

**Expected:**
```json
{
  "message": "Login successful",
  "merchant": { ... },
  "token": "eyJhbGciOi..."
}
```

#### 4.4 Get Current User
```bash
# Replace YOUR_JWT_TOKEN with token from login/register
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.5 Create Transaction
```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "buyer@example.com",
    "amount": 99.99,
    "currency": "USD",
    "deviceData": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }'
```

**Expected:**
```json
{
  "message": "Transaction created",
  "transaction": {
    "id": "uuid-here",
    "merchantId": "...",
    "buyerEmail": "buyer@example.com",
    "amount": "99.99",
    "status": "PENDING",
    "paypalOrderId": "ORDER_..."
  },
  "paypalOrder": {
    "id": "ORDER_...",
    "status": "CREATED",
    "links": [...]
  }
}
```

#### 4.6 Risk Check
```bash
curl -X POST http://localhost:3001/api/v1/risk-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "suspicious@example.com",
    "amount": 5000,
    "currency": "USD"
  }'
```

**Expected:**
```json
{
  "riskScore": 0.800,
  "riskCategory": "RED",
  "flags": ["HIGH_AMOUNT", "VERY_HIGH_AMOUNT"],
  "recommendation": "DECLINE",
  "explanation": "Risk assessment based on 2 factors..."
}
```

#### 4.7 Get Merchant Statistics
```bash
curl http://localhost:3001/api/v1/merchants/statistics?days=30 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.8 List Transactions
```bash
curl "http://localhost:3001/api/v1/transactions?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Step 5: Test WebSocket Connection

Create a file `test-websocket.js`:
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('open', () => {
  console.log('✅ WebSocket connected');
  ws.send(JSON.stringify({ type: 'test', message: 'Hello' }));
});

ws.on('message', (data) => {
  console.log('📨 Received:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', () => {
  console.log('🔌 WebSocket closed');
});

setTimeout(() => ws.close(), 5000);
```

Run: `node test-websocket.js`

---

### Step 6: Test PayPal Integration (Optional)

**Requires valid PayPal Sandbox credentials in .env**

```bash
npm run test:paypal
```

**Expected:**
- ✅ Access token obtained
- ✅ Order created with order ID
- ✅ Order details retrieved

---

### Step 7: Run Unit Tests

```bash
# Run all tests
npm test

# Run with UI
npm test:ui

# Run specific test file
npm test auth.service.test.ts
```

---

### Step 8: Database Management

```bash
# Open Drizzle Studio (visual database manager)
npm run db:studio
# Opens http://localhost:4983
```

**Verify Tables:**
- ✅ merchants (with demo data)
- ✅ transactions (with sample transactions)
- ✅ risk_scores
- ✅ webhook_events

---

## 🔍 Troubleshooting

### Issue: "Docker is not running"
**Solution:** Start Docker Desktop and wait for it to fully initialize

### Issue: "Database connection failed"
**Solution:** 
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# Restart if needed
docker-compose restart postgres
```

### Issue: "Redis connection failed"
**Solution:**
```bash
docker-compose restart redis
```

### Issue: "Elasticsearch not ready"
**Solution:** 
- Wait 30-60 seconds after starting (Elasticsearch is slow to start)
- Check logs: `docker-compose logs elasticsearch`

### Issue: "Port 3001 already in use"
**Solution:**
```bash
# Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change PORT in .env
```

### Issue: "PayPal authentication failed"
**Solution:**
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` in `.env`
- Ensure you're using **sandbox** credentials
- Get credentials from: https://developer.paypal.com/

---

## ✅ Success Criteria

After completing all tests, verify:

- [ ] Docker services running (postgres, redis, elasticsearch)
- [ ] Database migrations applied successfully
- [ ] Backend server starts without errors
- [ ] Health endpoint returns "healthy"
- [ ] Can register new merchant
- [ ] Can login and get JWT token
- [ ] Can create transactions with PayPal
- [ ] Risk check returns proper scores
- [ ] WebSocket connects successfully
- [ ] Drizzle Studio shows tables with data
- [ ] Unit tests pass

---

## 📊 Performance Benchmarks

**Expected Response Times:**
- Health check: < 50ms
- Authentication: < 200ms
- Transaction creation: < 1000ms (PayPal API call)
- Risk check: < 100ms
- Database queries: < 50ms

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Commit the backend code**
   ```bash
   git add .
   git commit -m "feat: Implement complete backend with Fastify, Drizzle, PayPal integration"
   ```

2. **Create pull request**
   ```bash
   git push origin development
   # Then create PR to main
   ```

3. **Start frontend development** (Week 2)
   - Next.js 15 with App Router
   - Connect to backend API
   - Build merchant dashboard

4. **ML Model Integration** (Week 2)
   - Replace placeholder risk scoring
   - Train on transaction data
   - Deploy model endpoint

---

## 📝 Test Results Template

```
# Backend Test Results - 2026-11-04

## Environment
- Node.js: v22.11.0
- Docker: Desktop 4.x
- OS: Windows 11

## Services Status
- [ ] PostgreSQL 17: Running
- [ ] Redis 7: Running
- [ ] Elasticsearch 8.16: Running

## API Tests
- [ ] Health check: PASS
- [ ] Register: PASS
- [ ] Login: PASS
- [ ] Get user: PASS
- [ ] Create transaction: PASS
- [ ] Risk check: PASS
- [ ] Statistics: PASS
- [ ] WebSocket: PASS

## Performance
- Health endpoint: Xms
- Auth endpoint: Xms
- Transaction creation: Xms

## Issues Found
- None / List issues here

## Notes
- Add any observations
```

---

## 🆘 Getting Help

If you encounter issues:

1. Check Docker logs: `docker-compose logs [service]`
2. Check backend logs in terminal
3. Verify .env configuration
4. Ensure all ports are available (3001, 5432, 6379, 9200)
5. Review this guide's troubleshooting section

**Common Pitfall:** Elasticsearch takes 30-60 seconds to start. Don't panic if it's not immediately ready!
