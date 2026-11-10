# PayGuard AI - Developer Task Assignments (2026 Latest Stack)

**Project Duration:** 8 weeks (November 4 - December 27, 2026)  
**Team Size:** 4 developers  
**Created:** November 4, 2026  
**Tech Stack:** Latest November 2026 frameworks and libraries

---

## 🚀 2026 Technology Stack (Latest Versions - November 2026)

### Frontend Stack
```json
{
  "framework": "Next.js 15.1.0 (React 19, App Router, Server Components)",
  "runtime": "Node.js 22.11.0 LTS",
  "typescript": "5.7.0",
  "styling": "Tailwind CSS 4.0.0 (CSS-first configuration)",
  "ui": "Radix UI 1.12 + shadcn/ui (latest 2026)",
  "stateManagement": "Zustand 5.0.0 (with React 19 optimizations)",
  "dataFetching": "TanStack Query 5.60.0 (React Query)",
  "forms": "React Hook Form 7.53.0 + Zod 3.24.0",
  "dataGrid": "AG Grid 32.3.0 (2026 Enterprise)",
  "charts": "Chart.js 4.5.0 + react-chartjs-2 6.0.0",
  "timeline": "Bryntum Scheduler 6.1.0 (2026 version)",
  "realtime": "Socket.io-client 4.8.0",
  "http": "Axios 1.8.0",
  "dates": "date-fns 4.1.0",
  "testing": "Vitest 2.1.0 + Playwright 1.49.0"
}
```

### Backend Stack
```json
{
  "runtime": "Node.js 22.11.0 LTS",
  "framework": "Fastify 5.1.0 (fastest Node.js framework 2026)",
  "typescript": "5.7.0",
  "orm": "Drizzle ORM 0.38.0 (fastest TypeScript ORM 2026)",
  "validation": "Zod 3.24.0",
  "auth": "Lucia 4.0.0 (modern session management)",
  "jwt": "@fastify/jwt 9.0.0",
  "websocket": "Socket.io 4.8.0",
  "redis": "ioredis 5.4.0",
  "elasticsearch": "@elastic/elasticsearch 8.16.0",
  "testing": "Vitest 2.1.0 + Supertest 7.0.0",
  "apiDocs": "Scalar 2.0 (modern OpenAPI UI)"
}
```

### ML/AI Stack
```json
{
  "python": "3.12.7 (latest stable November 2026)",
  "ml": "XGBoost 2.1.2",
  "dataProcessing": "Polars 1.15.0 (faster than pandas)",
  "deepLearning": "TensorFlow 2.18.0 / PyTorch 2.5.0",
  "serving": "FastAPI 0.115.0",
  "inference": "ONNX Runtime 1.20.0 + TensorFlow.js 4.23.0",
  "explainability": "SHAP 0.46.0",
  "monitoring": "MLflow 2.18.0"
}
```

### Infrastructure
```json
{
  "database": "PostgreSQL 17.1 (released 2026)",
  "cache": "Redis 7.4.1",
  "search": "Elasticsearch 8.16.0",
  "container": "Docker 27.3.0",
  "deployment": "Render (2026 platform)",
  "monitoring": "OpenTelemetry 1.31 + Elastic APM 8.16",
  "cicd": "GitHub Actions (2026)"
}
```

---

## Team Structure & Responsibilities

### 👨‍💻 Developer 1: Backend Lead (API & PayPal Integration)
**Tech:** Fastify 5.1, Drizzle ORM, Lucia Auth, Socket.io  
**Focus:** PayPal APIs, webhooks, REST endpoints, real-time connections

### 🎨 Developer 2: Frontend Lead (Dashboard & UI)
**Tech:** Next.js 15.1, React 19, Tailwind 4.0, AG Grid 32.3  
**Focus:** Merchant dashboard, visualizations, responsive UI

### 🤖 Developer 3: ML Engineer (AI Risk Engine)
**Tech:** Python 3.12, XGBoost 2.1, Polars 1.15, FastAPI 0.115  
**Focus:** Model training, feature engineering, inference API

### 🔧 Developer 4: Full-Stack Integration (DevOps & Glue)
**Tech:** Docker, PostgreSQL 17, Redis 7.4, Elastic 8.16  
**Focus:** Infrastructure, DB, CI/CD, **frontend-backend integration**

---

## Week 1: Pre-Development Setup & Infrastructure

### Developer 1: Backend Lead - PayPal & Backend Init
**Days 1-2: PayPal Sandbox Setup**
- [ ] Create PayPal Developer account at developer.paypal.com
- [ ] Generate sandbox credentials:
  - Client ID and Secret
  - Create 5 test buyer accounts
  - Create 3 test merchant accounts
- [ ] Test OAuth 2.0 flow manually with cURL:
  ```bash
  curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
    -H "Authorization: Basic BASE64(CLIENT_ID:SECRET)" \
    -d "grant_type=client_credentials"
  ```
- [ ] Test JavaScript SDK v6 in browser console
- [ ] Document sandbox credentials in `.env.example`

**Days 3-4: Backend Project Initialization (Fastify 5.1 + TypeScript 5.7)**
- [ ] Initialize backend project with latest tools:
  ```bash
  mkdir backend && cd backend
  npm init -y
  npm install fastify@5.1.0 @fastify/cors@10.0.0 @fastify/jwt@9.0.0
  npm install @fastify/websocket@11.0.0 @fastify/rate-limit@10.0.0
  npm install drizzle-orm@0.38.0 drizzle-kit@0.27.0
  npm install ioredis@5.4.0 @elastic/elasticsearch@8.16.0
  npm install zod@3.24.0 lucia@4.0.0
  npm install -D typescript@5.7.0 @types/node tsx vitest@2.1.0
  npm install -D @scalar/fastify-api-reference@2.0.0
  ```
- [ ] Configure TypeScript 5.7 with strict mode:
  ```json
  {
    "compilerOptions": {
      "target": "ES2023",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "skipLibCheck": true
    }
  }
  ```
- [ ] Set up project structure:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   │   ├── database.ts
  │   │   ├── redis.ts
  │   │   └── elastic.ts
  │   ├── services/
  │   │   ├── paypal.service.ts
  │   │   ├── risk-engine.service.ts
  │   │   ├── auth.service.ts
  │   │   └── webhook.service.ts
  │   ├── routes/
  │   │   ├── auth.routes.ts
  │   │   ├── merchants.routes.ts
  │   │   ├── transactions.routes.ts
  │   │   └── risk-check.routes.ts
  │   ├── db/
  │   │   ├── schema.ts (Drizzle schema)
  │   │   └── migrations/
  │   ├── middleware/
  │   │   ├── auth.middleware.ts
  │   │   └── error.middleware.ts
  │   ├── types/
  │   ├── utils/
  │   └── server.ts
  ├── tests/
  ├── drizzle.config.ts
  ├── package.json
  └── tsconfig.json
  ```
- [ ] Create Fastify server with latest plugins:
  ```typescript
  // src/server.ts
  import Fastify from 'fastify'
  import cors from '@fastify/cors'
  import jwt from '@fastify/jwt'
  import rateLimit from '@fastify/rate-limit'
  import apiReference from '@scalar/fastify-api-reference'
  
  const fastify = Fastify({ logger: true })
  
  await fastify.register(cors, { origin: true })
  await fastify.register(jwt, { secret: process.env.JWT_SECRET })
  await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await fastify.register(apiReference, {
    routePrefix: '/docs',
    configuration: {
      spec: { url: '/openapi.json' }
    }
  })
  ```

**Days 5-7: Database Schema (Drizzle ORM 0.38)**
- [ ] Install PostgreSQL driver:
  ```bash
  npm install postgres@3.4.4
  ```
- [ ] Define Drizzle schema with PostgreSQL 17 features:
  ```typescript
  // src/db/schema.ts
  import { pgTable, uuid, varchar, timestamp, decimal, jsonb, index } from 'drizzle-orm/pg-core'
  
  export const merchants = pgTable('merchants', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
    industryCategory: varchar('industry_category', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  }, (table) => ({
    emailIdx: index('email_idx').on(table.email),
    apiKeyIdx: index('api_key_idx').on(table.apiKey)
  }))
  
  export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    merchantId: uuid('merchant_id').references(() => merchants.id),
    buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    riskScore: decimal('risk_score', { precision: 3, scale: 2 }),
    riskCategory: varchar('risk_category', { length: 10 }), // GREEN, YELLOW, RED
    status: varchar('status', { length: 20 }), // PENDING, APPROVED, DECLINED
    deviceData: jsonb('device_data'),
    sessionData: jsonb('session_data'),
    cartItems: jsonb('cart_items'),
    paypalOrderId: varchar('paypal_order_id', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow()
  }, (table) => ({
    merchantIdx: index('merchant_idx').on(table.merchantId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
    riskCategoryIdx: index('risk_category_idx').on(table.riskCategory)
  }))
  
  export const riskScores = pgTable('risk_scores', {
    id: uuid('id').primaryKey().defaultRandom(),
    transactionId: uuid('transaction_id').references(() => transactions.id),
    overallScore: decimal('overall_score', { precision: 3, scale: 2 }),
    mlScore: decimal('ml_score', { precision: 3, scale: 2 }),
    patternScore: decimal('pattern_score', { precision: 3, scale: 2 }),
    deviceScore: decimal('device_score', { precision: 3, scale: 2 }),
    flags: jsonb('flags'), // Array of risk flags
    explanation: jsonb('explanation'), // SHAP values
    createdAt: timestamp('created_at').defaultNow()
  })
  ```
- [ ] Configure Drizzle:
  ```typescript
  // drizzle.config.ts
  import { defineConfig } from 'drizzle-kit'
  
  export default defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL!
    }
  })
  ```
- [ ] Create and run migrations:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit migrate
  ```
- [ ] Write ER diagram documentation

---

### Developer 2: Frontend Lead - Next.js 15.1 + React 19
**Days 1-3: Frontend Project Setup (Next.js 15.1)**
- [ ] Initialize Next.js 15.1.0 with React 19:
  ```bash
  npx create-next-app@15.1.0 payguard-frontend \
    --typescript --tailwind --app --turbopack
  cd payguard-frontend
  ```
- [ ] Install November 2026 dependencies:
  ```bash
  # UI & Styling (Latest 2026)
  npm install @radix-ui/themes@3.1.4 tailwindcss@4.0.0
  npm install tailwind-merge@2.6.0 clsx@2.1.1
  npm install lucide-react@0.454.0 # Icon library
  
  # State Management & Data Fetching (Latest 2026)
  npm install zustand@5.0.0
  npm install @tanstack/react-query@5.60.0 axios@1.8.0
  
  # Forms & Validation (Latest 2026)
  npm install react-hook-form@7.53.0 zod@3.24.0
  npm install @hookform/resolvers@3.9.1
  
  # Data Visualization (Latest 2026)
  npm install ag-grid-react@32.3.0 ag-grid-community@32.3.0
  npm install ag-grid-enterprise@32.3.0 # Enterprise features
  npm install chart.js@4.5.0 react-chartjs-2@6.0.0
  npm install @bryntum/scheduler@6.1.0 @bryntum/scheduler-react@6.1.0
  
  # Real-time (Latest 2026)
  npm install socket.io-client@4.8.0
  
  # Utilities (Latest 2026)
  npm install date-fns@4.1.0
  npm install react-hot-toast@2.4.1 # Toast notifications
  
  # Development
  npm install -D @types/node@22.9.0
  npm install -D eslint-config-next@15.1.0
  ```
- [ ] Initialize shadcn/ui (November 2026 version):
  ```bash
  npx shadcn@latest init
  # Select: Next.js 15, TypeScript, Tailwind CSS 4.0, Radix UI
  
  # Add essential components
  npx shadcn@latest add button card input label badge
  npx shadcn@latest add dropdown-menu dialog alert select
  npx shadcn@latest add table tabs toast form sheet
  npx shadcn@latest add avatar separator skeleton
  ```
- [ ] Configure Tailwind CSS 4.0 (CSS-first):
  ```css
  /* app/globals.css */
  @import "tailwindcss";
  
  @theme {
    --color-primary: oklch(0.5 0.2 250);
    --color-risk-green: oklch(0.7 0.15 140);
    --color-risk-yellow: oklch(0.8 0.15 80);
    --color-risk-red: oklch(0.6 0.2 25);
    --radius-base: 0.5rem;
    --font-sans: Inter, system-ui, sans-serif;
  }
  
  @layer utilities {
    .risk-badge-green {
      background: var(--color-risk-green);
    }
    .risk-badge-yellow {
      background: var(--color-risk-yellow);
    }
    .risk-badge-red {
      background: var(--color-risk-red);
    }
  }
  ```
- [ ] Set up project structure with App Router:
  ```
  frontend/
  ├── app/
  │   ├── (auth)/              # Route group - no layout
  │   │   ├── login/
  │   │   │   └── page.tsx
  │   │   └── register/
  │   │       └── page.tsx
  │   ├── (dashboard)/         # Route group - dashboard layout
  │   │   ├── layout.tsx       # Dashboard shell
  │   │   ├── page.tsx         # Main dashboard
  │   │   ├── transactions/
  │   │   │   ├── page.tsx
  │   │   │   └── [id]/
  │   │   │       └── page.tsx
  │   │   ├── analytics/
  │   │   │   └── page.tsx
  │   │   ├── review-queue/
  │   │   │   └── page.tsx
  │   │   └── settings/
  │   │       └── page.tsx
  │   ├── api/                 # API routes for webhooks
  │   ├── layout.tsx           # Root layout
  │   ├── globals.css
  │   └── providers.tsx        # React Query, Zustand providers
  ├── components/
  │   ├── ui/                  # shadcn/ui components
  │   ├── charts/              # Chart.js wrappers
  │   ├── tables/              # AG Grid wrappers
  │   ├── dashboard/           # Dashboard-specific
  │   └── forms/               # Form components
  ├── lib/
  │   ├── api/
  │   │   ├── client.ts        # Axios instance
  │   │   ├── queries.ts       # TanStack Query hooks
  │   │   └── mutations.ts     # TanStack Mutations
  │   ├── socket.ts            # Socket.io client
  │   ├── utils.ts             # Utility functions
  │   └── constants.ts
  ├── hooks/                   # Custom React hooks
  ├── stores/                  # Zustand stores
  ├── types/                   # TypeScript types
  └── public/
  ```

**Days 4-5: Design System & UI Components**
- [ ] Create design tokens file:
  ```typescript
  // lib/design-tokens.ts
  export const tokens = {
    colors: {
      risk: {
        green: { bg: 'oklch(0.7 0.15 140)', text: 'oklch(0.3 0.15 140)' },
        yellow: { bg: 'oklch(0.8 0.15 80)', text: 'oklch(0.4 0.15 80)' },
        red: { bg: 'oklch(0.6 0.2 25)', text: 'oklch(0.2 0.2 25)' }
      }
    },
    spacing: {
      card: '1.5rem',
      section: '2rem'
    }
  }
  ```
- [ ] Build custom components with React 19 features:
  ```typescript
  // components/dashboard/RiskScoreBadge.tsx
  'use client'
  import { Badge } from '@/components/ui/badge'
  import { tokens } from '@/lib/design-tokens'
  
  interface Props {
    score: number
    category: 'GREEN' | 'YELLOW' | 'RED'
  }
  
  export function RiskScoreBadge({ score, category }: Props) {
    const colorClass = `risk-badge-${category.toLowerCase()}`
    return (
      <Badge className={colorClass}>
        {(score * 100).toFixed(0)}% - {category}
      </Badge>
    )
  }
  ```
- [ ] Create loading components with React 19 Suspense:
  ```typescript
  // components/ui/loading-spinner.tsx
  import { Loader2 } from 'lucide-react'
  
  export function LoadingSpinner() {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  ```
- [ ] Build StatCard component for dashboard metrics
- [ ] Create EmptyState component with illustrations
- [ ] Document components in Storybook 8.4 (optional)

**Days 6-7: Authentication UI (React 19 + React Hook Form)**
- [ ] Build login page with latest patterns:
  ```typescript
  // app/(auth)/login/page.tsx
  'use client'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { z } from 'zod'
  import { useTransition } from 'react'
  
  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
  
  type LoginForm = z.infer<typeof loginSchema>
  
  export default function LoginPage() {
    const [isPending, startTransition] = useTransition()
    const form = useForm<LoginForm>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' }
    })
    
    const onSubmit = (data: LoginForm) => {
      startTransition(async () => {
        // Call API
        await loginMutation.mutateAsync(data)
      })
    }
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}
        </form>
      </Form>
    )
  }
  ```
- [ ] Build registration flow with multi-step wizard
- [ ] Create password reset flow with email verification
- [ ] Build merchant onboarding wizard (4 steps):
  - Step 1: Business information
  - Step 2: Industry category selection
  - Step 3: API key generation
  - Step 4: Integration code display
- [ ] Use React 19 useOptimistic for instant UI feedback

---

### Developer 3: ML Engineer - Python 3.12 + XGBoost 2.1
**Days 1-3: ML Environment Setup (Python 3.12.7)**
- [ ] Set up Python 3.12.7 virtual environment:
  ```bash
  python3.12 -m venv venv
  source venv/bin/activate  # Linux/Mac
  # or: venv\Scripts\activate  # Windows
  ```
- [ ] Install November 2026 ML packages:
  ```bash
  # Core ML (Latest 2026)
  pip install xgboost==2.1.2
  pip install scikit-learn==1.6.0
  pip install polars==1.15.0  # Faster than pandas
  pip install numpy==2.2.0
  
  # Deep Learning (Latest 2026)
  pip install tensorflow==2.18.0  # or pytorch==2.5.0
  pip install onnx==1.17.0
  pip install onnxruntime==1.20.0
  pip install skl2onnx==1.18.0
  
  # Explainability (Latest 2026)
  pip install shap==0.46.0
  
  # API Serving (Latest 2026)
  pip install fastapi==0.115.0
  pip install uvicorn[standard]==0.32.0
  pip install pydantic==2.10.0
  
  # Utilities
  pip install python-dotenv==1.0.1
  pip install requests==2.32.3
  
  # Development
  pip install pytest==8.3.0
  pip install jupyter==1.1.1
  ```
- [ ] Set up project structure:
  ```
  ml/
  ├── notebooks/              # Jupyter notebooks
  │   ├── 01_eda.ipynb
  │   ├── 02_feature_engineering.ipynb
  │   └── 03_model_training.ipynb
  ├── src/
  │   ├── features/
  │   │   ├── __init__.py
  │   │   ├── extractor.py
  │   │   └── synthetic_data.py
  │   ├── models/
  │   │   ├── __init__.py
  │   │   ├── trainer.py
  │   │   └── inference.py
  │   ├── api/
  │   │   ├── __init__.py
  │   │   └── main.py       # FastAPI app
  │   ├── evaluation/
  │   │   └── metrics.py
  │   └── utils/
  │       └── config.py
  ├── data/
  │   ├── raw/
  │   ├── processed/
  │   └── synthetic/
  ├── models/                # Saved models
  │   ├── v1/
  │   └── production/
  ├── tests/
  ├── requirements.txt
  └── pyproject.toml
  ```
- [ ] Configure Jupyter for experimentation

**Days 4-5: Synthetic Data Generation (Polars 1.15)**
- [ ] Install additional dependencies:
  ```bash
  pip install faker==31.2.0  # Generate fake data
  pip install scipy==1.14.0  # Statistical distributions
  ```
- [ ] Create synthetic transaction generator using Polars:
  ```python
  # src/features/synthetic_data.py
  import polars as pl
  import numpy as np
  from faker import Faker
  from datetime import datetime, timedelta
  
  fake = Faker()
  
  def generate_legitimate_transactions(n=10000):
      """Generate legitimate transactions with realistic patterns"""
      return pl.DataFrame({
          'transaction_id': [fake.uuid4() for _ in range(n)],
          'buyer_email': [fake.email() for _ in range(n)],
          'amount': np.random.lognormal(4.5, 1.2, n),  # Log-normal distribution
          'device_id': [fake.sha256() for _ in range(n)],
          'ip_address': [fake.ipv4() for _ in range(n)],
          'country': np.random.choice(['US', 'CA', 'GB', 'AU'], n, p=[0.7, 0.1, 0.1, 0.1]),
          'vpn_detected': np.random.choice([0, 1], n, p=[0.95, 0.05]),
          'account_age_days': np.random.exponential(180, n),
          'is_fraud': [0] * n
      })
  
  def generate_fraudulent_transactions(n=1000):
      """Generate fraudulent transactions with suspicious patterns"""
      return pl.DataFrame({
          'transaction_id': [fake.uuid4() for _ in range(n)],
          'buyer_email': [fake.email() for _ in range(n)],
          'amount': np.random.uniform(500, 5000, n),  # High amounts
          'device_id': [fake.sha256() for _ in range(n)],
          'ip_address': [fake.ipv4() for _ in range(n)],
          'country': np.random.choice(['NG', 'RU', 'CN'], n),  # High-risk countries
          'vpn_detected': np.random.choice([0, 1], n, p=[0.3, 0.7]),  # VPN usage
          'account_age_days': np.random.exponential(5, n),  # New accounts
          'is_fraud': [1] * n
      })
  
  def generate_dataset():
      legit = generate_legitimate_transactions(10000)
      fraud = generate_fraudulent_transactions(1000)
      df = pl.concat([legit, fraud]).sample(fraction=1.0, shuffle=True)
      return df
  ```
- [ ] Generate 11,000 transactions (10% fraud rate)
- [ ] Add realistic feature distributions
- [ ] Export to Parquet format (faster than CSV):
  ```python
  df.write_parquet('data/synthetic/transactions.parquet')
  ```

**Days 6-7: Feature Research & Design**
- [ ] Research fraud detection features (academic papers + industry blogs)
- [ ] Document 50+ features in notebook:
  ```python
  # notebooks/02_feature_engineering.ipynb
  FEATURES = {
      'velocity': [
          'tx_count_1h', 'tx_count_24h', 'tx_count_7d',
          'amount_sum_1h', 'amount_sum_24h'
      ],
      'geographic': [
          'geo_ip_billing_distance',
          'geo_country_mismatch',
          'geo_high_risk_country'
      ],
      'device': [
          'device_reputation_score',
          'vpn_detected',
          'device_age_hours',
          'device_tx_count'
      ],
      'behavioral': [
          'time_on_site_seconds',
          'checkout_speed_seconds',
          'form_fill_speed'
      ],
      'account': [
          'account_age_days',
          'email_domain_reputation',
          'previous_disputes_count'
      ],
      'cart': [
          'cart_item_count',
          'digital_items_ratio',
          'high_risk_items_count'
      ],
      'temporal': [
          'hour_of_day',
          'day_of_week',
          'is_weekend',
          'is_business_hours'
      ]
  }
  ```
- [ ] Create feature calculation pipeline design
- [ ] Document feature engineering rationale

---

### Developer 4: Full-Stack Integration (Infrastructure + DevOps)
**Days 1-2: Cloud Infrastructure Setup (Render + Databases)**
- [ ] Create Render account at render.com
- [ ] Provision PostgreSQL 17.1:
  - Plan: Standard ($65/month)
  - Region: US West (Oregon)
  - Enable automatic backups
  - Note connection string
- [ ] Provision Redis 7.4:
  - Plan: Standard ($25/month)
  - Max memory: 1GB
  - Persistence: AOF + RDB
  - Note connection URL
- [ ] Set up Elastic Cloud (elastic.co):
  - Elasticsearch 8.16.0
  - Deployment size: 4GB RAM
  - Region: AWS US-West-2
  - Enable Kibana and APM
  - Note cloud ID and credentials
- [ ] Document all connection strings in secure password manager
- [ ] Create `.env.example` template:
  ```bash
  # Database
  DATABASE_URL=postgresql://user:pass@host:5432/payguard
  
  # Redis
  REDIS_URL=redis://user:pass@host:6379
  
  # Elasticsearch
  ELASTIC_CLOUD_ID=deployment:hash
  ELASTIC_API_KEY=api_key
  
  # PayPal
  PAYPAL_CLIENT_ID=sandbox_client_id
  PAYPAL_SECRET=sandbox_secret
  PAYPAL_MODE=sandbox
  
  # JWT
  JWT_SECRET=generate_strong_secret_here
  
  # API Keys
  BACKEND_URL=http://localhost:3001
  FRONTEND_URL=http://localhost:3000
  ```

**Days 3-4: CI/CD Pipeline (GitHub Actions 2026)**
- [ ] Create GitHub repository
- [ ] Set up GitHub Actions workflows with latest features:
  ```yaml
  # .github/workflows/backend.yml
  name: Backend CI/CD
  
  on:
    push:
      branches: [main, development]
      paths:
        - 'backend/**'
    pull_request:
      branches: [main, development]
  
  jobs:
    test:
      runs-on: ubuntu-24.04  # Latest Ubuntu 2026
      strategy:
        matrix:
          node-version: [22.x]  # Node.js 22 LTS
      
      steps:
        - uses: actions/checkout@v4.2.0
        
        - name: Setup Node.js
          uses: actions/setup-node@v4.1.0
          with:
            node-version: ${{ matrix.node-version }}
            cache: 'npm'
            cache-dependency-path: backend/package-lock.json
        
        - name: Install dependencies
          run: |
            cd backend
            npm ci
        
        - name: Run linter
          run: |
            cd backend
            npm run lint
        
        - name: Run type check
          run: |
            cd backend
            npm run type-check
        
        - name: Run tests
          run: |
            cd backend
            npm run test
          env:
            DATABASE_URL: postgresql://test:test@localhost:5432/test
            REDIS_URL: redis://localhost:6379
        
        - name: Build
          run: |
            cd backend
            npm run build
    
    deploy:
      needs: test
      if: github.ref == 'refs/heads/main'
      runs-on: ubuntu-24.04
      
      steps:
        - uses: actions/checkout@v4.2.0
        
        - name: Deploy to Render
          env:
            RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
            RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
          run: |
            curl -X POST \
              "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
              -H "Authorization: Bearer ${RENDER_API_KEY}" \
              -H "Content-Type: application/json"
  ```
  ```yaml
  # .github/workflows/frontend.yml
  name: Frontend CI/CD
  
  on:
    push:
      branches: [main, development]
      paths:
        - 'frontend/**'
  
  jobs:
    test:
      runs-on: ubuntu-24.04
      steps:
        - uses: actions/checkout@v4.2.0
        
        - name: Setup Node.js
          uses: actions/setup-node@v4.1.0
          with:
            node-version: 22.x
            cache: 'npm'
            cache-dependency-path: frontend/package-lock.json
        
        - name: Install dependencies
          run: |
            cd frontend
            npm ci
        
        - name: Run linter
          run: |
            cd frontend
            npm run lint
        
        - name: Run type check
          run: |
            cd frontend
            npm run type-check
        
        - name: Build
          run: |
            cd frontend
            npm run build
          env:
            NEXT_PUBLIC_API_URL: https://api.payguard.ai
    
    deploy:
      needs: test
      if: github.ref == 'refs/heads/main'
      runs-on: ubuntu-24.04
      steps:
        - name: Deploy to Render
          env:
            RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
            RENDER_SERVICE_ID: ${{ secrets.RENDER_FRONTEND_ID }}
          run: |
            curl -X POST \
              "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
              -H "Authorization: Bearer ${RENDER_API_KEY}"
  ```
- [ ] Set up branch protection rules:
  - Require PR reviews (1 approval)
  - Require status checks to pass
  - Require linear history
- [ ] Configure GitHub Secrets for deployment

**Days 5-7: Local Development Environment (Docker Compose)**
- [ ] Create Docker Compose file for local development:
  ```yaml
  # docker-compose.yml
  version: '3.9'
  
  services:
    postgres:
      image: postgres:17.1-alpine
      container_name: payguard-postgres
      environment:
        POSTGRES_DB: payguard_dev
        POSTGRES_USER: payguard
        POSTGRES_PASSWORD: dev_password
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U payguard"]
        interval: 10s
        timeout: 5s
        retries: 5
    
    redis:
      image: redis:7.4.1-alpine
      container_name: payguard-redis
      command: redis-server --appendonly yes
      ports:
        - "6379:6379"
      volumes:
        - redis_data:/data
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 10s
        timeout: 5s
        retries: 5
    
    elasticsearch:
      image: docker.elastic.co/elasticsearch/elasticsearch:8.16.0
      container_name: payguard-elastic
      environment:
        - discovery.type=single-node
        - xpack.security.enabled=false
        - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      ports:
        - "9200:9200"
        - "9300:9300"
      volumes:
        - elastic_data:/usr/share/elasticsearch/data
      healthcheck:
        test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
        interval: 30s
        timeout: 10s
        retries: 5
  
  volumes:
    postgres_data:
    redis_data:
    elastic_data:
  ```
- [ ] Create setup script:
  ```bash
  #!/bin/bash
  # scripts/setup-local.sh
  
  echo "🚀 Setting up PayGuard AI local development environment..."
  
  # Start Docker services
  docker-compose up -d
  
  # Wait for services to be healthy
  echo "⏳ Waiting for services to be ready..."
  docker-compose exec -T postgres pg_isready -U payguard
  docker-compose exec -T redis redis-cli ping
  
  # Install backend dependencies
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
  
  # Run database migrations
  echo "🗄️  Running database migrations..."
  cd backend && npm run db:migrate && cd ..
  
  # Seed database with test data
  echo "🌱 Seeding database..."
  cd backend && npm run db:seed && cd ..
  
  # Install frontend dependencies
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
  
  echo "✅ Setup complete!"
  echo "🔥 Start backend: cd backend && npm run dev"
  echo "🎨 Start frontend: cd frontend && npm run dev"
  ```
- [ ] Make script executable: `chmod +x scripts/setup-local.sh`
- [ ] Write comprehensive README.md with setup instructions

---

## Week 2: Core Backend Development

### Developer 1: Backend Lead - PayPal Integration
**Days 8-10: PayPal Service Layer (Fastify 5.1 + Latest PayPal SDK)**
- [ ] Implement OAuth 2.0 service with auto-refresh:
  ```typescript
  // src/services/paypal.service.ts
  import axios from 'axios'
  
  const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
  
  class PayPalService {
    private accessToken: string | null = null
    private tokenExpiry: number = 0
    
    async getAccessToken(): Promise<string> {
      // Check if token is still valid (with 5-minute buffer)
      if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
        return this.accessToken
      }
      
      // Generate new token
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
      ).toString('base64')
      
      const response = await axios.post(
        `${PAYPAL_API}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      
      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000)
      
      return this.accessToken
    }
    
    async createOrder(amount: number, currency: string = 'USD') {
      const token = await this.getAccessToken()
      
      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      return response.data
    }
    
    async captureOrder(orderId: string) {
      const token = await this.getAccessToken()
      
      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      return response.data
    }
    
    async getOrderDetails(orderId: string) {
      const token = await this.getAccessToken()
      
      const response = await axios.get(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      return response.data
    }
    
    async searchTransactions(startDate: string, endDate: string) {
      const token = await this.getAccessToken()
      
      const response = await axios.get(
        `${PAYPAL_API}/v1/reporting/transactions`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            fields: 'all'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      return response.data
    }
  }
  
  export const paypalService = new PayPalService()
  ```
- [ ] Write comprehensive unit tests with Vitest:
  ```typescript
  // tests/services/paypal.service.test.ts
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { paypalService } from '@/services/paypal.service'
  
  describe('PayPalService', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
    
    it('should generate access token', async () => {
      const token = await paypalService.getAccessToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })
    
    it('should create order', async () => {
      const order = await paypalService.createOrder(100.00)
      expect(order.id).toBeTruthy()
      expect(order.status).toBe('CREATED')
    })
    
    // More tests...
  })
  ```
- [ ] Add JSDoc documentation to all methods

**Days 11-12: Webhook System (PayPal → Backend)**
- [ ] Create webhook endpoint with signature verification:
  ```typescript
  // src/routes/webhook.routes.ts
  import { FastifyInstance } from 'fastify'
  import { webhookService } from '@/services/webhook.service'
  
  export async function webhookRoutes(fastify: FastifyInstance) {
    fastify.post('/webhooks/paypal', async (request, reply) => {
      // Extract PayPal headers
      const {
        'paypal-auth-algo': authAlgo,
        'paypal-cert-url': certUrl,
        'paypal-transmission-id': transmissionId,
        'paypal-transmission-sig': transmissionSig,
        'paypal-transmission-time': transmissionTime
      } = request.headers
      
      // Verify webhook signature (CRITICAL FOR SECURITY)
      const isValid = await webhookService.verifySignature({
        authAlgo: authAlgo as string,
        certUrl: certUrl as string,
        transmissionId: transmissionId as string,
        transmissionSig: transmissionSig as string,
        transmissionTime: transmissionTime as string,
        webhookId: process.env.PAYPAL_WEBHOOK_ID!,
        webhookEvent: request.body
      })
      
      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid webhook signature' })
      }
      
      // Process event
      const event = request.body as any
      await webhookService.processEvent(event)
      
      return reply.code(200).send({ received: true })
    })
  }
  ```
  ```typescript
  // src/services/webhook.service.ts
  import axios from 'axios'
  import { db } from '@/config/database'
  import { transactions } from '@/db/schema'
  import { eq } from 'drizzle-orm'
  
  class WebhookService {
    async verifySignature(data: any): Promise<boolean> {
      const token = await paypalService.getAccessToken()
      
      const response = await axios.post(
        `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      return response.data.verification_status === 'SUCCESS'
    }
    
    async processEvent(event: any) {
      const eventType = event.event_type
      
      switch (eventType) {
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaymentDenied(event)
          break
        
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCompleted(event)
          break
        
        case 'CUSTOMER.DISPUTE.CREATED':
          await this.handleDisputeCreated(event)
          break
        
        default:
          console.log(`Unhandled event type: ${eventType}`)
      }
    }
    
    private async handlePaymentDenied(event: any) {
      const captureId = event.resource.id
      
      // Update transaction status in database
      await db
        .update(transactions)
        .set({
          status: 'DECLINED',
          updatedAt: new Date()
        })
        .where(eq(transactions.paypalOrderId, captureId))
      
      // Index in Elastic for ML training
      await elasticService.indexDeniedTransaction(event.resource)
    }
    
    private async handlePaymentCompleted(event: any) {
      const captureId = event.resource.id
      
      await db
        .update(transactions)
        .set({
          status: 'COMPLETED',
          updatedAt: new Date()
        })
        .where(eq(transactions.paypalOrderId, captureId))
    }
    
    private async handleDisputeCreated(event: any) {
      const disputeId = event.resource.dispute_id
      const transactionId = event.resource.disputed_transactions[0]?.buyer_transaction_id
      
      // Mark transaction as disputed (fraud flag)
      await db
        .update(transactions)
        .set({
          status: 'DISPUTED',
          updatedAt: new Date()
        })
        .where(eq(transactions.paypalOrderId, transactionId))
      
      // Add to ML training queue
      await mlTrainingQueue.add({ transactionId, label: 'fraud' })
    }
  }
  
  export const webhookService = new WebhookService()
  ```
- [ ] Subscribe to PayPal webhook events:
  ```bash
  # Run this script to create webhook subscription
  curl -X POST https://api-m.sandbox.paypal.com/v1/notifications/webhooks \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://api.payguard.ai/webhooks/paypal",
      "event_types": [
        {"name": "PAYMENT.CAPTURE.DENIED"},
        {"name": "PAYMENT.CAPTURE.COMPLETED"},
        {"name": "CUSTOMER.DISPUTE.CREATED"},
        {"name": "RISK.DISPUTE.CREATED"}
      ]
    }'
  ```
- [ ] Implement retry logic with exponential backoff
- [ ] Write webhook tests with mock PayPal events

**Days 13-14: Core API Routes (Fastify 5.1 + Zod Validation)**
- [ ] Create merchant routes with Lucia auth:
  ```typescript
  // src/routes/merchants.routes.ts
  import { FastifyInstance } from 'fastify'
  import { z } from 'zod'
  import { merchantService } from '@/services/merchant.service'
  
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    industryCategory: z.string().optional()
  })
  
  export async function merchantRoutes(fastify: FastifyInstance) {
    // Register merchant
    fastify.post('/merchants/register', async (request, reply) => {
      const body = registerSchema.parse(request.body)
      
      const merchant = await merchantService.create(body)
      
      return reply.code(201).send({
        id: merchant.id,
        email: merchant.email,
        apiKey: merchant.apiKey
      })
    })
    
    // Login merchant
    fastify.post('/merchants/login', async (request, reply) => {
      const { email, password } = request.body as any
      
      const session = await merchantService.login(email, password)
      
      return reply.send({
        token: session.token,
        merchant: session.merchant
      })
    })
    
    // Get merchant profile (protected route)
    fastify.get('/merchants/:id', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      const { id } = request.params as any
      
      const merchant = await merchantService.findById(id)
      
      return reply.send(merchant)
    })
  }
  ```
- [ ] Create transaction routes:
  ```typescript
  // src/routes/transactions.routes.ts
  export async function transactionRoutes(fastify: FastifyInstance) {
    // List transactions (with pagination)
    fastify.get('/transactions', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      const { page = 1, limit = 20, riskCategory } = request.query as any
      
      const result = await transactionService.list({
        merchantId: request.user.id,
        page,
        limit,
        riskCategory
      })
      
      return reply.send(result)
    })
    
    // Get transaction details
    fastify.get('/transactions/:id', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      const { id } = request.params as any
      
      const transaction = await transactionService.findById(id)
      
      return reply.send(transaction)
    })
  }
  ```
- [ ] Create main risk check endpoint (integrate later with ML):
  ```typescript
  // src/routes/risk-check.routes.ts
  const riskCheckSchema = z.object({
    buyer_email: z.string().email(),
    amount: z.number().positive(),
    currency: z.string().default('USD'),
    device_data: z.object({
      device_id: z.string(),
      ip_address: z.string(),
      user_agent: z.string(),
      vpn_detected: z.boolean().optional()
    }),
    session_data: z.object({
      time_on_site_seconds: z.number(),
      pages_visited: z.number(),
      checkout_speed_seconds: z.number()
    }),
    cart_items: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      category: z.string()
    }))
  })
  
  export async function riskCheckRoutes(fastify: FastifyInstance) {
    fastify.post('/risk-check', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      const data = riskCheckSchema.parse(request.body)
      
      // TODO: Integrate with ML service (Week 4)
      // For now, return mock risk score
      const mockRiskScore = {
        overall_score: 0.25,
        category: 'GREEN',
        flags: [],
        recommended_action: 'PROCEED_PAYPAL'
      }
      
      return reply.send(mockRiskScore)
    })
  }
  ```
- [ ] Implement JWT authentication middleware with Lucia 4.0:
  ```typescript
  // src/middleware/auth.middleware.ts
  import { FastifyRequest, FastifyReply } from 'fastify'
  
  declare module 'fastify' {
    interface FastifyInstance {
      authenticate: (
        request: FastifyRequest,
        reply: FastifyReply
      ) => Promise<void>
    }
  }
  
  export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  }
  ```
- [ ] Add rate limiting per merchant
- [ ] Write integration tests for all routes

---

### Developer 2: Frontend Lead - Dashboard Core
**Days 8-10: Dashboard Layout (Next.js 15 + React 19)**
- [ ] Create dashboard shell with navigation:
  ```typescript
  // app/(dashboard)/layout.tsx
  import { Sidebar } from '@/components/dashboard/sidebar'
  import { Header } from '@/components/dashboard/header'
  
  export default function DashboardLayout({
    children
  }: {
    children: React.Node
  }) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }
  ```
- [ ] Build responsive sidebar with navigation:
  ```typescript
  // components/dashboard/sidebar.tsx
  'use client'
  import Link from 'next/link'
  import { usePathname } from 'next/navigation'
  import {
    LayoutDashboard,
    CreditCard,
    BarChart3,
    Settings,
    Shield
  } from 'lucide-react'
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/review-queue', label: 'Review Queue', icon: Shield },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings }
  ]
  
  export function Sidebar() {
    const pathname = usePathname()
    
    return (
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">PayGuard AI</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    )
  }
  ```
- [ ] Build dashboard home page with stats widgets:
  ```typescript
  // app/(dashboard)/page.tsx
  import { Suspense } from 'react'
  import { AccountHealthScore } from '@/components/dashboard/account-health-score'
  import { TransactionVolumeChart } from '@/components/charts/transaction-volume'
  import { RiskDistributionChart } from '@/components/charts/risk-distribution'
  import { QuickStats } from '@/components/dashboard/quick-stats'
  import { LoadingSpinner } from '@/components/ui/loading-spinner'
  
  export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        
        <Suspense fallback={<LoadingSpinner />}>
          <QuickStats />
        </Suspense>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingSpinner />}>
            <AccountHealthScore />
          </Suspense>
          
          <Suspense fallback={<LoadingSpinner />}>
            <RiskDistributionChart />
          </Suspense>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TransactionVolumeChart />
        </Suspense>
      </div>
    )
  }
  ```
- [ ] Build quick stats component with React 19 Server Components:
  ```typescript
  // components/dashboard/quick-stats.tsx
  import { Card } from '@/components/ui/card'
  import { TrendingUp, Shield, AlertTriangle, DollarSign } from 'lucide-react'
  
  async function getStats() {
    // Server Component - fetch directly from DB or API
    const res = await fetch('https://api.payguard.ai/stats', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })
    return res.json()
  }
  
  export async function QuickStats() {
    const stats = await getStats()
    
    const items = [
      {
        label: 'Total Transactions',
        value: stats.total_transactions.toLocaleString(),
        icon: DollarSign,
        trend: '+12%'
      },
      {
        label: 'Blocked (High Risk)',
        value: stats.blocked_count.toLocaleString(),
        icon: Shield,
        trend: '-3%'
      },
      {
        label: 'Review Queue',
        value: stats.review_queue_count.toLocaleString(),
        icon: AlertTriangle
      },
      {
        label: 'Account Health',
        value: `${stats.account_health}/100`,
        icon: TrendingUp,
        trend: '+5%'
      }
    ]
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold mt-2">{item.value}</p>
                  {item.trend && (
                    <p className="text-sm text-green-600 mt-1">{item.trend}</p>
                  )}
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }
  ```

**Days 11-12: Transaction List (AG Grid 32.3)**
- [ ] Install AG Grid Enterprise:
  ```bash
  npm install ag-grid-react@32.3.0 ag-grid-enterprise@32.3.0
  ```
- [ ] Build transaction table component:
  ```typescript
  // components/tables/transactions-table.tsx
  'use client'
  import { useMemo, useRef } from 'react'
  import { AgGridReact } from 'ag-grid-react'
  import type { ColDef } from 'ag-grid-enterprise'
  import { RiskScoreBadge } from '@/components/dashboard/risk-score-badge'
  import { useQuery } from '@tanstack/react-query'
  import { api } from '@/lib/api/client'
  
  import 'ag-grid-community/styles/ag-grid.css'
  import 'ag-grid-community/styles/ag-theme-quartz.css'
  
  export function TransactionsTable() {
    const gridRef = useRef<AgGridReact>(null)
    
    const { data, isLoading } = useQuery({
      queryKey: ['transactions'],
      queryFn: () => api.get('/transactions').then(r => r.data)
    })
    
    const columnDefs = useMemo<ColDef[]>(() => [
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 180,
        valueFormatter: (params) => {
          return new Date(params.value).toLocaleString()
        }
      },
      {
        field: 'buyerEmail',
        headerName: 'Buyer',
        width: 250,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 150,
        valueFormatter: (params) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(params.value)
        },
        filter: 'agNumberColumnFilter'
      },
      {
        field: 'riskScore',
        headerName: 'Risk Score',
        width: 180,
        cellRenderer: (params: any) => {
          return (
            <RiskScoreBadge
              score={params.value}
              category={params.data.riskCategory}
            />
          )
        },
        filter: 'agNumberColumnFilter'
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: 'Actions',
        width: 120,
        cellRenderer: (params: any) => {
          return (
            <button
              onClick={() => viewDetails(params.data.id)}
              className="text-primary hover:underline"
            >
              View
            </button>
          )
        }
      }
    ], [])
    
    const defaultColDef = useMemo<ColDef>(() => ({
      sortable: true,
      resizable: true,
      filter: true
    }), [])
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    return (
      <div className="ag-theme-quartz" style={{ height: 600 }}>
        <AgGridReact
          ref={gridRef}
          rowData={data?.transactions || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          rowSelection="multiple"
          enableRangeSelection={true}
        />
      </div>
    )
  }
  ```
- [ ] Add CSV export functionality
- [ ] Implement advanced filtering panel
- [ ] Add risk category quick filters (Green/Yellow/Red buttons)

**Days 13-14: API Integration (TanStack Query 5.60 + Axios 1.8)**
- [ ] Set up Axios instance with interceptors:
  ```typescript
  // lib/api/client.ts
  import axios from 'axios'
  
  export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // Request interceptor - add auth token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  // Response interceptor - handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
  ```
- [ ] Create TanStack Query hooks:
  ```typescript
  // lib/api/queries.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { api } from './client'
  
  // Transactions
  export function useTransactions(params?: any) {
    return useQuery({
      queryKey: ['transactions', params],
      queryFn: () => api.get('/transactions', { params }).then(r => r.data)
    })
  }
  
  export function useTransaction(id: string) {
    return useQuery({
      queryKey: ['transaction', id],
      queryFn: () => api.get(`/transactions/${id}`).then(r => r.data),
      enabled: !!id
    })
  }
  
  // Risk Check
  export function useRiskCheck() {
    return useMutation({
      mutationFn: (data: any) => api.post('/risk-check', data).then(r => r.data)
    })
  }
  
  // Auth
  export function useLogin() {
    return useMutation({
      mutationFn: (credentials: { email: string; password: string }) =>
        api.post('/merchants/login', credentials).then(r => r.data)
    })
  }
  ```
- [ ] Set up React Query provider:
  ```typescript
  // app/providers.tsx
  'use client'
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
  import { useState } from 'react'
  
  export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: 1
        }
      }
    }))
    
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  }
  ```
- [ ] Create Zustand store for global state:
  ```typescript
  // stores/auth-store.ts
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'
  
  interface AuthState {
    token: string | null
    user: any | null
    login: (token: string, user: any) => void
    logout: () => void
  }
  
  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        token: null,
        user: null,
        login: (token, user) => {
          localStorage.setItem('auth_token', token)
          set({ token, user })
        },
        logout: () => {
          localStorage.removeItem('auth_token')
          set({ token: null, user: null })
        }
      }),
      {
        name: 'auth-storage'
      }
    )
  )
  ```

---

### Developer 3: ML Engineer - Feature Engineering
**Days 8-10: Feature Extraction Implementation (Polars 1.15)**
- [ ] Implement comprehensive feature extractor using Polars:
  ```python
  # src/features/extractor.py
  import polars as pl
  import numpy as np
  from datetime import datetime, timedelta
  from typing import Dict, Any
  from geopy.distance import geodesic
  
  class TransactionFeatureExtractor:
      """Extract 50+ features from transaction data using Polars"""
      
      def extract_features(
          self,
          transaction: Dict[str, Any],
          buyer_history: pl.DataFrame,
          merchant_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Extract all features for a single transaction"""
          
          features = {}
          
          # 1. VELOCITY FEATURES
          features.update(self._extract_velocity_features(
              transaction, buyer_history
          ))
          
          # 2. AMOUNT FEATURES
          features.update(self._extract_amount_features(
              transaction, buyer_history
          ))
          
          # 3. GEOGRAPHIC FEATURES
          features.update(self._extract_geographic_features(transaction))
          
          # 4. DEVICE FEATURES
          features.update(self._extract_device_features(transaction))
          
          # 5. BEHAVIORAL FEATURES
          features.update(self._extract_behavioral_features(transaction))
          
          # 6. ACCOUNT FEATURES
          features.update(self._extract_account_features(
              transaction, buyer_history
          ))
          
          # 7. CART FEATURES
          features.update(self._extract_cart_features(transaction))
          
          # 8. TEMPORAL FEATURES
          features.update(self._extract_temporal_features(transaction))
          
          # 9. MERCHANT FEATURES
          features.update(self._extract_merchant_features(merchant_history))
          
          # 10. CROSS-REFERENCE FEATURES
          features.update(self._extract_cross_reference_features(
              transaction, buyer_history
          ))
          
          return features
      
      def _extract_velocity_features(
          self,
          transaction: Dict[str, Any],
          buyer_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Transaction frequency features"""
          
          now = datetime.now()
          
          # Filter by time windows using Polars
          last_1h = buyer_history.filter(
              pl.col('created_at') >= now - timedelta(hours=1)
          )
          last_24h = buyer_history.filter(
              pl.col('created_at') >= now - timedelta(hours=24)
          )
          last_7d = buyer_history.filter(
              pl.col('created_at') >= now - timedelta(days=7)
          )
          
          return {
              'tx_count_1h': len(last_1h),
              'tx_count_24h': len(last_24h),
              'tx_count_7d': len(last_7d),
              'amount_sum_1h': last_1h.select('amount').sum().item() or 0,
              'amount_sum_24h': last_24h.select('amount').sum().item() or 0
          }
      
      def _extract_amount_features(
          self,
          transaction: Dict[str, Any],
          buyer_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Statistical amount features"""
          
          amount = transaction['amount']
          
          if len(buyer_history) > 0:
              # Calculate using Polars
              stats = buyer_history.select([
                  pl.col('amount').mean().alias('mean'),
                  pl.col('amount').std().alias('std')
              ]).row(0)
              
              mean, std = stats
              
              zscore = (amount - mean) / (std + 1e-6)  # Avoid division by zero
              deviation_pct = ((amount - mean) / (mean + 1e-6)) * 100
          else:
              zscore = 0.0
              deviation_pct = 0.0
          
          return {
              'amount': amount,
              'amount_zscore': zscore,
              'amount_deviation_pct': deviation_pct,
              'amount_log': np.log1p(amount)
          }
      
      def _extract_geographic_features(
          self,
          transaction: Dict[str, Any]
      ) -> Dict[str, float]:
          """Geographic mismatch features"""
          
          ip_location = transaction.get('ip_location', {})
          billing_address = transaction.get('billing_address', {})
          shipping_address = transaction.get('shipping_address', {})
          
          # Calculate distances using geodesic
          ip_coords = (ip_location.get('lat'), ip_location.get('lon'))
          billing_coords = (billing_address.get('lat'), billing_address.get('lon'))
          shipping_coords = (shipping_address.get('lat'), shipping_address.get('lon'))
          
          try:
              ip_billing_distance = geodesic(ip_coords, billing_coords).km
              ip_shipping_distance = geodesic(ip_coords, shipping_coords).km
              billing_shipping_distance = geodesic(billing_coords, shipping_coords).km
          except:
              ip_billing_distance = 0.0
              ip_shipping_distance = 0.0
              billing_shipping_distance = 0.0
          
          return {
              'geo_ip_billing_distance_km': ip_billing_distance,
              'geo_ip_shipping_distance_km': ip_shipping_distance,
              'geo_billing_shipping_distance_km': billing_shipping_distance,
              'geo_country_mismatch': int(
                  ip_location.get('country') != billing_address.get('country')
              ),
              'geo_high_risk_country': int(
                  ip_location.get('country') in ['NG', 'RU', 'CN', 'VN']
              )
          }
      
      def _extract_device_features(
          self,
          transaction: Dict[str, Any]
      ) -> Dict[str, float]:
          """Device fingerprint features"""
          
          device_data = transaction.get('device_data', {})
          
          return {
              'device_reputation_score': device_data.get('reputation_score', 0.5),
              'vpn_detected': int(device_data.get('vpn_detected', False)),
              'tor_detected': int(device_data.get('tor_detected', False)),
              'device_age_hours': device_data.get('device_age_hours', 0),
              'browser_fingerprint_unique': int(
                  device_data.get('fingerprint_unique', True)
              )
          }
      
      def _extract_behavioral_features(
          self,
          transaction: Dict[str, Any]
      ) -> Dict[str, float]:
          """User behavior features"""
          
          session_data = transaction.get('session_data', {})
          
          return {
              'time_on_site_seconds': session_data.get('time_on_site_seconds', 0),
              'pages_visited': session_data.get('pages_visited', 0),
              'checkout_speed_seconds': session_data.get('checkout_speed_seconds', 0),
              'form_fill_speed': session_data.get('form_fill_speed', 0),
              'mouse_movement_variance': session_data.get('mouse_movement_variance', 0)
          }
      
      def _extract_account_features(
          self,
          transaction: Dict[str, Any],
          buyer_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Buyer account features"""
          
          email = transaction.get('buyer_email', '')
          domain = email.split('@')[-1]
          
          # Email domain reputation (simplified)
          trusted_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
          domain_reputation = 1.0 if domain in trusted_domains else 0.5
          
          # Account age
          if len(buyer_history) > 0:
              first_tx_date = buyer_history.select('created_at').min().item()
              account_age_days = (datetime.now() - first_tx_date).days
          else:
              account_age_days = 0
          
          return {
              'account_age_days': account_age_days,
              'email_domain_reputation': domain_reputation,
              'email_is_disposable': int(domain in ['tempmail.com', '10minutemail.com']),
              'previous_transaction_count': len(buyer_history),
              'previous_disputes_count': 0  # TODO: Get from disputes table
          }
      
      def _extract_cart_features(
          self,
          transaction: Dict[str, Any]
      ) -> Dict[str, float]:
          """Shopping cart features"""
          
          cart_items = transaction.get('cart_items', [])
          
          if not cart_items:
              return {
                  'cart_item_count': 0,
                  'cart_value_per_item': 0,
                  'digital_items_ratio': 0,
                  'high_risk_items_count': 0
              }
          
          # Calculate features
          item_count = len(cart_items)
          total_amount = transaction.get('amount', 0)
          value_per_item = total_amount / item_count
          
          # Digital items (gift cards, software)
          digital_categories = ['gift_card', 'software', 'subscription']
          digital_count = sum(
              1 for item in cart_items
              if item.get('category') in digital_categories
          )
          digital_ratio = digital_count / item_count
          
          # High-risk items (electronics, jewelry)
          high_risk_categories = ['electronics', 'jewelry', 'watches']
          high_risk_count = sum(
              1 for item in cart_items
              if item.get('category') in high_risk_categories
          )
          
          return {
              'cart_item_count': item_count,
              'cart_value_per_item': value_per_item,
              'digital_items_ratio': digital_ratio,
              'high_risk_items_count': high_risk_count
          }
      
      def _extract_temporal_features(
          self,
          transaction: Dict[str, Any]
      ) -> Dict[str, float]:
          """Time-based features"""
          
          timestamp = transaction.get('timestamp', datetime.now())
          if isinstance(timestamp, str):
              timestamp = datetime.fromisoformat(timestamp)
          
          hour = timestamp.hour
          day_of_week = timestamp.weekday()
          
          return {
              'hour_of_day': hour,
              'day_of_week': day_of_week,
              'is_weekend': int(day_of_week >= 5),
              'is_business_hours': int(9 <= hour <= 17),
              'is_late_night': int(hour >= 22 or hour <= 5)
          }
      
      def _extract_merchant_features(
          self,
          merchant_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Merchant-specific features"""
          
          if len(merchant_history) == 0:
              return {
                  'merchant_chargeback_rate': 0.0,
                  'merchant_avg_transaction_amount': 0.0,
                  'merchant_freeze_history': 0
              }
          
          # Calculate chargeback rate
          total_transactions = len(merchant_history)
          chargebacks = merchant_history.filter(
              pl.col('status') == 'DISPUTED'
          ).height
          chargeback_rate = chargebacks / total_transactions if total_transactions > 0 else 0.0
          
          # Average transaction amount
          avg_amount = merchant_history.select('amount').mean().item() or 0.0
          
          return {
              'merchant_chargeback_rate': chargeback_rate,
              'merchant_avg_transaction_amount': avg_amount,
              'merchant_freeze_history': 0  # TODO: Track freezes
          }
      
      def _extract_cross_reference_features(
          self,
          transaction: Dict[str, Any],
          buyer_history: pl.DataFrame
      ) -> Dict[str, float]:
          """Network analysis features"""
          
          # Count unique merchants for this buyer
          unique_merchants = buyer_history.select('merchant_id').n_unique()
          
          # Count unique accounts for this device
          # TODO: Query across all transactions by device_id
          unique_accounts = 1
          
          return {
              'buyer_merchant_count': unique_merchants,
              'device_account_count': unique_accounts
          }
  ```
- [ ] Write unit tests for each feature category
- [ ] Benchmark feature extraction speed (target: <50ms)
- [ ] Document feature definitions and rationale

**Days 11-12: Data Preprocessing Pipeline**
- [ ] Implement data loading and preprocessing:
  ```python
  # src/features/preprocessing.py
  import polars as pl
  from sklearn.model_selection import train_test_split
  from sklearn.preprocessing import StandardScaler
  import joblib
  
  class DataPreprocessor:
      def __init__(self):
          self.scaler = StandardScaler()
          self.feature_names = None
      
      def load_data(self, path: str) -> pl.DataFrame:
          """Load data from Parquet file"""
          return pl.read_parquet(path)
      
      def handle_missing_values(self, df: pl.DataFrame) -> pl.DataFrame:
          """Impute missing values"""
          
          # For numeric columns, fill with median
          numeric_cols = df.select(pl.col(pl.NUMERIC_DTYPES)).columns
          
          for col in numeric_cols:
              median_val = df.select(pl.col(col).median()).item()
              df = df.with_columns(
                  pl.col(col).fill_null(median_val)
              )
          
          # For categorical, fill with mode
          categorical_cols = df.select(pl.col(pl.Utf8)).columns
          
          for col in categorical_cols:
              mode_val = df.select(pl.col(col).mode()).item()
              df = df.with_columns(
                  pl.col(col).fill_null(mode_val)
              )
          
          return df
      
      def normalize_features(self, df: pl.DataFrame) -> pl.DataFrame:
          """Normalize numeric features"""
          
          # Get feature columns (exclude labels and IDs)
          feature_cols = [
              col for col in df.columns
              if col not in ['is_fraud', 'transaction_id', 'buyer_email']
          ]
          
          self.feature_names = feature_cols
          
          # Convert to numpy for scaling
          X = df.select(feature_cols).to_numpy()
          
          # Fit and transform
          X_scaled = self.scaler.fit_transform(X)
          
          # Convert back to Polars
          scaled_df = pl.DataFrame(X_scaled, schema=feature_cols)
          
          # Add back labels and IDs
          scaled_df = scaled_df.hstack([
              df.select(['transaction_id', 'is_fraud'])
          ])
          
          return scaled_df
      
      def split_data(self, df: pl.DataFrame, test_size=0.2):
          """Split into train and test sets with stratification"""
          
          # Separate features and labels
          X = df.drop(['is_fraud', 'transaction_id']).to_numpy()
          y = df.select('is_fraud').to_numpy().ravel()
          
          # Stratified split
          X_train, X_test, y_train, y_test = train_test_split(
              X, y,
              test_size=test_size,
              stratify=y,
              random_state=42
          )
          
          return X_train, X_test, y_train, y_test
      
      def save_scaler(self, path: str):
          """Save fitted scaler"""
          joblib.dump(self.scaler, path)
      
      def load_scaler(self, path: str):
          """Load fitted scaler"""
          self.scaler = joblib.load(path)
  ```
- [ ] Create preprocessing pipeline script:
  ```python
  # scripts/preprocess_data.py
  from src.features.preprocessing import DataPreprocessor
  
  def main():
      preprocessor = DataPreprocessor()
      
      # Load synthetic data
      df = preprocessor.load_data('data/synthetic/transactions.parquet')
      print(f"Loaded {len(df)} transactions")
      
      # Handle missing values
      df = preprocessor.handle_missing_values(df)
      print("Missing values handled")
      
      # Normalize features
      df = preprocessor.normalize_features(df)
      print("Features normalized")
      
      # Save processed data
      df.write_parquet('data/processed/transactions_processed.parquet')
      print("Saved processed data")
      
      # Save scaler
      preprocessor.save_scaler('models/scaler.pkl')
      print("Saved scaler")
  
  if __name__ == '__main__':
      main()
  ```
- [ ] Run preprocessing and validate output

**Days 13-14: Initial Model Training (XGBoost 2.1)**
- [ ] Implement model trainer:
  ```python
  # src/models/trainer.py
  import xgboost as xgb
  from sklearn.model_selection import StratifiedKFold
  from sklearn.metrics import roc_auc_score, precision_recall_curve, confusion_matrix
  import numpy as np
  import joblib
  
  class FraudModelTrainer:
      def __init__(self):
          self.model = xgb.XGBClassifier(
              n_estimators=100,  # Start small, increase later
              max_depth=6,
              learning_rate=0.1,
              subsample=0.8,
              colsample_bytree=0.8,
              objective='binary:logistic',
              eval_metric='auc',
              scale_pos_weight=10,  # Handle class imbalance
              random_state=42,
              tree_method='hist',  # Faster training
              device='cuda' if xgb.config.use_cuda() else 'cpu'  # GPU if available
          )
      
      def train(self, X_train, y_train, X_test, y_test):
          """Train model with validation"""
          
          print("Training XGBoost model...")
          
          self.model.fit(
              X_train, y_train,
              eval_set=[(X_train, y_train), (X_test, y_test)],
              verbose=True
          )
          
          print("Training complete!")
          
          return self.model
      
      def cross_validate(self, X, y, n_splits=5):
          """5-fold cross-validation"""
          
          print(f"Running {n_splits}-fold cross-validation...")
          
          cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
          cv_scores = []
          
          for fold, (train_idx, val_idx) in enumerate(cv.split(X, y), 1):
              X_train_cv = X[train_idx]
              y_train_cv = y[train_idx]
              X_val_cv = X[val_idx]
              y_val_cv = y[val_idx]
              
              self.model.fit(X_train_cv, y_train_cv, verbose=False)
              
              y_pred_proba = self.model.predict_proba(X_val_cv)[:, 1]
              auc = roc_auc_score(y_val_cv, y_pred_proba)
              cv_scores.append(auc)
              
              print(f"Fold {fold} AUC: {auc:.4f}")
          
          print(f"\nCross-validation AUC: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores):.4f})")
          
          return cv_scores
      
      def evaluate(self, X_test, y_test):
          """Comprehensive evaluation"""
          
          y_pred_proba = self.model.predict_proba(X_test)[:, 1]
          y_pred = (y_pred_proba >= 0.5).astype(int)
          
          # AUC-ROC
          auc = roc_auc_score(y_test, y_pred_proba)
          print(f"\nTest AUC-ROC: {auc:.4f}")
          
          # Confusion matrix
          cm = confusion_matrix(y_test, y_pred)
          print("\nConfusion Matrix:")
          print(cm)
          
          # Precision-Recall at different thresholds
          precisions, recalls, thresholds = precision_recall_curve(y_test, y_pred_proba)
          
          print("\nPrecision-Recall at key thresholds:")
          for threshold in [0.3, 0.5, 0.7]:
              idx = np.argmin(np.abs(thresholds - threshold))
              print(f"Threshold {threshold}: Precision={precisions[idx]:.3f}, Recall={recalls[idx]:.3f}")
          
          # Feature importance
          feature_importance = self.model.feature_importances_
          top_10_idx = np.argsort(feature_importance)[-10:]
          
          print("\nTop 10 Most Important Features:")
          for idx in reversed(top_10_idx):
              print(f"Feature {idx}: {feature_importance[idx]:.4f}")
          
          return {
              'auc': auc,
              'confusion_matrix': cm,
              'feature_importance': feature_importance
          }
      
      def save_model(self, path: str):
          """Save trained model"""
          joblib.dump(self.model, path)
          print(f"Model saved to {path}")
      
      def load_model(self, path: str):
          """Load trained model"""
          self.model = joblib.load(path)
          print(f"Model loaded from {path}")
  ```
- [ ] Create training script:
  ```python
  # scripts/train_model.py
  from src.models.trainer import FraudModelTrainer
  from src.features.preprocessing import DataPreprocessor
  
  def main():
      # Load preprocessed data
      preprocessor = DataPreprocessor()
      preprocessor.load_scaler('models/scaler.pkl')
      
      df = preprocessor.load_data('data/processed/transactions_processed.parquet')
      
      # Split data
      X_train, X_test, y_train, y_test = preprocessor.split_data(df)
      
      print(f"Training set: {len(X_train)} samples")
      print(f"Test set: {len(X_test)} samples")
      print(f"Fraud rate: {y_train.mean():.2%}")
      
      # Train model
      trainer = FraudModelTrainer()
      
      # Cross-validation
      trainer.cross_validate(X_train, y_train)
      
      # Final training
      trainer.train(X_train, y_train, X_test, y_test)
      
      # Evaluation
      metrics = trainer.evaluate(X_test, y_test)
      
      # Save model
      trainer.save_model('models/fraud_model_v1.pkl')
      
      print("\nTraining complete!")
  
  if __name__ == '__main__':
      main()
  ```
- [ ] Run training and record metrics
- [ ] Save model artifacts

---

### Developer 4: Full-Stack Integration - **FRONTEND-BACKEND CONNECTION**
**Days 8-9: Database Implementation (Drizzle ORM 0.38)**
- [ ] Run migrations on Render PostgreSQL:
  ```bash
  cd backend
  npx drizzle-kit migrate
  ```
- [ ] Create database connection helper:
  ```typescript
  // src/config/database.ts
  import { drizzle } from 'drizzle-orm/postgres-js'
  import postgres from 'postgres'
  import * as schema from '@/db/schema'
  
  const connectionString = process.env.DATABASE_URL!
  
  // Connection for migrations
  export const migrationClient = postgres(connectionString, { max: 1 })
  
  // Connection for queries
  const queryClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  })
  
  export const db = drizzle(queryClient, { schema })
  ```
- [ ] Create seed data script:
  ```typescript
  // scripts/seed.ts
  import { db } from '@/config/database'
  import { merchants, transactions } from '@/db/schema'
  import { faker } from '@faker-js/faker'
  
  async function seed() {
      console.log('Seeding database...')
      
      // Create test merchants
      const merchantsData = Array.from({ length: 5 }, () => ({
          email: faker.internet.email(),
          name: faker.company.name(),
          apiKey: faker.string.alphanumeric(32),
          industryCategory: faker.helpers.arrayElement(['ecommerce', 'saas', 'retail'])
      }))
      
      const insertedMerchants = await db.insert(merchants).values(merchantsData).returning()
      
      console.log(`Created ${insertedMerchants.length} merchants`)
      
      // Create test transactions
      const transactionsData = Array.from({ length: 100 }, () => ({
          merchantId: faker.helpers.arrayElement(insertedMerchants).id,
          buyerEmail: faker.internet.email(),
          amount: faker.number.float({ min: 10, max: 1000, precision: 0.01 }).toString(),
          riskScore: faker.number.float({ min: 0, max: 1, precision: 0.01 }).toString(),
          riskCategory: faker.helpers.arrayElement(['GREEN', 'YELLOW', 'RED']),
          status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'DECLINED']),
          deviceData: {
              device_id: faker.string.uuid(),
              ip_address: faker.internet.ip()
          },
          sessionData: {
              time_on_site_seconds: faker.number.int({ min: 30, max: 600 })
          },
          cartItems: []
      }))
      
      await db.insert(transactions).values(transactionsData)
      
      console.log(`Created ${transactionsData.length} transactions`)
      console.log('Seeding complete!')
  }
  
  seed()
  ```

**Days 10-11: Redis Caching Layer (ioredis 5.4)**
- [ ] Implement Redis client:
  ```typescript
  // src/config/redis.ts
  import Redis from 'ioredis'
  
  const redisUrl = process.env.REDIS_URL!
  
  export const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
      }
  })
  
  redis.on('connect', () => {
      console.log('Redis connected')
  })
  
  redis.on('error', (err) => {
      console.error('Redis error:', err)
  })
  ```
- [ ] Create caching service:
  ```typescript
  // src/services/cache.service.ts
  import { redis } from '@/config/redis'
  
  class CacheService {
      async get<T>(key: string): Promise<T | null> {
          const value = await redis.get(key)
          return value ? JSON.parse(value) : null
      }
      
      async set(key: string, value: any, ttlSeconds: number): Promise<void> {
          await redis.setex(key, ttlSeconds, JSON.stringify(value))
      }
      
      async del(key: string): Promise<void> {
          await redis.del(key)
      }
      
      // Device reputation cache (24h)
      async getDeviceReputation(deviceId: string): Promise<number | null> {
          return this.get(`device:${deviceId}:reputation`)
      }
      
      async setDeviceReputation(deviceId: string, score: number): Promise<void> {
          await this.set(`device:${deviceId}:reputation`, score, 86400) // 24h
      }
      
      // Buyer profile cache (1h)
      async getBuyerProfile(email: string): Promise<any> {
          return this.get(`buyer:${email}:profile`)
      }
      
      async setBuyerProfile(email: string, profile: any): Promise<void> {
          await this.set(`buyer:${email}:profile`, profile, 3600) // 1h
      }
      
      // Risk score cache (15min)
      async getRiskScore(transactionId: string): Promise<any> {
          return this.get(`risk:${transactionId}`)
      }
      
      async setRiskScore(transactionId: string, score: any): Promise<void> {
          await this.set(`risk:${transactionId}`, score, 900) // 15min
      }
  }
  
  export const cacheService = new CacheService()
  ```
- [ ] Write cache tests

**Days 12-14: 🔥 **FRONTEND-BACKEND INTEGRATION** 🔥**
- [ ] **TEST 1: Authentication Flow End-to-End**
  ```typescript
  // Backend: Ensure auth endpoints work
  // Test with cURL:
  curl -X POST http://localhost:3001/api/v1/merchants/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123",
      "name": "Test Merchant"
    }'
  
  curl -X POST http://localhost:3001/api/v1/merchants/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }'
  ```
  ```typescript
  // Frontend: Test login component
  // app/(auth)/login/page.tsx
  const handleLogin = async (data: LoginForm) => {
      try {
          const response = await api.post('/merchants/login', data)
          const { token, merchant } = response.data
          
          // Store in Zustand
          useAuthStore.getState().login(token, merchant)
          
          // Redirect to dashboard
          router.push('/dashboard')
      } catch (error) {
          toast.error('Login failed')
      }
  }
  ```
  - [ ] Start backend: `cd backend && npm run dev` (should run on port 3001)
  - [ ] Start frontend: `cd frontend && npm run dev` (should run on port 3000)
  - [ ] Test registration flow in browser
  - [ ] Test login flow in browser
  - [ ] Verify JWT token is stored in localStorage
  - [ ] Verify protected routes redirect to login when unauthenticated
  
- [ ] **TEST 2: Transaction List Display**
  ```typescript
  // Backend: Verify transactions endpoint
  curl -X GET http://localhost:3001/api/v1/transactions \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
  ```typescript
  // Frontend: Verify table displays data
  // components/tables/transactions-table.tsx
  const { data, isLoading, error } = useQuery({
      queryKey: ['transactions'],
      queryFn: () => api.get('/transactions').then(r => r.data)
  })
  
  console.log('Transactions data:', data)
  ```
  - [ ] Seed database with test transactions
  - [ ] Navigate to `/dashboard/transactions`
  - [ ] Verify AG Grid displays transactions
  - [ ] Test sorting and filtering
  - [ ] Test pagination
  
- [ ] **TEST 3: Real-time WebSocket Connection**
  ```typescript
  // Backend: WebSocket server (Socket.io 4.8)
  // src/server.ts
  import { Server as SocketIOServer } from 'socket.io'
  
  const io = new SocketIOServer(server, {
      cors: {
          origin: process.env.FRONTEND_URL,
          methods: ['GET', 'POST']
      }
  })
  
  io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('subscribe:merchant', (merchantId) => {
          socket.join(`merchant:${merchantId}`)
      })
      
      socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
      })
  })
  
  // Emit events when new transactions arrive
  export function emitNewTransaction(merchantId: string, transaction: any) {
      io.to(`merchant:${merchantId}`).emit('transaction:new', transaction)
  }
  ```
  ```typescript
  // Frontend: Socket.io client
  // lib/socket.ts
  import { io, Socket } from 'socket.io-client'
  
  let socket: Socket | null = null
  
  export function initializeSocket(merchantId: string) {
      socket = io(process.env.NEXT_PUBLIC_API_URL!, {
          auth: {
              token: localStorage.getItem('auth_token')
          }
      })
      
      socket.on('connect', () => {
          console.log('Socket connected')
          socket?.emit('subscribe:merchant', merchantId)
      })
      
      socket.on('transaction:new', (transaction) => {
          console.log('New transaction:', transaction)
          // Invalidate React Query cache to refetch
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
      })
      
      return socket
  }
  ```
  ```typescript
  // Frontend: Use in dashboard
  // app/(dashboard)/page.tsx
  useEffect(() => {
      const merchantId = user?.id
      if (merchantId) {
          const socket = initializeSocket(merchantId)
          return () => socket.disconnect()
      }
  }, [user])
  ```
  - [ ] Test WebSocket connection in browser DevTools (Network tab)
  - [ ] Trigger new transaction from backend (via API call)
  - [ ] Verify frontend receives real-time update
  - [ ] Verify dashboard auto-refreshes
  
- [ ] **TEST 4: Risk Check API Integration**
  ```bash
  # Backend: Test risk check endpoint
  curl -X POST http://localhost:3001/api/v1/risk-check \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "buyer_email": "buyer@example.com",
      "amount": 100.00,
      "device_data": {
        "device_id": "abc123",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0"
      },
      "session_data": {
        "time_on_site_seconds": 120,
        "pages_visited": 5,
        "checkout_speed_seconds": 30
      },
      "cart_items": []
    }'
  ```
  ```typescript
  // Frontend: Test risk check mutation
  // lib/api/mutations.ts
  export function useRiskCheck() {
      return useMutation({
          mutationFn: (data: RiskCheckRequest) =>
              api.post('/risk-check', data).then(r => r.data),
          onSuccess: (data) => {
              console.log('Risk check result:', data)
              toast.success(`Risk Score: ${data.overall_score}`)
          }
      })
  }
  ```
  - [ ] Create test page or button to trigger risk check
  - [ ] Submit risk check request from frontend
  - [ ] Verify response shows risk score
  - [ ] Verify mock risk score displays correctly
  
- [ ] **TEST 5: Error Handling**
  - [ ] Test with invalid JWT token (should get 401)
  - [ ] Test with missing required fields (should get 400)
  - [ ] Test with database down (should handle gracefully)
  - [ ] Verify error messages display in frontend
  
- [ ] **TEST 6: CORS Configuration**
  ```typescript
  // Backend: Verify CORS allows frontend origin
  // src/server.ts
  await fastify.register(cors, {
      origin: [
          'http://localhost:3000',
          'https://payguard-frontend.onrender.com'
      ],
      credentials: true
  })
  ```
  - [ ] Test API calls from frontend
  - [ ] Verify no CORS errors in browser console
  
- [ ] **Integration Checklist:**
  - [ ] Backend runs on `http://localhost:3001`
  - [ ] Frontend runs on `http://localhost:3000`
  - [ ] Frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
  - [ ] Backend `.env` has `FRONTEND_URL=http://localhost:3000`
  - [ ] Authentication works (register + login)
  - [ ] Protected routes redirect correctly
  - [ ] Transaction list displays data
  - [ ] WebSocket connection established
  - [ ] Real-time updates work
  - [ ] Risk check API responds
  - [ ] Error handling works
  - [ ] No CORS errors

- [ ] **Write Integration Test Suite:**
  ```typescript
  // tests/integration/auth.test.ts
  import { describe, it, expect, beforeAll } from 'vitest'
  import axios from 'axios'
  
  const API_URL = 'http://localhost:3001/api/v1'
  
  describe('Authentication Integration', () => {
      let authToken: string
      
      it('should register new merchant', async () => {
          const response = await axios.post(`${API_URL}/merchants/register`, {
              email: 'integration@test.com',
              password: 'test123456',
              name: 'Integration Test'
          })
          
          expect(response.status).toBe(201)
          expect(response.data).toHaveProperty('apiKey')
      })
      
      it('should login merchant', async () => {
          const response = await axios.post(`${API_URL}/merchants/login`, {
              email: 'integration@test.com',
              password: 'test123456'
          })
          
          expect(response.status).toBe(200)
          expect(response.data).toHaveProperty('token')
          
          authToken = response.data.token
      })
      
      it('should access protected route with token', async () => {
          const response = await axios.get(`${API_URL}/transactions`, {
              headers: {
                  'Authorization': `Bearer ${authToken}`
              }
          })
          
          expect(response.status).toBe(200)
          expect(Array.isArray(response.data.transactions)).toBe(true)
      })
  })
  ```
  ```bash
  # Run integration tests
  npm run test:integration
  ```

---

## 📋 Summary: Week 1-2 Deliverables

### Developer 1 (Backend):
✅ PayPal sandbox configured  
✅ Fastify 5.1 backend with latest dependencies  
✅ Drizzle ORM schemas and migrations  
✅ PayPal service (OAuth, orders, webhooks)  
✅ REST API routes (auth, merchants, transactions)  
✅ JWT authentication with Lucia 4.0  
✅ Scalar API documentation

### Developer 2 (Frontend):
✅ Next.js 15.1 + React 19 project  
✅ shadcn/ui design system  
✅ Dashboard layout with navigation  
✅ Transaction table with AG Grid 32.3  
✅ TanStack Query integration  
✅ Zustand auth store  
✅ Authentication UI (login/register)

### Developer 3 (ML):
✅ Python 3.12 environment  
✅ Synthetic data generation (Polars 1.15)  
✅ Feature extractor (50+ features)  
✅ Data preprocessing pipeline  
✅ Initial XGBoost model training  
✅ Model evaluation metrics

### Developer 4 (DevOps + Integration):
✅ PostgreSQL 17 + Redis 7.4 + Elastic 8.16  
✅ GitHub Actions CI/CD  
✅ Docker Compose local env  
✅ Database migrations and seeding  
✅ Redis caching service  
✅ **FRONTEND-BACKEND INTEGRATION COMPLETE**  
✅ End-to-end tests passing

---

## Next: Week 3-8

I'll create the remaining weeks (3-8) focusing on:
- ML inference integration
- Real-time risk scoring
- Advanced visualizations (Bryntum, Chart.js)
- Continuous learning pipeline
- Demo preparation
- **Explicit integration points at every step**

Would you like me to continue with Week 3-8 detailed tasks?
