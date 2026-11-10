# 🛡️ PayGuard AI - Complete Live Transaction Testing & Laptop Setup Guide

This guide provides step-by-step instructions for:
1. **Testing real transactions** using live PayPal Sandbox accounts, pre-capture ML evaluation, and webhooks.
2. **Setting up the entire PayGuard AI project from scratch** on another person's laptop (Windows, macOS, or Linux).

---

## 📋 System Ports & Architecture Reference

| Service | Port / URL | Tech Stack | Role |
| :--- | :--- | :--- | :--- |
| **Frontend Web Console** | `http://localhost:3000` | Next.js 16, React 19, Tailwind v4 | UI Dashboard, tiles, sidebar, live stream |
| **Backend API Gateway** | `http://localhost:3001` | Fastify 5.1, Node.js, TypeScript | Auth, transactions, Drizzle ORM, PayPal SDK |
| **ML Scoring Microservice** | `http://localhost:8000` | FastAPI, Python 3.13, XGBoost, SHAP | Sub-40ms fraud inference & feature impacts |
| **PostgreSQL Database** | `localhost:5432` | PostgreSQL 18 (DB: `payguard_dev`) | Relational multi-tenant persistent storage |
| **Redis Cache** | `localhost:6379` | Redis 5.0 / 7.0 | In-memory token cache & velocity counters |

---

# PART 1: HOW TO TEST LIVE TRANSACTIONS

PayGuard AI sits **between PayPal order creation and final fund capture**. It intercepts fraudulent orders **before capture** so that the merchant never incurs dispute fees or PayPal account holds.

---

### Step 1: Obtain a Sandbox Buyer Account (Personal Account)

PayPal Sandbox creates two types of accounts:
- **Business Account (Merchant)**: Already configured in `backend/.env` with `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`.
- **Personal Account (Buyer)**: Used by you to simulate an actual customer logging into PayPal and paying.

#### How to get your Sandbox Buyer credentials:
1. Log in to [developer.paypal.com](https://developer.paypal.com/).
2. In the left navigation, click **Testing Tools** $\rightarrow$ **Sandbox Accounts**.
3. Locate an account with type **Personal** (e.g. `sb-buyer123@personal.example.com`).
4. Click the three dots `...` next to it $\rightarrow$ **View/Edit Account**.
5. Note the **Email ID** and **System Generated Password**.

---

### Step 2: Test Method A — Instant Automated PayPal API Test

Run the pre-configured PayPal integration test directly from your terminal:

```powershell
npm --prefix backend run test:paypal
```

#### What happens:
1. Contacts `https://api-m.sandbox.paypal.com/v1/oauth2/token` and refreshes OAuth credentials.
2. Calls `POST /v2/checkout/orders` and creates a real PayPal Sandbox order (e.g., `9TN82052ED708460V`).
3. Generates a live PayPal checkout approval link:
   $$\text{\url{https://www.sandbox.paypal.com/checkoutnow?token=<ORDER_ID>}}$$
4. Fetches the live order state back from PayPal and validates the intent is `CAPTURE`.

---

### Step 3: Test Method B — Interactive Web Console Sandbox (UI Test)

1. Start the stack: double-click **`run.bat`** (or run `.\run.bat` in terminal).
2. Open **[http://localhost:3000/login](http://localhost:3000/login)** in your browser.
3. Click the **Demo Electronics** tile (or log in with `demo@payguard.ai` / `Demo123!`).
4. In the left sidebar, click **"Sandbox Order Tester"** (or click **"Simulate Risk"** in the top bar).

#### Test Scenario 1: Legitimate Buyer (Safe Capture)
* **Buyer Email:** `verified.customer@gmail.com`
* **Amount:** `85.00`
* **Result:** **GREEN (Score ~5% - 18%)**
* **Verdict:** `INSTANT CAPTURE (NO FRICTION)`
* **TreeSHAP Drivers:** `Residential ISP Verified (-11.2%)`, `Corporate/Consumer Email (-14.0%)`.

#### Test Scenario 2: Hostile Bot Attack (Pre-Capture Interception)
* **Buyer Email:** `botnet_surge_42@tempmail.ninja`
* **Amount:** `3400.00`
* **Result:** **RED (Score ~94% - 99%)**
* **Verdict:** `VOID AUTHORIZATION (FREEZE PREVENTED)`
* **Pre-Capture Interception:** The order is instantly marked `FAILED`. No funds are captured, preventing chargeback liability.

---

### Step 4: Test Method C — Full End-to-End Live PayPal Checkout Flow

To simulate a complete customer journey with real PayPal popup checkout:

#### 1. Create a Transaction via Backend API:
```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer <MERCHANT_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "sb-buyer@personal.example.com",
    "amount": 149.99,
    "currency": "USD",
    "deviceData": {
      "ipAddress": "72.14.201.88",
      "deviceId": "dev_shopper_01",
      "vpnDetected": false
    },
    "sessionData": {
      "timeOnSiteSeconds": 115,
      "checkoutSpeedSeconds": 24,
      "pagesVisited": 3
    }
  }'
```

#### 2. Open the PayPal Approval URL:
Copy the `approveUrl` returned in the JSON response:
```
https://www.sandbox.paypal.com/checkoutnow?token=...
```
Open it in an incognito window, log in using your **Personal Sandbox Buyer** account, and click **"Complete Purchase"**.

#### 3. Capture Payment (Pre-Authorization Verified):
```bash
curl -X POST http://localhost:3001/api/v1/transactions/<TRANSACTION_ID>/capture \
  -H "Authorization: Bearer <MERCHANT_JWT_TOKEN>"
```
The transaction transitions to `COMPLETED`, the funds are settled in your merchant sandbox balance, and the PayPal capture ID is saved.

---

### Step 5: Test Method D — PayPal Webhook Simulation

PayGuard includes a webhook listener at `POST /api/v1/webhook` that updates order statuses and records dispute notifications.

#### 1. Expose port 3001 with ngrok:
```powershell
ngrok http 3001
```
*Note your public URL: `https://abcd-123.ngrok-free.app`.*

#### 2. Register Webhook in PayPal Developer Portal:
1. Go to [developer.paypal.com](https://developer.paypal.com/) $\rightarrow$ **Apps & Credentials** $\rightarrow$ Sandbox App.
2. Scroll to **Webhooks** $\rightarrow$ Click **Add Webhook**.
3. URL: `https://abcd-123.ngrok-free.app/api/v1/webhook`
4. Select events:
   - `Checkout order approved`
   - `Payment capture completed`
   - `Payment capture denied`
   - `Payment capture refunded`
   - `Customer dispute created`
5. Save and copy the **Webhook ID**.
6. Paste the ID in `backend/.env`:
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

#### 3. Trigger Test Event via Webhook Simulator:
1. In PayPal Developer Portal, go to **Testing Tools** $\rightarrow$ **Webhook Simulator**.
2. **Webhook URL:** `https://abcd-123.ngrok-free.app/api/v1/webhook`
3. **Event Type:** `Payment capture completed`
4. Click **Send Test**.
5. Terminal output in the Fastify window will confirm:
   ```
   [INFO] ✅ POST /api/v1/webhook - 200 (12ms)
   ✅ Webhook processed: PAYMENT.CAPTURE.COMPLETED (WH-...)
   ```

---

# PART 2: COMPLETE SETUP ON ANOTHER PERSON'S LAPTOP

Follow these instructions to install, configure, and launch the complete stack on a new laptop from scratch.

---

### Step 1: System Prerequisites (What to Install)

Ensure the following tools are installed on the target machine:

#### 1. Node.js (v20 or v22 LTS)
* **Download:** [https://nodejs.org/](https://nodejs.org/) (Select LTS)
* **Verify:**
  ```powershell
  node --version   # Should show v20.x or v22.x
  npm --version    # Should show v10.x
  ```

#### 2. Python (v3.11, v3.12, or v3.13)
* **Download:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
* ⚠️ **Important (Windows):** Check the box **"Add Python to PATH"** during installation!
* **Verify:**
  ```powershell
  python --version   # Should show Python 3.11+
  pip --version
  ```

#### 3. PostgreSQL (v16, v17, or v18)
* **Download (Windows):** [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
* **Download (macOS):** `brew install postgresql@16 && brew services start postgresql@16`
* **Download (Linux):** `sudo apt install postgresql postgresql-contrib`
* Default superuser password during install: Set to `dev_password` (or remember what you set).

#### 4. Redis (v5.0 or v7.0)
* **Windows (Native):** Download Redis Windows release from [Microsoft Archive Releases](https://github.com/microsoftarchive/redis/releases) or use [Redis-for-Windows](https://github.com/zkteco-home/redis-windows).
* **macOS:** `brew install redis && brew services start redis`
* **Linux:** `sudo apt install redis-server && sudo systemctl start redis`

#### 5. Git
* **Download:** [https://git-scm.com/](https://git-scm.com/)

---

### Step 2: Clone or Copy Project Files

Open terminal/PowerShell in your preferred folder:
```powershell
git clone <YOUR_REPO_URL> paypal_dev
cd paypal_dev
```

---

### Step 3: Set Up PostgreSQL Database

1. Open PowerShell / Command Prompt and connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
2. Run the following SQL commands to create the user and database:
   ```sql
   CREATE USER payguard WITH PASSWORD 'dev_password';
   CREATE DATABASE payguard_dev OWNER payguard;
   GRANT ALL PRIVILEGES ON DATABASE payguard_dev TO payguard;
   \q
   ```
3. Test connection:
   ```powershell
   # Windows:
   & "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h localhost -p 5432
   # macOS/Linux:
   pg_isready -h localhost -p 5432
   ```

---

### Step 4: Install Dependencies

#### 1. Backend Dependencies:
```powershell
cd backend
npm install
cd ..
```

#### 2. Frontend Dependencies:
```powershell
cd frontend
npm install
cd ..
```

#### 3. Python ML Dependencies:
```powershell
cd ml
pip install -r requirements.txt
cd ..
```

*(Note: If you prefer a Python virtual environment, run `python -m venv venv`, activate it via `.\venv\Scripts\Activate.ps1`, then run `pip install -r requirements.txt`).*

---

### Step 5: Configure Environment Variables

#### 1. Backend Environment (`backend/.env`):
Create `backend/.env` (or copy from `backend/.env.example`):
```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch (Optional)
ELASTIC_NODE=http://localhost:9200

# PayPal Sandbox Credentials
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AVZzjOwIAmD__O8U8Bsk0DjyjaCCgV0GVvrcUYf-IGlZxFF6xrdz6qyPnVySVEqAaQeVlEDlNyZlsVQu
PAYPAL_SECRET=EDMb3HkVNfP3z7Z04DKsRuOiLhi1C8197r0YHbabv2Hwa2-DTUrIOQ6IEUsjgom7pJJ9DDotGLEQkYXt
PAYPAL_WEBHOOK_ID=

# Security Keys
JWT_SECRET=kX9vR2mN8pL4wQ7sY6tH1uJ3oK5iP0aZ2bC4dE6fG8hI9jM
API_KEY_SALT=nT8xW1yU4zV7cB9mL2oP5qR3sN6tH0kJ4iF8gD1eA7wX

# ML Microservice URL
ML_SERVICE_URL=http://localhost:8000
```

#### 2. Frontend Environment (`frontend/.env.local`):
Create `frontend/.env.local` (or copy from `frontend/.env.local.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

---

### Step 6: Initialize & Seed Database

Generate database tables and populate the 6 merchants with 64 historical transactions:

```powershell
npm --prefix backend run db:seed
```

#### Expected output:
```
🌱 Starting comprehensive multi-user database seed...
👥 Inserting 6 diverse merchants...
📦 Generating 64 realistic transactions and ML risk evaluations...
✅ Database seeding successfully finished!
📊 Statistics:
  - Total Merchants: 6
  - Total Transactions: 64
  - 🟢 Low Risk (GREEN - Captured): 47
  - 🟡 Medium Risk (YELLOW - Review/Auth): 4
  - 🔴 High Risk (RED - Pre-Capture Intercepted): 13
```

---

### Step 7: Launch the Application

#### On Windows (Single 1-Click Script):
Simply double-click:
```cmd
run.bat
```
*(Or in PowerShell: `.\run.bat`)*

#### On macOS / Linux:
Run each service in separate terminal tabs:
```bash
# Tab 1: ML Microservice
cd ml/src/api && python3 -m uvicorn main:app --port 8000

# Tab 2: Backend API
cd backend && npm run dev

# Tab 3: Frontend Dashboard
cd frontend && npm run dev
```

---

### Step 8: Verify System Health

1. **Frontend App:** Open [http://localhost:3000](http://localhost:3000) (or `/login`).
2. **Backend Health Check:** [http://localhost:3001/health](http://localhost:3001/health) $\rightarrow$ Returns `{"status":"healthy","services":{"database":"up","redis":"up"}}`.
3. **ML Health & Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) $\rightarrow$ Interactive Swagger UI with loaded XGBoost model.
4. **Run Blackbox Suite (18 tests):**
   ```powershell
   npm --prefix backend run test:blackbox
   ```
   *(All 18 tests will pass with 100% success).*
5. **Run Live PayPal Sandbox Test:**
   ```powershell
   npm --prefix backend run test:paypal
   ```

---

## 🔑 Demo Login Accounts

| Merchant Workspace | Email | Password | Store Type |
| :--- | :--- | :--- | :--- |
| **Demo Electronics** | `demo@payguard.ai` | `Demo123!` | High Volume Tech ($45 – $4.2K) |
| **Nova Retail** | `test@example.com` | `Test123!` | Fashion & Sneaker Drops |
| **Luxury Palace** | `fashion@luxurypalace.com` | `Luxury123!` | Haute Couture & Watches ($5K+) |
| **GameVault Digital** | `support@gamingvouchers.io` | `Gaming123!` | Gaming Keys & Carding Bot Defense |
| **EcoBean Coffee** | `orders@ecocoffee.co` | `Coffee123!` | Specialty Subscriptions (98% Safe) |
| **CloudStack SaaS** | `dev@cloudstack.net` | `Cloud123!` | Developer Infrastructure Tier |

---

## 🛑 How to Stop Everything Cleanly

When finished testing, run:
```cmd
.\stop-all.bat
```
This safely stops ports 3000, 3001, 8000, Redis, and PostgreSQL with zero orphaned processes.

