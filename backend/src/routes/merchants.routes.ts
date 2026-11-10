import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { merchantService } from '@/services/merchant.service'
import { verifyJWT } from '@/middleware/auth.middleware'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  industryCategory: z.string().max(100).optional()
})

const statisticsQuerySchema = z.object({
  days: z.string().transform(Number).default('30')
})

export async function merchantsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /merchants/profile
   * Get current merchant profile
   */
  fastify.get('/merchants/profile', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    const merchant = await merchantService.getById(request.merchant!.id)

    if (!merchant) {
      return reply.status(404).send({ error: 'Merchant not found' })
    }

    return reply.send({ merchant })
  })

  /**
   * PUT /merchants/profile
   * Update merchant profile
   */
  fastify.put('/merchants/profile', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    const data = updateProfileSchema.parse(request.body)

    const merchant = await merchantService.updateProfile(
      request.merchant!.id,
      data
    )

    return reply.send({
      message: 'Profile updated',
      merchant
    })
  })

  /**
   * GET /merchants/statistics
   * Get merchant statistics
   */
  fastify.get('/merchants/statistics', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    const { days } = statisticsQuerySchema.parse(request.query)

    const statistics = await merchantService.getStatistics(
      request.merchant!.id,
      days
    )

    return reply.send({ statistics })
  })

  /**
   * POST /merchants/deactivate
   * Deactivate merchant account
   */
  fastify.post('/merchants/deactivate', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    await merchantService.deactivate(request.merchant!.id)

    return reply.send({
      message: 'Account deactivated'
    })
  })

  /**
   * POST /merchants/reactivate
   * Reactivate merchant account
   */
  fastify.post('/merchants/reactivate', {
    preHandler: verifyJWT
  }, async (request, reply) => {
    await merchantService.reactivate(request.merchant!.id)

    return reply.send({
      message: 'Account reactivated'
    })
  })
}
