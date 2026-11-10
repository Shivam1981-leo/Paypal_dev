import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Elasticsearch
  ELASTIC_NODE: z.string().url().default('http://localhost:9200'),

  // PayPal
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_CLIENT_ID: z.string().min(1),
  PAYPAL_SECRET: z.string().min(1),
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),

  // API Keys
  API_KEY_SALT: z.string().min(32),

  // ML Service
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000')
})

export type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
  console.log('✅ Environment variables validated')
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:')
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`)
    })
    process.exit(1)
  }
  throw error
}

export { env }
