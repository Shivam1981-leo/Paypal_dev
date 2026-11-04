import bcrypt from 'bcrypt'
import { db } from '@/config/database'
import { merchants, type Merchant, type NewMerchant } from '@/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { env } from '@/config/env'

const BCRYPT_ROUNDS = 12

export class AuthService {
  /**
   * Register a new merchant
   */
  async register(data: {
    email: string
    password: string
    name: string
    industryCategory?: string
  }): Promise<Omit<Merchant, 'passwordHash'>> {
    // Check if email already exists
    const existing = await db.query.merchants.findFirst({
      where: eq(merchants.email, data.email)
    })

    if (existing) {
      throw new Error('Email already registered')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

    // Generate API key
    const apiKey = this.generateApiKey()

    // Create merchant
    const [merchant] = await db.insert(merchants).values({
      email: data.email,
      passwordHash,
      name: data.name,
      apiKey,
      industryCategory: data.industryCategory,
      isActive: true
    }).returning()

    // Remove password hash from response
    const { passwordHash: _, ...merchantData } = merchant
    return merchantData
  }

  /**
   * Login merchant
   */
  async login(email: string, password: string): Promise<Omit<Merchant, 'passwordHash'>> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.email, email)
    })

    if (!merchant) {
      throw new Error('Invalid credentials')
    }

    if (!merchant.isActive) {
      throw new Error('Account is disabled')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, merchant.passwordHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Remove password hash from response
    const { passwordHash: _, ...merchantData } = merchant
    return merchantData
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string): Promise<Omit<Merchant, 'passwordHash'> | null> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.apiKey, apiKey)
    })

    if (!merchant || !merchant.isActive) {
      return null
    }

    const { passwordHash: _, ...merchantData } = merchant
    return merchantData
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(merchantId: string): Promise<string> {
    const newApiKey = this.generateApiKey()

    await db.update(merchants)
      .set({
        apiKey: newApiKey,
        updatedAt: new Date()
      })
      .where(eq(merchants.id, merchantId))

    return newApiKey
  }

  /**
   * Generate secure API key
   */
  private generateApiKey(): string {
    const random = crypto.randomBytes(32).toString('hex')
    const hash = crypto
      .createHmac('sha256', env.API_KEY_SALT)
      .update(random)
      .digest('hex')
    return `pk_${hash.substring(0, 48)}`
  }

  /**
   * Change password
   */
  async changePassword(merchantId: string, oldPassword: string, newPassword: string): Promise<void> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, merchantId)
    })

    if (!merchant) {
      throw new Error('Merchant not found')
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, merchant.passwordHash)
    if (!isValid) {
      throw new Error('Invalid current password')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    await db.update(merchants)
      .set({
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(merchants.id, merchantId))
  }
}

export const authService = new AuthService()
