# PayGuard AI - Quick Start Guide

## Prerequisites

Before starting, ensure you have:
- Python 3.8+ installed
- Node.js 22+ installed
- Git Bash or WSL (for running shell scripts)

## Setup & Installation

### 1. Install Dependencies

**ML Service:**
```bash
cd ml
pip install -r requirements.txt
cd ..
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 2. Start Services

#### Start ML Service (Port 8000)
```bash
cd ml/src/api
python -m uvicorn main:app --reload --port 8000
```

#### Start Backend (Port 3001)
Open a new terminal:
```bash
cd backend
npm run dev
```

#### Start Frontend (Port 3000)
Open another terminal:
```bash
cd frontend
npm run dev
```

## Access the Application

Once all services are running:

- **Frontend Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/v1/docs
- **ML Service:** http://localhost:8000
- **ML Service Docs:** http://localhost:8000/docs

## Default Test Credentials

```
Email: demo@example.com
Password: demo123
```

Or register a new account at http://localhost:3000/register

## Testing the Fraud Detection

1. Navigate to http://localhost:3000
2. Click "Get Started" or "Login"
3. After login, go to Dashboard
4. Click "Test Risk Check"
5. Enter transaction details:
   - Buyer Email: test@example.com
   - Amount: 500.00
   - Device ID: device_test_001
   - IP Address: 192.168.1.1
6. Click "Analyze Transaction"

## Expected Results

- **GREEN (Low Risk):** Risk score < 40% → Proceed with PayPal
- **YELLOW (Medium Risk):** Risk score 40-70% → Manual review
- **RED (High Risk):** Risk score > 70% → Block transaction

## Model Information

- **Model:** PayGuard Vesta v1
- **Dataset:** IEEE-CIS Fraud Detection (590K transactions)
- **Performance:** 89.98% AUC-ROC, 5% FPR, 60.43% recall
- **Features:** 120 engineered features
- **Inference Time:** < 50ms per transaction

## Troubleshooting

### ML Service Won't Start
```bash
# Check if port 8000 is already in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /F /PID <process_id>
```

### Backend Connection Issues
- Ensure `backend/.env` has `ML_SERVICE_URL=http://localhost:8000`
- Check if ML service is running: `curl http://localhost:8000/health`

### Frontend Not Connecting
- Verify `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- Clear browser cache and reload

## Architecture

```
┌──────────────┐     HTTP      ┌──────────────┐
│   Frontend   │──────────────→│   Backend    │
│   Next.js    │               │   Fastify    │
│  Port 3000   │               │  Port 3001   │
└──────────────┘               └──────┬───────┘
                                      │
                                      │ HTTP
                                      ↓
                               ┌──────────────┐
                               │  ML Service  │
                               │  FastAPI     │
                               │  Port 8000   │
                               └──────────────┘
```

## What's Integrated

✅ ML Model trained on real Vesta fraud data  
✅ Backend API with risk check endpoints  
✅ Frontend dashboard with transaction analysis  
✅ Real-time fraud detection with SHAP explanations  
✅ Risk categorization (GREEN/YELLOW/RED)  
✅ Feature importance visualization  

## Next Steps

1. **Test the full flow** - Create transactions and analyze them
2. **Review the API docs** - http://localhost:3001/api/v1/docs
3. **Check model performance** - View feature importance in results
4. **Integrate with PayPal** - Add real PayPal credentials in backend/.env

For more details, see:
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Model Training Report](./ml/PAYGUARD_VESTA_MODEL_REPORT.md)
