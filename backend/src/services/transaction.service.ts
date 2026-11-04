import { db } from '@/config/database'
import { transactions, riskScores, type Transaction, type NewTransaction, type NewRiskScore } from '@/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { paypalService } from './paypal.service'
import { search } from '@/config/elastic'
import { cache } from '@/config/redis'

export class TransactionService {
  /**
   * Create a new transaction with PayPal order
   */
  async createTransaction(data: {
    merchantId: string
    buyerEmail: string
    amount: number
    currency?: string
    deviceData?: any
    sessionData?: any
    cartItems?: any
  }): Promise<{
    transaction: Transaction
    paypalOrder: any
  }> {
    // Create PayPal order
    const paypalOrder = await paypalService.createOrder(data.amount, data.currency || 'USD')

    // Store transaction in database
    const [transaction] = await db.insert(transactions).values({
      merchantId: data.merchantId,
      buyerEmail: data.buyerEmail,
      amount: data.amount.toString(),
      currency: data.currency || 'USD',
      status: 'PENDING',
      paypalOrderId: paypalOrder.id,
      deviceData: data.deviceData,
      sessionData: data.sessionData,
      cartItems: data.cartItems
    }).returning()

    // Index in Elasticsearch for search
    await search.indexTransaction(transaction.id, {
      ...transaction,
      createdAt: transaction.createdAt.toISOString()
    })

    return {
      transaction,
      paypalOrder
    }
  }

  /**
   * Capture PayPal payment and perform risk check
   */
  async capturePayment(transactionId: string, orderId: string): Promise<{
    transaction: Transaction
    riskScore: any
  }> {
    // Get transaction
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId)
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction is not in PENDING state')
    }

    // Capture PayPal payment
    const captureData = await paypalService.captureOrder(orderId)

    // Perform risk check (placeholder - will be ML model later)
    const riskScore = await this.performRiskCheck(transaction)

    // Update transaction
    const [updated] = await db.update(transactions)
      .set({
        status: 'COMPLETED',
        paypalCaptureId: captureData.id,
        riskScore: riskScore.overallScore.toString(),
        riskCategory: riskScore.category,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transactionId))
      .returning()

    // Store risk score
    await db.insert(riskScores).values({
      transactionId: transaction.id,
      overallScore: riskScore.overallScore.toString(),
      mlScore: riskScore.mlScore.toString(),
      patternScore: riskScore.patternScore.toString(),
      deviceScore: riskScore.deviceScore.toString(),
      flags: riskScore.flags,
      explanation: riskScore.explanation
    })

    // Update cache
    await cache.del(`transaction:${transactionId}`)
    await cache.invalidatePattern(`merchant:stats:${transaction.merchantId}:*`)

    return {
      transaction: updated,
      riskScore
    }
  }

  /**
   * Perform risk check (placeholder for ML model)
   */
  private async performRiskCheck(transaction: Transaction): Promise<{
    overallScore: number
    mlScore: number
    patternScore: number
    deviceScore: number
    category: 'GREEN' | 'YELLOW' | 'RED'
    flags: string[]
    explanation: any
  }> {
    // This is a placeholder - will be replaced with actual ML model
    const flags: string[] = []

    // Simple heuristics for demo
    const amount = parseFloat(transaction.amount)
    let mlScore = 0.5
    let patternScore = 0.5
    let deviceScore = 0.5

    // Check amount (high amounts are riskier)
    if (amount > 1000) {
      mlScore += 0.2
      flags.push('HIGH_AMOUNT')
    }

    // Check device data
    if (!transaction.deviceData) {
      deviceScore += 0.3
      flags.push('NO_DEVICE_DATA')
    }

    // Calculate overall score
    const overallScore = (mlScore + patternScore + deviceScore) / 3

    // Determine category
    let category: 'GREEN' | 'YELLOW' | 'RED'
    if (overallScore < 0.3) {
      category = 'GREEN'
    } else if (overallScore < 0.7) {
      category = 'YELLOW'
    } else {
      category = 'RED'
    }

    return {
      overallScore: parseFloat(overallScore.toFixed(3)),
      mlScore: parseFloat(mlScore.toFixed(3)),
      patternScore: parseFloat(patternScore.toFixed(3)),
      deviceScore: parseFloat(deviceScore.toFixed(3)),
      category,
      flags,
      explanation: {
        message: 'Risk assessment based on heuristics (ML model pending)',
        factors: flags
      }
    }
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    const cacheKey = `transaction:${id}`
    const cached = await cache.get<Transaction>(cacheKey)
    if (cached) {
      return cached
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: {
        merchant: true,
        riskScores: true
      }
    })

    if (transaction) {
      await cache.set(cacheKey, transaction, 300)
    }

    return transaction
  }

  /**
   * Get transactions for a merchant
   */
  async getMerchantTransactions(
    merchantId: string,
    options: {
      limit?: number
      offset?: number
      status?: string
      riskCategory?: string
    } = {}
  ): Promise<{
    transactions: Transaction[]
    total: number
  }> {
    const { limit = 50, offset = 0, status, riskCategory } = options

    const conditions = [eq(transactions.merchantId, merchantId)]
    if (status) conditions.push(eq(transactions.status, status))
    if (riskCategory) conditions.push(eq(transactions.riskCategory, riskCategory))

    const [result, countResult] = await Promise.all([
      db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.createdAt)],
        limit,
        offset
      }),
      db.select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(and(...conditions))
    ])

    return {
      transactions: result,
      total: countResult[0].count
    }
  }

  /**
   * Get recent high-risk transactions
   */
  async getHighRiskTransactions(merchantId: string, limit: number = 10): Promise<Transaction[]> {
    return db.query.transactions.findMany({
      where: and(
        eq(transactions.merchantId, merchantId),
        eq(transactions.riskCategory, 'RED')
      ),
      orderBy: [desc(transactions.createdAt)],
      limit
    })
  }
}

export const transactionService = new TransactionService()
