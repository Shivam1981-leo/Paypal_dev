import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authService } from '@/services/auth.service'
import { verifyJWT } from '@/middleware/auth.middleware'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(255),
  industryCategory: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8).max(100)
})

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/register
   * Register a new merchant account
   */
  fastify.post('/auth/register', async (request, reply) => {
    const data = registerSchema.parse(request.body)

    try {
      const merchant = await authService.register(data)

      // Generate JWT
      const token = fastify.jwt.sign({
        id: merchant.id,
        merchantId: merchant.id,
        email: merchant.email,
        name: merchant.name,
        apiKey: merchant.apiKey,
        isActive: merchant.isActive
      })

      return reply.status(201).send({
        message: 'Registration successful',
        merchant,
        token
      })
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        return reply.status(409).send({ error: error.message })
      }
      throw error
    }
  })

  /**
   * POST /auth/login
   * Login to merchant account
   */
  fastify.post('/auth/login', async (request, reply) => {
    const data = loginSchema.parse(request.body)

    try {
      const merchant = await authService.login(data.email, data.password)

      // Generate JWT
      const token = fastify.jwt.sign({
        id: merchant.id,
        merchantId: merchant.id,
        email: merchant.email,
        name: merchant.name,
        apiKey: merchant.apiKey,
        isActive: merchant.isActive
      })

      return reply.send({
        message: 'Login successful',
        merchant,
        token
      })
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'Account is disabled') {
        return reply.status(401).send({ error: error.message })
      }
      throw error
    }
  })

  /**
   * GET /auth/me
   * Get current merchant info
   */
  fastify.get('/auth/me', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    return reply.send({
      merchant: request.merchant
    })
  })

  /**
   * POST /auth/api-key/regenerate
   * Regenerate API key
   */
  fastify.post('/auth/api-key/regenerate', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    const newApiKey = await authService.regenerateApiKey(request.merchant!.id)

    return reply.send({
      message: 'API key regenerated',
      apiKey: newApiKey
    })
  })

  /**
   * POST /auth/password/change
   * Change password
   */
  fastify.post('/auth/password/change', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    const data = changePasswordSchema.parse(request.body)

    try {
      await authService.changePassword(
        request.merchant!.id,
        data.oldPassword,
        data.newPassword
      )

      return reply.send({
        message: 'Password changed successfully'
      })
    } catch (error: any) {
      if (error.message === 'Invalid current password') {
        return reply.status(400).send({ error: error.message })
      }
      throw error
    }
  })

  /**
   * POST /auth/logout
   * Logout (client-side token removal)
   */
  fastify.post('/auth/logout', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    return reply.send({
      message: 'Logout successful'
    })
  })
}
