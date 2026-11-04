import * as dotenv from 'dotenv'
dotenv.config()

import { db } from '../src/config/database.js'
import { merchants, transactions } from '../src/db/schema.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const API_KEY_SALT = process.env.API_KEY_SALT || 'nT8xW1yU4zV7cB9mL2oP5qR3sN6tH0kJ4iF8gD1eA7wX'

async function generateApiKey() {
  const random = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHmac('sha256', API_KEY_SALT).update(random).digest('hex')
  return `pk_${hash.substring(0, 48)}`
}

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    const demoMerchants = [
      {
        email: 'demo@payguard.ai',
        passwordHash: await bcrypt.hash('Demo123!', 12),
        name: 'Demo Merchant',
        apiKey: await generateApiKey(),
        industryCategory: 'E-commerce',
        isActive: true
      },
      {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Test123!', 12),
        name: 'Test Store',
        apiKey: await generateApiKey(),
        industryCategory: 'Retail',
        isActive: true
      }
    ]

    console.log('📝 Inserting merchants...')
    const insertedMerchants = await db.insert(merchants).values(demoMerchants).returning()
    console.log(`✅ Created ${insertedMerchants.length} merchants`)

    const sampleTransactions = [
      {
        merchantId: insertedMerchants[0].id,
        buyerEmail: 'buyer1@example.com',
        amount: '99.99',
        currency: 'USD',
        riskScore: '0.25',
        riskCategory: 'GREEN',
        status: 'COMPLETED',
        paypalOrderId: `ORDER_${crypto.randomBytes(8).toString('hex')}`,
        paypalCaptureId: `CAPTURE_${crypto.randomBytes(8).toString('hex')}`
      }
    ]

    console.log('📝 Inserting transactions...')
    const insertedTransactions = await db.insert(transactions).values(sampleTransactions).returning()
    console.log(`✅ Created ${insertedTransactions.length} transactions`)

    console.log('\n📋 Demo Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    insertedMerchants.forEach((merchant, index) => {
      console.log(`\nMerchant ${index + 1}:`)
      console.log(`  Email: ${merchant.email}`)
      console.log(`  Password: ${index === 0 ? 'Demo123!' : 'Test123!'}`)
      console.log(`  API Key: ${merchant.apiKey}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✅ Database seeding completed!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seed()
