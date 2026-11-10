import { db } from '@/config/database'
import { transactions, riskScores, type Transaction, type NewTransaction, type NewRiskScore } from '@/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { paypalService } from './paypal.service'
import { MLService } from './ml.service'
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
   * Pre-capture risk evaluation and PayPal payment execution
   * Evaluates ML fraud model BEFORE capturing funds from PayPal
   */
  async capturePayment(transactionId: string, orderId: string): Promise<{
    transaction: Transaction
    riskScore: any
  }> {
    // 1. Get transaction
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId)
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction is not in PENDING state')
    }

    // 2. Pre-Capture Risk Evaluation using Python XGBoost ML Service
    const riskScore = await this.performRiskCheck(transaction)

    // 3. High-Risk / Fraud Interception: Block order to prevent PayPal chargebacks
    if (riskScore.category === 'RED') {
      console.warn(`🛑 Pre-capture Fraud Intercepted: Order ${orderId} (Risk: ${riskScore.overallScore * 100}%)`)

      const [blocked] = await db.update(transactions)
        .set({
          status: 'FAILED',
          riskScore: riskScore.overallScore.toString(),
          riskCategory: riskScore.category,
          updatedAt: new Date()
        })
        .where(eq(transactions.id, transactionId))
        .returning()

      // Store ML risk assessment audit trail
      await db.insert(riskScores).values({
        transactionId: transaction.id,
        overallScore: riskScore.overallScore.toString(),
        mlScore: riskScore.mlScore.toString(),
        patternScore: riskScore.patternScore.toString(),
        deviceScore: riskScore.deviceScore.toString(),
        flags: riskScore.flags,
        explanation: riskScore.explanation
      })

      // Invalidate cache
      await cache.del(`transaction:${transactionId}`)
      await cache.invalidatePattern(`merchant:stats:${transaction.merchantId}:*`)

      return {
        transaction: blocked,
        riskScore
      }
    }

    // 4. Safe / Acceptable Risk (GREEN / YELLOW) -> Capture PayPal funds
    const captureData = await paypalService.captureOrder(orderId)

    // Update transaction to COMPLETED
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

    // Store ML risk score & SHAP explanation
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
   * Perform real-time risk check using Python XGBoost ML Model (port 8000)
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
    const mlService = MLService.getInstance()
    const amount = parseFloat(transaction.amount)
    const deviceData = (transaction.deviceData as any) || {}
    const sessionData = (transaction.sessionData as any) || {}

    try {
      // Invoke real XGBoost model via FastAPI ML service
      const isDisposable = Boolean(
        deviceData.disposableEmail ||
        (transaction.buyerEmail && (
          transaction.buyerEmail.includes('tempmail') ||
          transaction.buyerEmail.includes('mailinator') ||
          transaction.buyerEmail.includes('guerrillamail')
        ))
      )

      const mlResponse = await mlService.predictRisk({
        buyer_email: transaction.buyerEmail,
        amount,
        currency: transaction.currency || 'USD',
        country: (transaction as any).country || 'US',
        device_data: {
          device_id: deviceData.deviceId || 'unknown',
          ip_address: deviceData.ipAddress || '127.0.0.1',
          user_agent: deviceData.userAgent,
          vpn_detected: Boolean(deviceData.vpnDetected),
          tor_detected: Boolean(deviceData.torDetected),
          device_reputation_score: deviceData.deviceReputationScore ?? 0.8
        },
        session_data: {
          time_on_site_seconds: sessionData.timeOnSiteSeconds ?? 120,
          pages_visited: sessionData.pagesVisited ?? 5,
          checkout_speed_seconds: sessionData.checkoutSpeedSeconds ?? 35
        },
        cart_items: (transaction.cartItems as any) || [],
        email_is_disposable: isDisposable
      })

      return {
        overallScore: mlResponse.risk_score,
        mlScore: mlResponse.risk_score,
        patternScore: mlResponse.risk_score,
        deviceScore: deviceData.vpnDetected ? 0.9 : 0.2,
        category: mlResponse.risk_category,
        flags: mlResponse.flags || [],
        explanation: mlResponse.explanation || {
          message: 'Real-time prediction via payguard_vesta_v1 XGBoost model',
          top_features: []
        }
      }
    } catch (error) {
      console.warn('⚠️ ML service call failed or unavailable, falling back to heuristic engine:', error)

      // Fallback heuristics if ML service is offline
      const flags: string[] = []
      let mlScore = 0.15
      let patternScore = 0.2
      let deviceScore = 0.2

      if (amount > 1000) {
        mlScore += 0.35
        flags.push('HIGH_AMOUNT')
      }

      if (!transaction.deviceData) {
        deviceScore += 0.3
        flags.push('NO_DEVICE_DATA')
      } else if (deviceData.vpnDetected || deviceData.torDetected) {
        deviceScore += 0.5
        flags.push('ANONYMOUS_PROXY_DETECTED')
      }

      const overallScore = Math.min(1.0, (mlScore + patternScore + deviceScore) / 3)
      const category: 'GREEN' | 'YELLOW' | 'RED' =
        overallScore < 0.35 ? 'GREEN' : overallScore < 0.70 ? 'YELLOW' : 'RED'

      return {
        overallScore: parseFloat(overallScore.toFixed(3)),
        mlScore: parseFloat(mlScore.toFixed(3)),
        patternScore: parseFloat(patternScore.toFixed(3)),
        deviceScore: parseFloat(deviceScore.toFixed(3)),
        category,
        flags,
        explanation: {
          message: 'Evaluated using heuristic rule engine fallback',
          factors: flags
        }
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

    return transaction || null
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
