# PayGuard AI 🛡️

**Pre-Capture Risk Intelligence & Chargeback Prevention Platform for PayPal Merchants**

PayGuard AI is a production-ready fraud detection system that evaluates transactions in **<40ms** using XGBoost machine learning, preventing chargebacks before PayPal captures funds. Built with Next.js, TypeScript, FastAPI, and trained on 590,000 real fraud transactions.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 What It Does

- **Real-Time Fraud Detection**: Analyzes transactions in under 40ms before PayPal captures payment
- **AI-Powered Risk Scoring**: XGBoost model trained on 590K IEEE-CIS fraud transactions (89.98% AUC-ROC)
- **Explainable AI**: SHAP values show exactly why each transaction was scored
- **Multi-Tenant Architecture**: Support for unlimited merchants with isolated data
- **Live PayPal Integration**: Full sandbox and production PayPal API integration
- **Automated Prevention**: Blocks high-risk orders before capture, saving $20+ per chargeback

---

## 🏗️ Architecture

```
                    ┌────────────────────────────────────────┐
                    │   Next.js 16 Web Console (Port 3000)  │
                    │  (React 19, Tailwind v4, Recharts)    │
                    └──────────────────┬─────────────────────┘
                                       │ (HTTP / WebSocket)
                                       ▼
                    ┌────────────────────────────────────────┐
                    │  Fastify 5.1 API Gateway (Port 3001)  │
                    │    (Node.js 22, TypeScript, Drizzle)  │
                    └──────────────────┬─────────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Python ML Service    │    │  PostgreSQL 18 DB    │    │    Redis 5 Cache     │
│ (FastAPI - Port 8000)│    │     (Port 5432)      │    │     (Port 6379)      │
│ XGBoost 2.1.2 + SHAP │    │ Multi-Tenant Storage │    │ Velocity & Sessions  │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

---

## ✨ Key Features

### Frontend Dashboard
- 🎨 **Modern UI**: Next.js 16 with React 19, Tailwind CSS v4
- 📊 **Real-Time Analytics**: Live transaction feed with Recharts visualizations
- 🔍 **Risk Simulator**: Interactive lab for testing fraud detection parameters
- 👥 **Multi-Merchant**: 1-click switching between merchant accounts
- 📱 **Responsive**: Mobile-first design with collapsible navigation
- 🎯 **Order Inspector**: Detailed risk breakdown with SHAP explanations

### Backend API
- ⚡ **Fast**: Fastify 5.1 with sub-40ms response times
- 🔐 **Secure**: JWT authentication, bcrypt hashing, API key management
- 💾 **Scalable**: PostgreSQL with Drizzle ORM, Redis caching
- 🔗 **PayPal Ready**: Full v2 Checkout API integration with webhook support
- 🛡️ **Pre-Capture Protection**: Auto-blocks high-risk orders before capture
- 📝 **Well-Tested**: 100% passing blackbox integration tests

### ML Engine
- 🤖 **XGBoost 2.1.2**: Production model with 89.98% AUC-ROC
- 📈 **120 Features**: IEEE-CIS Vesta feature engineering
- 💡 **Explainable**: Real-time SHAP TreeExplainer for transparency
- 🎯 **Calibrated Thresholds**:
  - 🟢 **GREEN (<35%)**: Instant approval
  - 🟡 **YELLOW (35-69%)**: Manual review
  - 🔴 **RED (≥70%)**: Auto-block

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **Python** 3.13+ ([Download](https://www.python.org/))
- **PostgreSQL** 18+ ([Download](https://www.postgresql.org/download/))
- **Redis** 5+ ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Shivam1981-leo/Paypal_dev.git
cd Paypal_dev
```

2. **Install dependencies**
```bash
# ML Service
cd ml
pip install -r requirements.txt
cd ..

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

3. **Configure environment**
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend configuration
cp frontend/.env.local.example frontend/.env.local
```

4. **Setup database**
```bash
# Create database
psql -U postgres
CREATE DATABASE payguard_dev;
CREATE USER payguard WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE payguard_dev TO payguard;
\q

# Run migrations
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### Start All Services (Windows)

**Option 1: One-Click Start**
```cmd
.\run.bat
```

**Option 2: Manual Start**
```bash
# Terminal 1 - ML Service (Port 8000)
cd ml/src/api
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Backend API (Port 3001)
cd backend
npm run dev

# Terminal 3 - Frontend (Port 3000)
cd frontend
npm run dev
```

### Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/v1/docs
- **ML Service**: http://localhost:8000
- **ML Docs**: http://localhost:8000/docs

---

## 👥 Demo Accounts

The system comes pre-seeded with 6 demo merchants and 64 sample transactions:

| Merchant | Email | Password | Industry |
|----------|-------|----------|----------|
| **Demo Merchant** | `demo@payguard.ai` | `Demo123!` | Consumer Electronics |
| **Nova Retail** | `test@example.com` | `Test123!` | Fashion & Apparel |
| **Luxury Palace** | `fashion@luxurypalace.com` | `Luxury123!` | Haute Couture |
| **GameVault Digital** | `support@gamingvouchers.io` | `Gaming123!` | Gaming Keys |
| **EcoBean Roasters** | `orders@ecocoffee.co` | `Coffee123!` | Specialty Coffee |
| **CloudStack SaaS** | `dev@cloudstack.net` | `Cloud123!` | Developer Tools |

---

## 🧪 Testing

### Run Blackbox Integration Tests
```bash
cd backend
npm run test:blackbox
```

**Expected Output:**
```
📊 BLACKBOX TEST SUMMARY REPORT
Total Scenarios Executed: 18
Passed:                   18
Failed:                   0
Success Rate:             100.0%
```

### Test PayPal Integration
```bash
cd backend
npm run test:paypal
```

### Test ML Model
```bash
cd ml
pytest tests/
```

---

## 📦 Project Structure

```
paypal_dev/
├── frontend/              # Next.js 16 dashboard
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API client
│   │   └── types/        # TypeScript definitions
│   └── package.json
│
├── backend/              # Fastify API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth & error handling
│   │   ├── db/           # Database schema & migrations
│   │   └── config/       # Configuration
│   ├── scripts/          # Seed & test scripts
│   └── package.json
│
├── ml/                   # Python ML service
│   ├── src/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── models/       # XGBoost model
│   │   ├── features/     # Feature engineering
│   │   └── utils/        # Helpers
│   ├── models/           # Trained model files
│   │   └── production/
│   │       └── payguard_vesta_v1/
│   ├── scripts/          # Training scripts
│   └── requirements.txt
│
├── docs/                 # Documentation
├── docker-compose.yml    # Docker services
└── README.md            # This file
```

---

## 🔧 Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev

# Redis
REDIS_URL=redis://localhost:6379

# ML Service
ML_SERVICE_URL=http://localhost:8000

# PayPal (Sandbox)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
```

### Frontend Environment Variables

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📊 Model Performance

- **Dataset**: IEEE-CIS Fraud Detection (590,000 transactions)
- **Model**: XGBoost 2.1.2
- **AUC-ROC**: 89.98%
- **False Positive Rate**: 5%
- **Recall**: 60.43%
- **Inference Time**: <40ms
- **Features**: 120 engineered vectors
- **Training Date**: November 2026

---

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run test         # Run unit tests
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:seed      # Seed database
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### ML Development
```bash
cd ml
python -m uvicorn src.api.main:app --reload  # Start with hot reload
python scripts/train_payguard_model.py       # Train model
pytest tests/                                 # Run tests
```

---

## 🐳 Docker Deployment

Start all infrastructure services:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (Port 5432)
- Redis (Port 6379)
- Elasticsearch (Port 9200)

---

## 📚 Documentation

- **[Start Here Guide](START_HERE.md)** - New user onboarding
- **[Quick Start](QUICK_START.md)** - Fast setup guide
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed installation
- **[Integration Guide](INTEGRATION_GUIDE.md)** - PayPal integration
- **[Testing Guide](backend/TESTING_GUIDE.md)** - Testing strategies
- **[ML Model Report](ml/PAYGUARD_VESTA_MODEL_REPORT.md)** - Model details
- **[Live Transaction Testing](LIVE_TRANSACTION_TESTING_AND_SETUP_GUIDE.md)** - Production testing
- **[Project Status](PROJECT_STATUS.md)** - Implementation status

---

## 🔒 Security

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ API key management (pk_live_...)
- ✅ Rate limiting with Redis
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ PayPal webhook signature verification

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update PayPal credentials (switch from sandbox to live)
- [ ] Configure production database URL
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domains
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Enable rate limiting
- [ ] Backup database regularly
- [ ] Set up CI/CD pipeline

### Recommended Stack

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: AWS EC2, DigitalOcean, or Railway
- **Database**: AWS RDS, Supabase, or PlanetScale
- **Redis**: Redis Cloud, Upstash, or AWS ElastiCache
- **ML Service**: AWS EC2 with GPU, or dedicated ML hosting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **IEEE-CIS Fraud Detection Dataset** - Vesta Corporation
- **XGBoost** - Distributed gradient boosting library
- **SHAP** - Explainable AI framework
- **PayPal Developer Platform** - Payment integration
- **Anthropic Claude** - Development assistance

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Shivam1981-leo/Paypal_dev/issues)
- **Email**: support@payguard.ai
- **Documentation**: See the [docs/](docs/) folder

---

## 🎉 What's Next?

- [ ] Add 3D Secure (SCA) integration
- [ ] Implement real-time alert webhooks
- [ ] Add dispute management dashboard
- [ ] Create mobile app (React Native)
- [ ] Add multi-currency support
- [ ] Implement A/B testing framework
- [ ] Add Stripe integration
- [ ] Build analytics API

---

**Built with ❤️ by the PayGuard AI Team**

*Last Updated: November 10, 2026*
