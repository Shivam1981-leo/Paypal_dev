# PayGuard AI - Backend Implementation Plan

**Developer:** Backend Lead (You)  
**Timeline:** Week 1-2 (November 4-15, 2026)  
**Tech Stack:** Fastify 5.1, Drizzle ORM 0.38, PostgreSQL 17, Node.js 22.11  
**Status:** 🚀 Ready to Start

---

## 🎯 Backend Implementation Goals

### Week 1 Goals:
1. ✅ Set up Fastify backend with TypeScript
2. ✅ Configure Drizzle ORM with PostgreSQL
3. ✅ Implement PayPal OAuth and API integration
4. ✅ Build webhook system with signature verification
5. ✅ Set up Redis caching layer

### Week 2 Goals:
1. ✅ Build REST API routes (auth, merchants, transactions)
2. ✅ Implement JWT authentication with Lucia
3. ✅ Create risk check endpoint (placeholder for ML)
4. ✅ Set up WebSocket server for real-time updates
5. ✅ Write comprehensive tests

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Drizzle connection
│   │   ├── redis.ts             # Redis client
│   │   ├── elastic.ts           # Elasticsearch client
│   │   └── env.ts               # Environment validation
│   ├── db/
│   │   ├── schema.ts            # Drizzle schemas
│   │   └── migrations/          # Migration files
│   ├── services/
│   │   ├── paypal.service.ts    # PayPal API wrapper
│   │   ├── webhook.service.ts   # Webhook processing
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── merchant.service.ts  # Merchant CRUD
│   │   ├── transaction.service.ts
│   │   ├── cache.service.ts     # Redis caching
│   │   └── risk-engine.service.ts  # ML integration (later)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── merchants.routes.ts
│   │   ├── transactions.routes.ts
│   │   ├── risk-check.routes.ts
│   │   └── webhook.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── error.middleware.ts  # Error handling
│   │   └── validate.middleware.ts  # Zod validation
│   ├── types/
│   │   ├── index.ts
│   │   └── paypal.types.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── crypto.ts
│   └── server.ts                # Main server file
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/
│   ├── seed.ts                  # Database seeding
│   └── migrate.ts               # Run migrations
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── vitest.config.ts
└── README.md
```

---

## 🚀 Phase 1: Project Initialization (30 minutes)

### Step 1: Create Backend Directory
```bash
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Core Dependencies (November 2026 Latest)
```bash
# Framework
npm install fastify@5.1.0 @fastify/cors@10.0.0 @fastify/jwt@9.0.0
npm install @fastify/websocket@11.0.0 @fastify/rate-limit@10.0.0
npm install @fastify/helmet@12.0.0

# Database & ORM
npm install drizzle-orm@0.38.0 drizzle-kit@0.27.0
npm install postgres@3.4.4

# Caching & Search
npm install ioredis@5.4.0
npm install @elastic/elasticsearch@8.16.0

# Validation & Security
npm install zod@3.24.0
npm install bcrypt@5.1.1
npm install @types/bcrypt

# API Documentation
npm install @scalar/fastify-api-reference@2.0.0

# HTTP Client for PayPal
npm install axios@1.8.0

# Development Dependencies
npm install -D typescript@5.7.0
npm install -D @types/node@22.9.0
npm install -D tsx@4.19.1
npm install -D vitest@2.1.0
npm install -D @vitest/ui@2.1.0
npm install -D eslint@9.14.0
npm install -D prettier@3.3.3
```

### Step 3: TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Step 5: Environment Variables
```bash
# .env.example
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://payguard:dev_password@localhost:5432/payguard_dev

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTIC_NODE=http://localhost:9200

# PayPal Sandbox
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
PAYPAL_WEBHOOK_ID=

# JWT
JWT_SECRET=generate_with_openssl_rand_base64_32

# API Keys
API_KEY_SALT=generate_with_openssl_rand_base64_32
```

---

## 🗄️ Phase 2: Database Setup (1 hour)

### Step 1: Drizzle Schema Definition
```typescript
// src/db/schema.ts
import { pgTable, uuid, varchar, timestamp, decimal, jsonb, index, text, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Merchants table
export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
  industryCategory: varchar('industry_category', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  emailIdx: index('merchants_email_idx').on(table.email),
  apiKeyIdx: index('merchants_api_key_idx').on(table.apiKey)
}))

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => merchants.id).notNull(),
  buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  riskScore: decimal('risk_score', { precision: 4, scale: 3 }),
  riskCategory: varchar('risk_category', { length: 10 }), // GREEN, YELLOW, RED
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  paypalOrderId: varchar('paypal_order_id', { length: 50 }),
  paypalCaptureId: varchar('paypal_capture_id', { length: 50 }),
  deviceData: jsonb('device_data'),
  sessionData: jsonb('session_data'),
  cartItems: jsonb('cart_items'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  merchantIdIdx: index('transactions_merchant_id_idx').on(table.merchantId),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  riskCategoryIdx: index('transactions_risk_category_idx').on(table.riskCategory),
  statusIdx: index('transactions_status_idx').on(table.status)
}))

// Risk scores table
export const riskScores = pgTable('risk_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  overallScore: decimal('overall_score', { precision: 4, scale: 3 }).notNull(),
  mlScore: decimal('ml_score', { precision: 4, scale: 3 }),
  patternScore: decimal('pattern_score', { precision: 4, scale: 3 }),
  deviceScore: decimal('device_score', { precision: 4, scale: 3 }),
  flags: jsonb('flags').$type<string[]>(),
  explanation: jsonb('explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  transactionIdIdx: index('risk_scores_transaction_id_idx').on(table.transactionId)
}))

// Webhook events table
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  paypalEventId: varchar('paypal_event_id', { length: 100 }),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').default(false).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  eventTypeIdx: index('webhook_events_type_idx').on(table.eventType),
  processedIdx: index('webhook_events_processed_idx').on(table.processed)
}))

// Relations
export const merchantsRelations = relations(merchants, ({ many }) => ({
  transactions: many(transactions)
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id]
  }),
  riskScores: many(riskScores)
}))

export const riskScoresRelations = relations(riskScores, ({ one }) => ({
  transaction: one(transactions, {
    fields: [riskScores.transactionId],
    references: [transactions.id]
  })
}))

// Types
export type Merchant = typeof merchants.$inferSelect
export type NewMerchant = typeof merchants.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type RiskScore = typeof riskScores.$inferSelect
export type NewRiskScore = typeof riskScores.$inferInsert
```

### Step 2: Drizzle Configuration
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
})
```

### Step 3: Database Connection
```typescript
// src/config/database.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

// Connection for migrations
export const migrationClient = postgres(connectionString, { max: 1 })

// Connection for queries
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(queryClient, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

// Health check
export async function checkDatabaseConnection() {
  try {
    await queryClient`SELECT 1`
    console.log('✅ Database connected')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
```

### Step 4: Generate and Run Migrations
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio to view database
npm run db:studio
```

---

## 🔐 Phase 3: PayPal Integration (2 hours)

### Step 1: PayPal Service
```typescript
// src/services/paypal.service.ts
import axios, { AxiosInstance } from 'axios'

const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

interface PayPalTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface PayPalOrder {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

class PayPalService {
  private client: AxiosInstance
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.client = axios.create({
      baseURL: PAYPAL_API,
      timeout: 30000
    })
  }

  /**
   * Get OAuth access token with auto-refresh
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken
    }

    console.log('🔄 Refreshing PayPal access token...')

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64')

    try {
      const response = await axios.post<PayPalTokenResponse>(
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

      console.log('✅ PayPal access token refreshed')

      return this.accessToken
    } catch (error: any) {
      console.error('❌ Failed to get PayPal access token:', error.response?.data || error.message)
      throw new Error('Failed to authenticate with PayPal')
    }
  }

  /**
   * Create a PayPal order
   */
  async createOrder(amount: number, currency: string = 'USD'): Promise<PayPalOrder> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post<PayPalOrder>(
        '/v2/checkout/orders',
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
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      )

      console.log(`✅ PayPal order created: ${response.data.id}`)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to create PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to create PayPal order')
    }
  }

  /**
   * Capture a PayPal order
   */
  async captureOrder(orderId: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post(
        `/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      )

      console.log(`✅ PayPal order captured: ${orderId}`)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to capture PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to capture PayPal order')
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.get(
        `/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ Failed to get PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to get PayPal order details')
    }
  }

  /**
   * Search transactions (for ML training data)
   */
  async searchTransactions(startDate: string, endDate: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.get(
        '/v1/reporting/transactions',
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
    } catch (error: any) {
      console.error('❌ Failed to search PayPal transactions:', error.response?.data || error.message)
      throw new Error('Failed to search PayPal transactions')
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(webhookData: {
    authAlgo: string
    certUrl: string
    transmissionId: string
    transmissionSig: string
    transmissionTime: string
    webhookId: string
    webhookEvent: any
  }): Promise<boolean> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post(
        '/v1/notifications/verify-webhook-signature',
        webhookData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.verification_status === 'SUCCESS'
    } catch (error: any) {
      console.error('❌ Failed to verify webhook signature:', error.response?.data || error.message)
      return false
    }
  }
}

export const paypalService = new PayPalService()
```

### Step 2: Test PayPal Connection
```typescript
// scripts/test-paypal.ts
import { paypalService } from '../src/services/paypal.service'
import * as dotenv from 'dotenv'

dotenv.config()

async function testPayPal() {
  console.log('🧪 Testing PayPal Integration...\n')

  try {
    // Test 1: Get access token
    console.log('Test 1: Getting access token...')
    const token = await paypalService.getAccessToken()
    console.log('✅ Access token obtained:', token.substring(0, 20) + '...\n')

    // Test 2: Create order
    console.log('Test 2: Creating order...')
    const order = await paypalService.createOrder(100.00, 'USD')
    console.log('✅ Order created:', order.id)
    console.log('   Status:', order.status)
    console.log('   Approve URL:', order.links.find(l => l.rel === 'approve')?.href, '\n')

    // Test 3: Get order details
    console.log('Test 3: Getting order details...')
    const details = await paypalService.getOrderDetails(order.id)
    console.log('✅ Order details retrieved')
    console.log('   Amount:', details.purchase_units[0].amount.value, details.purchase_units[0].amount.currency_code, '\n')

    console.log('🎉 All PayPal tests passed!')
  } catch (error) {
    console.error('❌ PayPal test failed:', error)
    process.exit(1)
  }
}

testPayPal()
```

---

## 📋 Next Steps

### Immediate Tasks (This Session):
1. ✅ Initialize project structure
2. ✅ Install dependencies
3. ✅ Set up TypeScript configuration
4. ✅ Create database schema
5. ✅ Implement PayPal service
6. ✅ Test PayPal integration

### Next Session:
1. Build authentication service (Lucia + JWT)
2. Create API routes
3. Implement webhook handler
4. Set up Redis caching
5. Add WebSocket server
6. Write tests

---

## 🎯 Success Criteria

### Week 1:
- [ ] Backend server runs on port 3001
- [ ] Database migrations executed
- [ ] PayPal sandbox integration works
- [ ] Can create and capture orders
- [ ] Webhook signature verification works

### Week 2:
- [ ] All REST API endpoints functional
- [ ] Authentication flow complete
- [ ] WebSocket real-time updates working
- [ ] Integration tests passing
- [ ] Ready for frontend integration

---

**Ready to start building? Let's begin with Phase 1!** 🚀
