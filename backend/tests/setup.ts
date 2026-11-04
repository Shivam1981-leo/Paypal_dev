import { beforeAll, afterAll } from 'vitest'
import * as dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

beforeAll(async () => {
  console.log('🧪 Setting up test environment...')
  // Add test setup here (e.g., database migrations, seed data)
})

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...')
  // Add test cleanup here
})
