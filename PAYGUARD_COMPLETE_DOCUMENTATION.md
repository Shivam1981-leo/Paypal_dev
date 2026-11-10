# PayGuard AI - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [What is PayGuard AI?](#what-is-payguard-ai)
3. [Who Should Use This?](#who-should-use-this)
4. [Core Features](#core-features)
5. [Architecture](#architecture)
6. [How It Works](#how-it-works)
7. [API Documentation](#api-documentation)
8. [User Flow](#user-flow)
9. [ML Model Details](#ml-model-details)
10. [All Functions & Services](#all-functions--services)
11. [Risk Scoring System](#risk-scoring-system)
12. [Integration Guide](#integration-guide)

---

## Overview

**PayGuard AI** is a pre-authorization fraud detection system that analyzes transactions BEFORE they reach PayPal. It uses machine learning trained on 590,000+ real fraud transactions to predict risk in real-time (<50ms), helping merchants avoid fraud, chargebacks, and account holds.

### Key Statistics
- **Model Performance**: 89.98% AUC-ROC, 60.43% recall at 5% FPR
- **Dataset**: IEEE-CIS Vesta fraud detection dataset (590K transactions)
- **Features**: 120 engineered features
- **Inference Speed**: <50ms per transaction
- **Model**: LightGBM ensemble with SHAP explainability

---

## What is PayGuard AI?

PayGuard AI is a **fraud prevention layer** that sits BEFORE PayPal in your checkout flow:

```
Customer → Your Checkout → PayGuard AI Risk Check → ✅ Low Risk → PayPal
                                                  → ⚠️ Medium Risk → Manual Review
                                                  → ❌ High Risk → Block Transaction
```

### The Problem It Solves

**Without PayGuard:**
- Fraud transactions reach PayPal
- Chargebacks damage your account
- High fraud rates lead to account holds/restrictions
- You lose money + products + PayPal fees

**With PayGuard:**
- Block fraud BEFORE it reaches PayPal
- Reduce chargebacks by 60-80%
- Maintain healthy PayPal account standing
- Get real-time risk explanations
- Lower transaction fees (avoid fraud penalties)

---

## Who Should Use This?

### Perfect For:

1. **E-commerce Merchants**
   - High transaction volumes (>100/day)
   - Selling digital goods or high-value items
   - International sales
   - Experiencing fraud issues

2. **PayPal Business Accounts**
   - Dealing with account holds due to fraud
   - Want to reduce chargeback rates
   - Need pre-authorization fraud detection
   - Want to maintain account health

3. **SaaS/Subscription Businesses**
   - Recurring payments
   - Free trial abuse
   - Card testing attacks
   - Need automated fraud prevention

4. **Marketplace Platforms**
   - Multiple sellers
   - Need centralized fraud detection
   - Want to protect seller accounts
   - High-risk categories (electronics, gift cards, etc.)

### NOT Recommended For:
- Very low volume merchants (<10 transactions/day)
- In-person only transactions
- Merchants with 0% fraud rates
- Non-PayPal payment processors (currently)

---

## Core Features

### 1. **Real-Time Risk Scoring**
- Analyzes transactions in <50ms
- Returns 0-100% fraud probability
- Categorizes as GREEN/YELLOW/RED
- Provides actionable recommendations

### 2. **AI-Powered Detection**
- LightGBM model trained on 590K real fraud cases
- 120 engineered features
- Pattern detection across:
  - Transaction amounts
  - Device fingerprints
  - Session behavior
  - Geographic signals
  - Email reputation
  - Velocity patterns

### 3. **Explainable AI (SHAP)**
- Shows WHY a transaction is risky
- Top 10 contributing features per transaction
- Feature importance scores
- Transparent decision-making

### 4. **Multi-Layer Detection**
- ML model baseline score
- Device telemetry (VPN/Tor detection)
- Email validation (disposable email detection)
- Behavioral signals (checkout speed, engagement)
- Geographic anomalies (IP/billing mismatch)
- Amount-based rules

### 5. **Merchant Dashboard**
- Transaction history
- Risk analytics
- High-risk transaction alerts
- Statistics (last 30 days)
- API key management

### 6. **PayPal Integration**
- Create PayPal orders
- Capture payments
- Webhook handling
- Transaction synchronization
- Automatic risk scoring post-payment

### 7. **Developer-Friendly API**
- RESTful API with OpenAPI/Swagger docs
- JWT authentication
- Rate limiting
- Comprehensive error handling
- TypeScript/Zod validation

### 8. **Real-Time Monitoring**
- Elasticsearch-powered search
- Redis caching
- PostgreSQL for transactions
- WebSocket support for live updates
- Health checks and metrics

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)                                         │
│  - Dashboard, Login, Registration                           │
│  - Risk Check Interface                                     │
│  - Transaction History                                      │
│  Port: 3000                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Fastify + TypeScript)                         │
│  - Authentication (JWT)                                     │
│  - Transaction Management                                   │
│  - Risk Check Orchestration                                 │
│  - PayPal Integration                                       │
│  - Webhook Processing                                       │
│  Port: 3001                                                 │
└──┬───────────┬───────────┬───────────┬──────────────────────┘
   │           │           │           │
   │           │           │           └──→ PayPal API
   │           │           │                (Orders, Capture, Webhooks)
   │           │           │
   │           │           └──→ ML Service (HTTP)
   │           │                ┌─────────────────────────────┐
   │           │                │ ML API (FastAPI + Python)   │
   │           │                │ - Fraud Detection Model     │
   │           │                │ - Feature Engineering       │
   │           │                │ - SHAP Explainability       │
   │           │                │ Port: 8000                  │
   │           │                └─────────────────────────────┘
   │           │
   │           └──→ Redis (Cache)
   │                - Session storage
   │                - Rate limiting
   │                - Token cache
   │                Port: 6379
   │
   └──→ PostgreSQL (Database)
        - Merchants
        - Transactions
        - Webhooks
        Port: 5432

   └──→ Elasticsearch (Search/Analytics)
        - Transaction search
        - Analytics aggregations
        Port: 9200
```

### Tech Stack

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- TailwindCSS
- Axios for API calls

**Backend:**
- Fastify (Node.js framework)
- TypeScript
- Drizzle ORM
- PostgreSQL
- Redis (ioredis)
- Elasticsearch
- JWT authentication
- Zod validation

**ML Service:**
- Python 3.8+
- FastAPI
- LightGBM
- SHAP
- Polars (DataFrames)
- NumPy
- Uvicorn

**Infrastructure:**
- PostgreSQL 14+
- Redis 6+
- Elasticsearch 8.16
- Node.js 22+
- Python 3.8+

---

## How It Works

### Transaction Flow

```
1. Customer initiates checkout
   └─→ Frontend collects transaction data

2. Merchant calls /api/v1/risk-check
   └─→ Backend receives request
       └─→ Validates input (Zod schema)
       └─→ Calls ML Service

3. ML Service analyzes transaction
   └─→ Feature engineering (120 features)
   └─→ Model prediction (fraud probability)
   └─→ SHAP explanation (feature impacts)
   └─→ Returns risk score + category

4. Backend applies composite scoring
   └─→ Adds telemetry signals (VPN/Tor)
   └─→ Adds behavioral signals
   └─→ Calculates final risk score
   └─→ Categorizes: GREEN/YELLOW/RED

5. Risk decision returned to merchant
   ├─→ GREEN (0-35%): Proceed to PayPal
   ├─→ YELLOW (35-70%): Manual review
   └─→ RED (70-100%): Block transaction

6. If approved, create PayPal order
   └─→ POST /api/v1/transactions
       └─→ Creates PayPal order
       └─→ Stores transaction in DB
       └─→ Returns order ID to frontend

7. Customer completes PayPal checkout
   └─→ PayPal processes payment

8. Capture payment
   └─→ POST /api/v1/transactions/:id/capture
       └─→ Captures PayPal order
       └─→ Updates transaction status
       └─→ Stores final risk score
```

---

## API Documentation

### Base URL
```
Backend API: http://localhost:3001/api/v1
ML Service: http://localhost:8000
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

### Authentication Endpoints

#### `POST /api/v1/auth/register`
Register a new merchant account.

**Request:**
```json
{
  "email": "merchant@example.com",
  "password": "SecurePass123!",
  "name": "My Business",
  "industryCategory": "electronics" // optional
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "merchant": {
    "id": "merchant_abc123",
    "email": "merchant@example.com",
    "name": "My Business",
    "apiKey": "pk_live_abc123...",
    "isActive": true,
    "createdAt": "2026-11-07T08:00:00Z"
  },
  "token": "eyJhbGc..."
}
```

#### `POST /api/v1/auth/login`
Login to merchant account.

**Request:**
```json
{
  "email": "merchant@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "merchant": { /* merchant object */ },
  "token": "eyJhbGc..."
}
```

#### `GET /api/v1/auth/me`
Get current merchant info (requires auth).

**Response:**
```json
{
  "merchant": {
    "id": "merchant_abc123",
    "email": "merchant@example.com",
    "name": "My Business",
    "apiKey": "pk_live_abc123...",
    "isActive": true
  }
}
```

#### `POST /api/v1/auth/api-key/regenerate`
Regenerate API key (requires auth).

**Response:**
```json
{
  "message": "API key regenerated",
  "apiKey": "pk_live_xyz789..."
}
```

#### `POST /api/v1/auth/password/change`
Change password (requires auth).

**Request:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

### Risk Check Endpoints

#### `POST /api/v1/risk-check`
**The main fraud detection endpoint.** Analyze transaction risk before payment.

**Request:**
```json
{
  "buyerEmail": "customer@example.com",
  "amount": 299.99,
  "currency": "USD",
  "country": "US", // optional
  "deviceData": {
    "deviceId": "dev_fp_abc123",
    "ipAddress": "203.45.67.89",
    "userAgent": "Mozilla/5.0...",
    "vpnDetected": false,
    "torDetected": false,
    "deviceReputationScore": 0.8
  },
  "sessionData": {
    "timeOnSiteSeconds": 120,
    "pagesVisited": 5,
    "checkoutSpeedSeconds": 45
  },
  "cartItems": [
    {
      "name": "iPhone 15 Pro",
      "price": 299.99,
      "quantity": 1,
      "category": "electronics",
      "isDigital": false,
      "isHighRisk": true
    }
  ],
  "accountAgeDays": 30,
  "emailIsDisposable": false,
  "geoIpBillingDistanceKm": 15.5,
  "useMLModel": true
}
```

**Response:**
```json
{
  "riskScore": 0.2345,
  "riskCategory": "GREEN",
  "flags": ["HIGH_AMOUNT"],
  "recommendation": "APPROVE",
  "explanation": {
    "top_features": [
      {
        "feature": "transaction_amount_log",
        "impact": 0.0234,
        "value": 5.7
      },
      {
        "feature": "device_risk_score",
        "impact": -0.0123,
        "value": 0.2
      }
    ],
    "baseline_ml_score": 0.1845
  },
  "processingTimeMs": 42,
  "modelUsed": "payguard_vesta_v1"
}
```

**Risk Categories:**
- `GREEN` (0-35%): Low risk → Proceed to PayPal
- `YELLOW` (35-70%): Medium risk → Manual review recommended
- `RED` (70-100%): High risk → Block transaction

**Recommendations:**
- `APPROVE`: Safe to proceed with PayPal
- `REVIEW`: Flag for manual review
- `DECLINE`: Block transaction

#### `GET /api/v1/risk-check/model-info`
Get ML model information and health status.

**Response:**
```json
{
  "healthy": true,
  "modelInfo": {
    "version": "v1",
    "n_features": 120,
    "threshold": 0.5,
    "metrics": {
      "auc_roc": 0.8998,
      "recall": 0.6043,
      "fpr": 0.05
    }
  }
}
```

---

### Transaction Endpoints

#### `POST /api/v1/transactions`
Create a transaction and PayPal order (requires auth).

**Request:**
```json
{
  "buyerEmail": "customer@example.com",
  "amount": 299.99,
  "currency": "USD",
  "deviceData": { /* same as risk-check */ },
  "sessionData": { /* same as risk-check */ },
  "cartItems": [ /* optional */ ]
}
```

**Response:**
```json
{
  "message": "Transaction created",
  "transaction": {
    "id": "txn_abc123",
    "merchantId": "merchant_abc123",
    "buyerEmail": "customer@example.com",
    "amount": 299.99,
    "currency": "USD",
    "status": "created",
    "createdAt": "2026-11-07T08:00:00Z"
  },
  "paypalOrder": {
    "id": "PAYPAL_ORDER_ID",
    "status": "CREATED",
    "links": [
      {
        "href": "https://www.paypal.com/checkoutnow?token=...",
        "rel": "approve",
        "method": "GET"
      }
    ]
  }
}
```

#### `POST /api/v1/transactions/:id/capture`
Capture payment for a transaction (requires auth).

**Request:**
```json
{
  "orderId": "PAYPAL_ORDER_ID"
}
```

**Response:**
```json
{
  "message": "Payment captured",
  "transaction": {
    "id": "txn_abc123",
    "status": "completed",
    "paypalOrderId": "PAYPAL_ORDER_ID",
    "completedAt": "2026-11-07T08:05:00Z"
  },
  "riskScore": 0.2345
}
```

#### `GET /api/v1/transactions/:id`
Get transaction by ID (requires auth).

**Response:**
```json
{
  "transaction": {
    "id": "txn_abc123",
    "merchantId": "merchant_abc123",
    "buyerEmail": "customer@example.com",
    "amount": 299.99,
    "currency": "USD",
    "status": "completed",
    "riskScore": 0.2345,
    "riskCategory": "GREEN",
    "paypalOrderId": "PAYPAL_ORDER_ID",
    "createdAt": "2026-11-07T08:00:00Z",
    "completedAt": "2026-11-07T08:05:00Z"
  }
}
```

#### `GET /api/v1/transactions`
Get all transactions for current merchant (requires auth).

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)
- `status`: Filter by status (created, completed, failed)
- `riskCategory`: Filter by risk (GREEN, YELLOW, RED)

**Response:**
```json
{
  "transactions": [ /* array of transactions */ ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### `GET /api/v1/transactions/high-risk`
Get recent high-risk transactions (requires auth).

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_xyz789",
      "riskScore": 0.8523,
      "riskCategory": "RED",
      "flags": ["TOR_DETECTED", "HIGH_AMOUNT", "DISPOSABLE_EMAIL"],
      "amount": 2500.00,
      "buyerEmail": "suspicious@tempmail.com",
      "createdAt": "2026-11-07T07:45:00Z"
    }
  ]
}
```

---

### Merchant Profile Endpoints

#### `GET /api/v1/merchants/profile`
Get current merchant profile (requires auth).

#### `PUT /api/v1/merchants/profile`
Update merchant profile (requires auth).

**Request:**
```json
{
  "name": "Updated Business Name",
  "industryCategory": "software"
}
```

#### `GET /api/v1/merchants/statistics`
Get merchant statistics (requires auth).

**Query Parameters:**
- `days`: Time period in days (default: 30)

**Response:**
```json
{
  "statistics": {
    "totalTransactions": 523,
    "totalAmount": 125430.50,
    "avgTransactionAmount": 239.79,
    "fraudDetected": 43,
    "fraudRate": 0.0822,
    "riskDistribution": {
      "GREEN": 450,
      "YELLOW": 30,
      "RED": 43
    }
  }
}
```

#### `POST /api/v1/merchants/deactivate`
Deactivate merchant account (requires auth).

#### `POST /api/v1/merchants/reactivate`
Reactivate merchant account (requires auth).

---

### Webhook Endpoints

#### `POST /api/v1/webhook`
Receive PayPal webhook events (no auth required, signature verified).

PayPal webhooks for:
- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

**PayPal Headers:**
```
paypal-transmission-id
paypal-transmission-time
paypal-transmission-sig
paypal-cert-url
paypal-auth-algo
```

---

### ML Service Endpoints

#### `POST http://localhost:8000/predict`
Direct ML prediction (used by backend).

**Request:** Same as risk-check endpoint

**Response:** Risk score with SHAP explanation

#### `GET http://localhost:8000/model/info`
Get model metrics and metadata.

#### `GET http://localhost:8000/model/features`
Get feature importance rankings.

#### `GET http://localhost:8000/health`
Health check endpoint.

---

## User Flow

### 1. Merchant Registration & Setup

```
1. Visit http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill registration form:
   - Email
   - Password (min 8 characters)
   - Business name
   - Industry (optional)
4. Submit → Account created
5. Redirected to dashboard
6. Copy API key from settings
```

### 2. Integration Flow (For Developers)

```
1. Install PayGuard SDK (or use REST API)
2. Add risk check to checkout flow:

   // Before PayPal checkout
   const riskResult = await payguard.checkRisk({
     buyerEmail: 'customer@example.com',
     amount: 299.99,
     deviceData: collectDeviceFingerprint(),
     sessionData: trackUserBehavior()
   })

   if (riskResult.riskCategory === 'RED') {
     // Block transaction
     return showError('Transaction declined')
   }

   if (riskResult.riskCategory === 'YELLOW') {
     // Require additional verification
     return requestAdditionalInfo()
   }

   // GREEN - proceed to PayPal
   createPayPalOrder()
```

### 3. Customer Checkout Flow

```
Customer Journey:

1. Browse products → Add to cart
   └─→ Frontend tracks session data:
       - Time on site
       - Pages visited
       - Device fingerprint

2. Click "Checkout"
   └─→ Customer enters email/shipping

3. Click "Pay with PayPal"
   └─→ Frontend calls: POST /api/v1/risk-check
       └─→ Backend analyzes risk
           └─→ ML model predicts
               └─→ Returns risk decision

4A. If GREEN (low risk):
    └─→ Create PayPal order
    └─→ Redirect to PayPal
    └─→ Customer completes payment
    └─→ Webhook confirms payment
    └─→ Order fulfilled

4B. If YELLOW (medium risk):
    └─→ Request additional verification
    └─→ Manual review queue
    └─→ Merchant approves/declines

4C. If RED (high risk):
    └─→ Block transaction
    └─→ Show error message
    └─→ Log fraud attempt
    └─→ No PayPal order created
```

### 4. Merchant Dashboard Flow

```
Daily Operations:

1. Login to dashboard
2. View today's statistics:
   - Total transactions
   - Fraud detected
   - Risk distribution

3. Monitor high-risk transactions:
   - Review flagged transactions
   - See risk explanations
   - Take action (approve/decline)

4. Search transaction history:
   - Filter by date/status/risk
   - View details
   - Download reports

5. Manage settings:
   - Update profile
   - Regenerate API key
   - Configure webhooks
```

---

## ML Model Details

### Model: PayGuard Vesta v1

#### Training Dataset
- **Source**: IEEE-CIS Fraud Detection (Vesta Corporation)
- **Size**: 590,540 transactions
- **Fraud Rate**: 3.5% (20,663 fraud cases)
- **Time Period**: Real-world e-commerce transactions
- **Features**: 394 raw features → 120 engineered features

#### Model Architecture
- **Algorithm**: LightGBM (Gradient Boosting)
- **Type**: Binary classification (fraud vs. legitimate)
- **Trees**: 500
- **Max Depth**: 7
- **Learning Rate**: 0.05
- **Objective**: Binary cross-entropy

#### Performance Metrics
```
AUC-ROC:           89.98%
Precision:         67.32% (at 5% FPR threshold)
Recall:            60.43% (catches 60% of fraud)
F1-Score:          63.69%
False Positive Rate: 5.0% (1 in 20 good transactions flagged)
```

#### Feature Engineering (120 Features)

**Transaction Features (15):**
- Amount (raw, log, decimal, normalized)
- Currency encoding
- High amount flags (>$1000, >$3000)
- Micro transaction flag (<$10)
- Amount velocity

**Device Features (25):**
- Device fingerprint hash
- OS detection (Windows, Mac, iOS, Android)
- Mobile vs. desktop
- Device reputation score
- Device risk score
- Browser type
- Screen resolution patterns

**Session Behavior (20):**
- Time on site (raw, log, normalized)
- Pages visited
- Checkout speed
- Velocity flags (rush checkout)
- Session engagement score
- Navigation patterns

**Email & Account (15):**
- Email domain reputation
- Disposable email detection
- Account age (days)
- Email validity score
- Domain age

**Geographic Features (15):**
- Country risk score
- IP geolocation
- IP-billing distance
- VPN detection
- Tor detection
- Geo mismatch flags

**Cart Features (10):**
- Item count
- Digital goods ratio
- High-risk items count
- Average item price
- Cart composition patterns

**Temporal Features (10):**
- Hour of day
- Day of week
- Is weekend
- Is night (local time)
- Time since last transaction

**Interaction Features (10):**
- Amount × device risk
- Amount × checkout speed
- Geo distance × amount
- Combined risk signals

#### SHAP Explainability

Every prediction includes SHAP values showing:
- **Feature contribution** to fraud score
- **Direction** of impact (increases/decreases risk)
- **Magnitude** of contribution

Example SHAP output:
```json
{
  "top_features": [
    {
      "feature": "checkout_speed_seconds",
      "impact": 0.1234,  // Positive = increases fraud risk
      "value": 3         // Checkout completed in 3 seconds
    },
    {
      "feature": "device_reputation_score",
      "impact": -0.0567, // Negative = decreases fraud risk
      "value": 0.85      // Good device reputation
    },
    {
      "feature": "tor_detected",
      "impact": 0.2145,
      "value": 1         // Tor network detected
    }
  ]
}
```

---

## All Functions & Services

### Backend Services

#### 1. **AuthService** (`backend/src/services/auth.service.ts`)

**Functions:**
- `register(data)` - Register new merchant
- `login(email, password)` - Authenticate merchant
- `regenerateApiKey(merchantId)` - Generate new API key
- `changePassword(merchantId, oldPassword, newPassword)` - Change password

**Used by:** Authentication routes

---

#### 2. **MerchantService** (`backend/src/services/merchant.service.ts`)

**Functions:**
- `getById(merchantId)` - Get merchant profile
- `updateProfile(merchantId, data)` - Update profile
- `getStatistics(merchantId, days)` - Get transaction stats
- `deactivate(merchantId)` - Deactivate account
- `reactivate(merchantId)` - Reactivate account

**Used by:** Merchant profile routes

---

#### 3. **TransactionService** (`backend/src/services/transaction.service.ts`)

**Functions:**
- `createTransaction(data)` - Create transaction + PayPal order
- `capturePayment(transactionId, orderId)` - Capture PayPal payment
- `getById(transactionId)` - Get transaction details
- `getMerchantTransactions(merchantId, filters)` - List transactions
- `getHighRiskTransactions(merchantId)` - Get flagged transactions
- `updateStatus(transactionId, status)` - Update transaction status
- `recordRiskScore(transactionId, riskData)` - Store risk analysis

**Used by:** Transaction routes, webhook processing

---

#### 4. **PayPalService** (`backend/src/services/paypal.service.ts`)

**Functions:**
- `getAccessToken()` - Get OAuth token (auto-refresh)
- `createOrder(amount, currency)` - Create PayPal order
- `captureOrder(orderId)` - Capture payment
- `getOrderDetails(orderId)` - Get order info
- `searchTransactions(startDate, endDate)` - Search historical transactions
- `verifyWebhookSignature(webhookData)` - Verify webhook authenticity

**Used by:** Transaction service, webhook service

**PayPal API Integration:**
- Sandbox: `https://api-m.sandbox.paypal.com`
- Live: `https://api-m.paypal.com`
- OAuth 2.0 authentication
- Automatic token refresh

---

#### 5. **MLService** (`backend/src/services/ml.service.ts`)

**Functions:**
- `predictRisk(request)` - Call ML service for fraud prediction
- `checkHealth()` - Verify ML service availability
- `getModelInfo()` - Get model metadata

**ML Service Communication:**
- HTTP REST to Python FastAPI
- Timeout: 10 seconds
- Auto health check every 30 seconds
- Fallback to rule-based scoring if ML unavailable

**Used by:** Risk check routes

---

#### 6. **WebhookService** (`backend/src/services/webhook.service.ts`)

**Functions:**
- `verifySignature(headers, body)` - Verify PayPal webhook signature
- `processWebhook(eventType, eventId, data)` - Handle webhook events
- `getUnprocessedWebhooks()` - Get pending webhooks
- `retryWebhook(webhookId)` - Retry failed webhook

**Webhook Events Handled:**
- `CHECKOUT.ORDER.APPROVED` - Order approved by customer
- `PAYMENT.CAPTURE.COMPLETED` - Payment captured successfully
- `PAYMENT.CAPTURE.DENIED` - Payment denied
- `PAYMENT.CAPTURE.REFUNDED` - Payment refunded

**Used by:** Webhook routes

---

### ML Service (Python)

#### 7. **FraudDetector** (`ml/src/models/fraud_detector.py`)

**Functions:**
- `__init__(model_path)` - Load trained model
- `predict(X)` - Predict fraud probability
- `predict_with_explanation(X, n_top_features)` - Predict + SHAP explanation
- `get_feature_importance(top_n)` - Get feature rankings
- `load_model(path)` - Load LightGBM model from disk

**Attributes:**
- `model` - LightGBM model
- `feature_names` - List of 120 features
- `threshold` - Decision threshold (0.5)
- `metrics` - Model performance metrics

---

#### 8. **FeatureEngineer** (`ml/src/features/feature_engineering.py`)

**Functions:**
- `extract_all_features(df)` - Generate all 120 features
- `extract_transaction_features(df)` - Amount-based features
- `extract_device_features(df)` - Device fingerprint features
- `extract_session_features(df)` - Behavior features
- `extract_email_features(df)` - Email reputation features
- `extract_geo_features(df)` - Geographic features
- `extract_temporal_features(df)` - Time-based features
- `extract_interaction_features(df)` - Combined features

**Used by:** ML API prediction endpoint

---

### Frontend Components

#### 9. **Dashboard** (`frontend/src/app/dashboard/page.tsx`)

**Features:**
- Transaction statistics (last 30 days)
- Risk distribution chart
- Recent transactions list
- High-risk alerts
- Quick actions (risk check, view transactions)

---

#### 10. **Risk Check Interface** (`frontend/src/app/dashboard/risk-check/page.tsx`)

**Features:**
- Transaction input form
- Device data collection
- Session tracking
- Risk result display
- SHAP feature importance visualization
- Recommendation actions

---

### Middleware & Utilities

#### 11. **Authentication Middleware** (`backend/src/middleware/auth.middleware.ts`)

**Functions:**
- `verifyJWT(request, reply, done)` - Verify JWT token
- `verifyAuth(request, reply, done)` - Verify token + load merchant

**Used by:** All protected routes

---

#### 12. **Database** (`backend/src/config/database.ts`)

**Configuration:**
- PostgreSQL connection via Drizzle ORM
- Connection pooling
- Transaction support
- Migration management

**Tables:**
- `merchants` - Merchant accounts
- `transactions` - Transaction records
- `webhooks` - PayPal webhook events

---

#### 13. **Redis** (`backend/src/config/redis.ts`)

**Usage:**
- Session caching
- Rate limiting
- Token storage
- Temporary data

---

#### 14. **Elasticsearch** (`backend/src/config/elastic.ts`)

**Usage:**
- Transaction search
- Analytics aggregations
- Full-text search
- Time-series data

---

## Risk Scoring System

### Composite Risk Score Calculation

The final risk score is a **calibrated composite** of:

1. **ML Model Baseline** (50% weight)
   - LightGBM prediction: 0.0 - 1.0
   - Trained on 590K fraud transactions
   - 120 engineered features

2. **Telemetry Signals** (30% weight)
   - VPN detected: +0.25
   - Tor detected: +0.40
   - Low device reputation (<0.2): +0.20

3. **Behavioral Signals** (15% weight)
   - Disposable email: +0.30
   - Fast checkout (<3s) + low dwell (<10s): +0.35
   - Fast checkout (<3s): +0.25
   - Medium checkout (<10s): +0.15

4. **Amount Signals** (5% weight)
   - >$3000: +0.20
   - >$1000: +0.10

**Final Score Formula:**
```python
composite_score = ml_baseline_score + sum(signal_adjustments)
composite_score = max(0.012, min(0.994, composite_score))  # Clamp to [0.012, 0.994]
```

### Risk Categories

```
GREEN (0-35%):   Low Risk
  → Action: Proceed to PayPal
  → ~90% of legitimate transactions
  
YELLOW (35-70%): Medium Risk
  → Action: Manual review recommended
  → ~8% of transactions
  → May include legitimate high-value purchases
  
RED (70-100%):   High Risk
  → Action: Block transaction
  → ~2% of transactions
  → Strong fraud indicators
```

### Risk Flags

**High Priority:**
- `TOR_DETECTED` - Tor network usage
- `VPN_DETECTED` - VPN/proxy detected
- `DISPOSABLE_EMAIL` - Temporary email service
- `HIGH_FRAUD_PROBABILITY` - ML model >80%

**Medium Priority:**
- `LOW_DEVICE_REPUTATION` - Untrusted device
- `GEO_MISMATCH` - IP/billing >500km apart
- `FAST_CHECKOUT` - Checkout <20 seconds
- `HIGH_AMOUNT` - Transaction >$1000

**Low Priority:**
- `NEW_ACCOUNT` - Account <7 days old
- `LOW_ENGAGEMENT` - ≤2 pages visited
- `MOSTLY_DIGITAL_GOODS` - >50% digital items

---

## Integration Guide

### Quick Integration

**1. Register & Get API Key**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "SecurePass123!",
    "name": "My Business"
  }'
```

**2. Add to Your Checkout Flow**

**Before PayPal Checkout:**
```javascript
// JavaScript/Node.js example
const axios = require('axios')

async function checkFraudRisk(orderData) {
  const response = await axios.post(
    'http://localhost:3001/api/v1/risk-check',
    {
      buyerEmail: orderData.email,
      amount: orderData.total,
      currency: 'USD',
      deviceData: {
        deviceId: collectDeviceFingerprint(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      },
      sessionData: {
        timeOnSiteSeconds: getSessionDuration(),
        pagesVisited: getPageCount(),
        checkoutSpeedSeconds: getCheckoutSpeed()
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${YOUR_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const { riskCategory, riskScore, flags } = response.data

  if (riskCategory === 'RED') {
    // Block transaction
    return {
      allowed: false,
      reason: 'Transaction declined due to high fraud risk'
    }
  }

  if (riskCategory === 'YELLOW') {
    // Manual review
    return {
      allowed: false,
      reason: 'Transaction requires manual review',
      reviewQueue: true
    }
  }

  // GREEN - proceed to PayPal
  return {
    allowed: true,
    riskScore: riskScore
  }
}
```

**3. Create PayPal Order (if approved)**
```javascript
async function createTransaction(orderData) {
  const response = await axios.post(
    'http://localhost:3001/api/v1/transactions',
    {
      buyerEmail: orderData.email,
      amount: orderData.total,
      currency: 'USD',
      deviceData: orderData.deviceData,
      sessionData: orderData.sessionData
    },
    {
      headers: {
        'Authorization': `Bearer ${YOUR_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const { transaction, paypalOrder } = response.data
  
  // Redirect user to PayPal
  const approveLink = paypalOrder.links.find(link => link.rel === 'approve')
  window.location.href = approveLink.href
}
```

**4. Capture Payment (after PayPal approval)**
```javascript
async function capturePayment(transactionId, paypalOrderId) {
  const response = await axios.post(
    `http://localhost:3001/api/v1/transactions/${transactionId}/capture`,
    {
      orderId: paypalOrderId
    },
    {
      headers: {
        'Authorization': `Bearer ${YOUR_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const { transaction, riskScore } = response.data
  
  // Fulfill order
  fulfillOrder(transaction.id)
}
```

---

### Device Fingerprinting

Collect device data on frontend:

```javascript
function collectDeviceFingerprint() {
  return {
    deviceId: generateFingerprint(),
    ipAddress: '', // Backend will fill this
    userAgent: navigator.userAgent,
    vpnDetected: false, // Use service like IPHub
    torDetected: false,
    deviceReputationScore: 0.8 // Use device intelligence service
  }
}

function generateFingerprint() {
  // Use library like FingerprintJS
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('fingerprint', 2, 2)
  
  const data = canvas.toDataURL()
  return hashCode(data)
}
```

---

### Session Tracking

Track user behavior:

```javascript
let sessionStart = Date.now()
let pagesVisited = 1
let checkoutStartTime = null

// Track page views
window.addEventListener('load', () => {
  pagesVisited++
})

// Track checkout start
function startCheckout() {
  checkoutStartTime = Date.now()
}

function getSessionData() {
  return {
    timeOnSiteSeconds: Math.floor((Date.now() - sessionStart) / 1000),
    pagesVisited: pagesVisited,
    checkoutSpeedSeconds: checkoutStartTime 
      ? Math.floor((Date.now() - checkoutStartTime) / 1000)
      : 0
  }
}
```

---

### Environment Variables

**Backend `.env`:**
```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# PayPal
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
PAYPAL_WEBHOOK_ID=your-webhook-id

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Performance & Scalability

### Benchmarks

- **API Response Time**: 40-60ms (p95)
- **ML Prediction Time**: 30-50ms
- **PayPal API Latency**: 200-400ms
- **Database Queries**: <10ms
- **Redis Cache**: <5ms

### Scaling Recommendations

**For 1,000+ transactions/day:**
- Enable Redis caching
- Use connection pooling
- Add CDN for frontend
- Monitor with Elasticsearch

**For 10,000+ transactions/day:**
- Deploy ML service with GPU (2-3x faster)
- Use PostgreSQL read replicas
- Add load balancer
- Enable horizontal scaling (multiple backend instances)

**For 100,000+ transactions/day:**
- Deploy ML service cluster
- Use Redis Cluster
- PostgreSQL sharding
- Elasticsearch cluster
- Message queue for webhooks (RabbitMQ/Kafka)

---

## Security Considerations

### Data Protection
- JWT tokens for authentication
- bcrypt password hashing
- HTTPS in production
- API rate limiting (100 req/min)
- SQL injection prevention (Drizzle ORM)
- XSS protection (Fastify helmet)

### PCI Compliance
- Never store credit card numbers
- PayPal handles payment processing
- Store only transaction IDs
- Encrypt sensitive data at rest

### Fraud Detection Security
- Webhook signature verification
- IP-based rate limiting
- Device fingerprint validation
- Tor/VPN detection
- Disposable email blocking

---

## Troubleshooting

### Common Issues

**1. ML Service Not Loading**
```bash
# Check if model exists
ls ml/models/production/

# Retrain if missing
cd ml
python scripts/train_model.py
```

**2. PayPal Authentication Failed**
- Verify credentials in `backend/.env`
- Check PayPal mode (sandbox vs. live)
- Regenerate API credentials in PayPal Developer Dashboard

**3. Redis Connection Refused**
```bash
# Start Redis
redis-server

# Check connection
redis-cli ping
```

**4. PostgreSQL Connection Error**
```bash
# Check if running
pg_isready -h localhost -p 5432

# Create database
psql -U postgres
CREATE DATABASE payguard_dev;
```

**5. Elasticsearch Not Available**
```bash
# Start Elasticsearch
cd services/elasticsearch-8.16.0/bin
./elasticsearch.bat

# Check health
curl http://localhost:9200/_cluster/health
```

---

## Monitoring & Logging

### Key Metrics to Track

1. **Fraud Detection Metrics:**
   - False positive rate
   - False negative rate
   - Average risk score
   - Flag distribution

2. **Business Metrics:**
   - Transactions blocked
   - Chargebacks prevented
   - Processing time
   - Revenue protected

3. **System Metrics:**
   - API latency
   - ML service uptime
   - Database query time
   - Cache hit rate

### Logging

```javascript
// Example logs
✅ PayPal access token refreshed
✅ PayPal order created: ORDER_123
✅ ML model loaded successfully
✅ Redis connected
✅ Database connected
⚠️  ML service unavailable - falling back to rules
❌ Failed to capture PayPal order
```

---

## Future Enhancements

### Roadmap

**Phase 1 (Current):**
- ✅ Real-time fraud detection
- ✅ PayPal integration
- ✅ Merchant dashboard
- ✅ ML model with SHAP

**Phase 2 (Planned):**
- Advanced device fingerprinting
- Email verification API
- Behavioral biometrics
- Network graph analysis
- Custom risk rules engine

**Phase 3 (Future):**
- Multi-payment processor support (Stripe, Square)
- Mobile SDK (iOS/Android)
- Advanced analytics dashboard
- A/B testing framework
- White-label solution

---

## Support & Documentation

### Additional Resources

- **API Documentation**: http://localhost:3001/api/v1/docs
- **ML Service Docs**: http://localhost:8000/docs
- **GitHub Repository**: [Your repo URL]
- **Model Training Report**: `ml/PAYGUARD_VESTA_MODEL_REPORT.md`

### Getting Help

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check application logs
4. Contact support team

---

## License

MIT License - see LICENSE file for details

---

**Last Updated**: November 7, 2026  
**Version**: 1.0.0  
**Model Version**: PayGuard Vesta v1
