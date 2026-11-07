# 📥 PayGuard AI - Complete Download & Installation Guide

This document lists **everything you need to download and install** to run PayGuard AI (Backend, ML Fraud Engine, and Frontend) on Windows.

---

## 🛠️ 1. Essential Software to Download

| Software | Required Version | Download Link | Purpose |
| :--- | :--- | :--- | :--- |
| **Docker Desktop for Windows** | Latest | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs PostgreSQL 17, Redis 7.4, and Elasticsearch 8.16 in 1 command |
| **Node.js** | LTS (v22+ or v24+) | [Download Node.js](https://nodejs.org/) | Runs the Fastify Backend API and Next.js Frontend |
| **Python** | 3.10 - 3.13 | [Download Python](https://www.python.org/downloads/) | Runs the FastAPI ML inference engine and fraud model |
| **Git for Windows** | Latest | [Download Git](https://git-scm.com/download/win) | Version control and Git Bash terminal |
| **PayPal Developer Account** | Free Sandbox | [PayPal Developer Portal](https://developer.paypal.com/) | Provides Sandbox Client ID & Secret for payments |

> [!TIP]
> **Docker Desktop is the fastest path**: Instead of installing PostgreSQL, Redis, and Elasticsearch manually as separate Windows services, Docker runs all three with `docker compose up -d`. Make sure Docker Desktop is started before running the database commands.

---

## 📦 2. What to Install / Download per Service

### A. Backend Services (Docker)
Open PowerShell or Git Bash in `d:\paypal_dev` and start the backing infrastructure:
```powershell
# 1. Start Docker containers (PostgreSQL 17, Redis 7.4, Elasticsearch 8.16)
docker compose up -d

# 2. Verify all 3 containers are healthy
docker ps
```

---

### B. Backend API (Node.js & Fastify)
The backend is now fully repaired and configured.

```powershell
cd d:\paypal_dev\backend

# 1. Install Node dependencies (if not already installed)
npm install

# 2. Run Database Migrations
npm run db:migrate

# 3. Seed Database with demo accounts & sample transactions
npm run db:seed

# 4. Verify PayPal Sandbox connection
npm run test:paypal

# 5. Start Backend Development Server (Port 3001)
npm run dev
```

---

### C. ML Fraud Detection Service (Python & FastAPI)

```powershell
cd d:\paypal_dev\ml

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Start ML FastAPI service (Port 8000)
cd src\api
python -m uvicorn main:app --reload --port 8000
```

---

### D. Frontend Dashboard (Next.js & React)

```powershell
cd d:\paypal_dev\frontend

# 1. Install Frontend dependencies
npm install

# 2. Start Frontend Development Server (Port 3000)
npm run dev
```

---

## 🧪 3. Verification & Access URLs

Once the services are running, verify each endpoint in your browser:

| Component | URL | Expected Response / Screen |
| :--- | :--- | :--- |
| **Backend API Health** | `http://localhost:3001/health` | `{"status":"healthy","services":{"database":"up","redis":"up","elasticsearch":"up"}}` |
| **Backend Root** | `http://localhost:3001/` | PayGuard API metadata & routes |
| **ML Service Docs** | `http://localhost:8000/docs` | Interactive FastAPI Swagger documentation |
| **ML Health Check** | `http://localhost:8000/health` | `{"status":"healthy","model_loaded":true}` |
| **Frontend Dashboard** | `http://localhost:3000` | PayGuard AI Merchant Web Portal |

---

## 🔑 4. Demo Login Credentials

Once `npm run db:seed` is executed in `backend`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Merchant** | `demo@payguard.ai` | `Demo123!` |
| **Test Store** | `test@example.com` | `Test123!` |

*(An API Key starting with `pk_...` will also be output in your console upon seeding)*.

---

## 💡 5. Local Standalone Services (Your Configured Setups)

Your local setups in `D:\setups` and `C:\Program Files` have been configured:

1. **Redis (Installed via MSI)**:
   - Installed location: `C:\Program Files\Redis\`
   - Default port: `6379` (matches `REDIS_URL=redis://localhost:6379`)
   - Quick start: Double-click [start-redis.bat](file:///d:/paypal_dev/start-redis.bat) or run:
     ```powershell
     & "C:\Program Files\Redis\redis-server.exe" "C:\Program Files\Redis\redis.windows.conf"
     ```

2. **Elasticsearch 9.5.6 (Configured in D:\setups)**:
   - Location: `D:\setups\elasticsearch-9.5.6-windows-x86_64\elasticsearch-9.5.6\`
   - Configuration updated in `config/elasticsearch.yml`:
     - `http.port: 9200` (matches `ELASTIC_NODE=http://localhost:9200`)
     - `discovery.type: single-node`
     - `xpack.security.enabled: false` (allows plain HTTP connection without auth certificates)
     - `jvm.options.d/heap.options`: Allocated 1 GB heap for smooth local development.
   - Quick start: Double-click [start-elasticsearch.bat](file:///d:/paypal_dev/start-elasticsearch.bat) or run:
     ```powershell
     & "D:\setups\elasticsearch-9.5.6-windows-x86_64\elasticsearch-9.5.6\bin\elasticsearch.bat"
     ```

3. **PostgreSQL 17**:
   - Official installer is ready: [downloads/postgresql-17.2-1-windows-x64.exe](file:///d:/paypal_dev/downloads/postgresql-17.2-1-windows-x64.exe)
   - Setup configuration:
     - Port: `5432`
     - Password: `dev_password`
     - Database: `payguard_dev` (create via `psql` or pgAdmin)

4. **One-Click Master Startup Script**:
   - Run [start-all.ps1](file:///d:/paypal_dev/start-all.ps1) in PowerShell to launch Redis, Elasticsearch, the ML Service, and the Backend API automatically in dedicated windows.

