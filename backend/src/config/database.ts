import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema.js'

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
