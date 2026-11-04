import { describe, it, expect, beforeAll } from 'vitest'
import { authService } from '../../src/services/auth.service'
import { db } from '../../src/config/database'
import { merchants } from '../../src/db/schema'
import { eq } from 'drizzle-orm'

describe('AuthService', () => {
  const testMerchant = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test Merchant'
  }

  // Clean up before tests
  beforeAll(async () => {
    await db.delete(merchants).where(eq(merchants.email, testMerchant.email))
  })

  describe('register', () => {
    it('should register a new merchant', async () => {
      const merchant = await authService.register(testMerchant)

      expect(merchant).toBeDefined()
      expect(merchant.email).toBe(testMerchant.email)
      expect(merchant.name).toBe(testMerchant.name)
      expect(merchant.apiKey).toMatch(/^pk_/)
      expect(merchant).not.toHaveProperty('passwordHash')
    })

    it('should throw error for duplicate email', async () => {
      await expect(
        authService.register(testMerchant)
      ).rejects.toThrow('Email already registered')
    })

    it('should generate unique API keys', async () => {
      const merchant1 = await authService.register({
        email: 'test1@example.com',
        password: 'Pass123!',
        name: 'Merchant 1'
      })

      const merchant2 = await authService.register({
        email: 'test2@example.com',
        password: 'Pass123!',
        name: 'Merchant 2'
      })

      expect(merchant1.apiKey).not.toBe(merchant2.apiKey)
    })
  })

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const merchant = await authService.login(
        testMerchant.email,
        testMerchant.password
      )

      expect(merchant).toBeDefined()
      expect(merchant.email).toBe(testMerchant.email)
      expect(merchant).not.toHaveProperty('passwordHash')
    })

    it('should throw error for wrong password', async () => {
      await expect(
        authService.login(testMerchant.email, 'WrongPassword')
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('verifyApiKey', () => {
    it('should verify valid API key', async () => {
      const registered = await authService.register({
        email: 'apitest@example.com',
        password: 'Pass123!',
        name: 'API Test'
      })

      const merchant = await authService.verifyApiKey(registered.apiKey)

      expect(merchant).toBeDefined()
      expect(merchant?.email).toBe('apitest@example.com')
    })

    it('should return null for invalid API key', async () => {
      const merchant = await authService.verifyApiKey('invalid_key')
      expect(merchant).toBeNull()
    })
  })
})
