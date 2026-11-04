import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { transactionService } from '@/services/transaction.service'
import { verifyAuth } from '@/middleware/auth.middleware'

const createTransactionSchema = z.object({
  buyerEmail: z.string().email(),
  amount: z.number().positive().max(999999.99),
  currency: z.string().length(3).default('USD'),
  deviceData: z.any().optional(),
  sessionData: z.any().optional(),
  cartItems: z.array(z.any()).optional()
})

const capturePaymentSchema = z.object({
  orderId: z.string()
})

const getTransactionsQuerySchema = z.object({
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
  status: z.string().optional(),
  riskCategory: z.string().optional()
})

export async function transactionsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /transactions
   * Create a new transaction
   */
  fastify.post('/transactions', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const data = createTransactionSchema.parse(request.body)

    const result = await transactionService.createTransaction({
      merchantId: request.merchant!.id,
      ...data
    })

    return reply.status(201).send({
      message: 'Transaction created',
      transaction: result.transaction,
      paypalOrder: result.paypalOrder
    })
  })

  /**
   * POST /transactions/:id/capture
   * Capture payment for a transaction
   */
  fastify.post('/transactions/:id/capture', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { orderId } = capturePaymentSchema.parse(request.body)

    const result = await transactionService.capturePayment(id, orderId)

    return reply.send({
      message: 'Payment captured',
      transaction: result.transaction,
      riskScore: result.riskScore
    })
  })

  /**
   * GET /transactions/:id
   * Get transaction by ID
   */
  fastify.get('/transactions/:id', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const transaction = await transactionService.getById(id)

    if (!transaction) {
      return reply.status(404).send({ error: 'Transaction not found' })
    }

    // Verify merchant owns this transaction
    if (transaction.merchantId !== request.merchant!.id) {
      return reply.status(403).send({ error: 'Access denied' })
    }

    return reply.send({ transaction })
  })

  /**
   * GET /transactions
   * Get all transactions for current merchant
   */
  fastify.get('/transactions', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const query = getTransactionsQuerySchema.parse(request.query)

    const result = await transactionService.getMerchantTransactions(
      request.merchant!.id,
      query
    )

    return reply.send({
      transactions: result.transactions,
      total: result.total,
      limit: query.limit,
      offset: query.offset
    })
  })

  /**
   * GET /transactions/high-risk
   * Get recent high-risk transactions
   */
  fastify.get('/transactions/high-risk', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const transactions = await transactionService.getHighRiskTransactions(
      request.merchant!.id
    )

    return reply.send({ transactions })
  })
}
