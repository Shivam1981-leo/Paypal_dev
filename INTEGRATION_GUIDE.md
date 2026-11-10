# PayGuard AI - ML Integration Guide

**Date:** November 5, 2026  
**Status:** ✅ Integration Complete - Ready for Testing

---

## Overview

PayGuard AI backend is now integrated with the trained ML fraud detection model (`payguard_vesta_v1`). The system uses a **microservices architecture** with the Node.js backend communicating with the Python FastAPI ML service.

---

## Architecture

```
┌─────────────────┐      HTTP REST      ┌──────────────────┐
│                 │   (localhost:3000)   │                  │
│  Frontend/API   │ ──────────────────>  │  Node.js Backend │
│   Consumer      │                      │  (Express/Fastify)│
│                 │                      │                  │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                                  │ HTTP REST
                                                  │ POST /predict
                                                  │ (localhost:8000)
                                                  │
                                         ┌────────▼─────────┐
                                         │  Python FastAPI   │
                                         │   ML Service      │
                                         │                   │
                                         │ XGBoost Model     │
                                         │ payguard_vesta_v1 │
                                         └───────────────────┘
```

---

## Components

### 1. Backend Service (`backend/`)

**New Files:**
- `src/services/ml.service.ts` - ML service client
- Integration with `src/routes/risk-check.routes.ts`

**Updated Files:**
- `src/config/env.ts` - Added `ML_SERVICE_URL`
- `.env.example` - ML service configuration

**Features:**
- ✅ ML service health checks (every 5 minutes)
- ✅ Automatic fallback to placeholder if ML unavailable
- ✅ Request/response mapping between backend and ML API
- ✅ Error handling and timeout management

### 2. ML Service (`ml/`)

**Trained Model:**
- Location: `ml/models/payguard_vesta_v1/`
- Files: `model.ubj`, `metadata.json`, `feature_importance.json`
- Performance: 89.98% AUC-ROC, 5% FPR, 60.43% recall

**API Service:**
- Framework: FastAPI
- Port: 8000 (default)
- Endpoints:
  - `POST /predict` - Risk prediction
  - `GET /health` - Health check
  - `GET /model/info` - Model information

---

## Setup Instructions

### Step 1: Start ML Service

```bash
cd ml

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start ML API server
cd src/api
uvicorn main:app --reload --port 8000

# Test health
curl http://localhost:8000/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2026-11-05T14:56:00"
}
```

### Step 2: Start Backend Service

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env: Set ML_SERVICE_URL=http://localhost:8000

# Start backend
npm run dev
```

### Step 3: Test Integration

**Test risk check endpoint:**

```bash
curl -X POST http://localhost:3000/risk-check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "buyerEmail": "test@example.com",
    "amount": 500.00,
    "currency": "USD",
    "deviceData": {
      "deviceId": "device123",
      "ipAddress": "192.168.1.1",
      "deviceReputationScore": 0.8
    },
    "sessionData": {
      "timeOnSiteSeconds": 120,
      "pagesVisited": 5,
      "checkoutSpeedSeconds": 45
    },
    "accountAgeDays": 30,
    "useMLModel": true
  }'
```

**Expected response:**
```json
{
  "riskScore": 0.2543,
  "riskCategory": "GREEN",
  "recommendation": "PROCEED_PAYPAL",
  "flags": [],
  "explanation": {
    "top_features": [
      {"feature": "email_domains_match", "impact": 0.0456, "value": 1.0},
      {"feature": "V70", "impact": -0.0234, "value": 0.8}
    ]
  },
  "processingTimeMs": 45,
  "modelUsed": "payguard_vesta_v1"
}
```

---

## API Schema

### Backend Risk Check Request

```typescript
{
  buyerEmail: string              // Required: email address
  amount: number                  // Required: transaction amount
  currency: string                // Default: "USD"
  country?: string                // 2-letter country code
  deviceData?: {
    deviceId: string
    ipAddress: string
    userAgent?: string
    vpnDetected?: boolean         // Default: false
    torDetected?: boolean          // Default: false
    deviceReputationScore?: number // 0.0-1.0, default: 0.5
  }
  sessionData?: {
    timeOnSiteSeconds: number
    pagesVisited: number
    checkoutSpeedSeconds: number
  }
  cartItems?: Array<{
    name: string
    price: number
    quantity: number
    category: string
    isDigital?: boolean
    isHighRisk?: boolean
  }>
  accountAgeDays?: number         // Default: 0
  emailIsDisposable?: boolean     // Default: false
  geoIpBillingDistanceKm?: number // Default: 0
  useMLModel?: boolean            // Default: true
}
```

### Backend Risk Check Response

```typescript
{
  riskScore: number               // 0.0-1.0
  riskCategory: "GREEN" | "YELLOW" | "RED"
  recommendation: "PROCEED_PAYPAL" | "MANUAL_REVIEW" | "BLOCK_TRANSACTION"
  flags: string[]                 // Risk flags detected
  explanation: {
    top_features: Array<{
      feature: string
      impact: number
      value: number
    }>
  }
  processingTimeMs: number
  modelUsed: string               // "payguard_vesta_v1" or "placeholder"
}
```

---

## Risk Categories

| Category | Risk Score | Recommendation | Action |
|----------|------------|----------------|--------|
| **GREEN** | 0.0 - 0.4 | PROCEED_PAYPAL | Auto-approve with PayPal |
| **YELLOW** | 0.4 - 0.7 | MANUAL_REVIEW | Flag for manual review |
| **RED** | 0.7 - 1.0 | BLOCK_TRANSACTION | Block transaction |

---

## Deployment

### Docker Compose (Recommended)

```yaml
# Add to docker-compose.yml

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - ml-service
      - postgres
      - redis

  ml-service:
    build: ./ml
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=models/production
    volumes:
      - ./ml/models:/app/models
```

### Production Checklist

- [ ] Set `MODEL_PATH=models/production` in ML service
- [ ] Configure `ML_SERVICE_URL` in backend environment
- [ ] Enable HTTPS for ML service communication
- [ ] Set up monitoring for ML service health
- [ ] Configure auto-restart for ML service failures
- [ ] Set up model versioning and rollback strategy
- [ ] Implement rate limiting on `/predict` endpoint
- [ ] Configure logging and metrics collection

---

## Monitoring

### ML Service Health

```bash
# Check ML service health
curl http://localhost:8000/health

# Get model info
curl http://localhost:8000/model/info

# Backend health check (includes ML status)
curl http://localhost:3000/risk-check/model-info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Key Metrics to Monitor

- ML service uptime
- Prediction latency (target: <100ms)
- Prediction throughput
- Error rate
- Fallback usage rate
- Model performance drift (precision/recall over time)

---

## Fallback Behavior

The backend automatically falls back to a **placeholder risk calculator** if:
- ML service is down or unhealthy
- ML prediction request times out (>10s)
- ML service returns an error
- `useMLModel: false` in request

**Placeholder logic:**
- Simple rule-based scoring
- Flags: HIGH_AMOUNT, NO_DEVICE_DATA, NO_SESSION_DATA
- Returns `modelUsed: "placeholder"` in response

---

## Troubleshooting

### Issue: ML service not responding

**Check:**
```bash
# Is ML service running?
curl http://localhost:8000/health

# Check ML service logs
cd ml/src/api
uvicorn main:app --reload --port 8000 --log-level debug
```

**Fix:** Restart ML service

### Issue: Model not loaded

**Check:**
```bash
# Verify model files exist
ls -la ml/models/production/

# Should see:
# - model.ubj
# - metadata.json
# - feature_importance.json
```

**Fix:** Copy trained model to production:
```bash
cd ml
cp -r models/payguard_vesta_v1/* models/production/
```

### Issue: Backend can't reach ML service

**Check:**
```bash
# From backend container/process
curl http://localhost:8000/health

# Check backend env
echo $ML_SERVICE_URL
```

**Fix:** Update `ML_SERVICE_URL` in `.env` or Docker network

---

## Next Steps

1. **✅ ML Integration Complete** - Backend connected to ML service
2. **🔄 Testing Required:**
   - Integration tests with real transaction data
   - Load testing ML service (target: 50 RPS)
   - Fallback behavior validation
3. **📊 Production Readiness:**
   - Deploy to staging environment
   - A/B test against baseline
   - Monitor false positive rate
4. **🚀 Future Enhancements:**
   - Model retraining pipeline
   - Feature drift monitoring
   - Multi-model ensemble

---

## Files Modified/Created

```
backend/
├── src/
│   ├── services/
│   │   └── ml.service.ts          # NEW: ML service client
│   ├── routes/
│   │   └── risk-check.routes.ts   # UPDATED: ML integration
│   └── config/
│       └── env.ts                 # UPDATED: ML_SERVICE_URL
└── .env.example                   # UPDATED: ML config

ml/
├── models/
│   ├── payguard_vesta_v1/         # NEW: Trained model
│   │   ├── model.ubj
│   │   ├── metadata.json
│   │   └── feature_importance.json
│   └── production/                # UPDATED: Copy of v1
└── src/api/main.py                # READY: FastAPI service

INTEGRATION_GUIDE.md              # NEW: This file
```

---

**Status:** ✅ Ready to push to development branch
