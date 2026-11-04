import { db } from '@/config/database'
import { merchants, transactions, type Merchant } from '@/db/schema'
import { eq, desc, sql, and, gte } from 'drizzle-orm'
import { cache } from '@/config/redis'

export class MerchantService {
  /**
   * Get merchant by ID
   */
  async getById(id: string): Promise<Omit<Merchant, 'passwordHash'> | null> {
    // Try cache first
    const cacheKey = `merchant:${id}`
    const cached = await cache.get<Merchant>(cacheKey)
    if (cached) {
      const { passwordHash: _, ...merchantData } = cached
      return merchantData
    }

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, id)
    })

    if (!merchant) {
      return null
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, merchant, 300)

    const { passwordHash: _, ...merchantData } = merchant
    return merchantData
  }

  /**
   * Update merchant profile
   */
  async updateProfile(id: string, data: {
    name?: string
    industryCategory?: string
  }): Promise<Omit<Merchant, 'passwordHash'>> {
    const [updated] = await db.update(merchants)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(merchants.id, id))
      .returning()

    if (!updated) {
      throw new Error('Merchant not found')
    }

    // Invalidate cache
    await cache.del(`merchant:${id}`)

    const { passwordHash: _, ...merchantData } = updated
    return merchantData
  }

  /**
   * Get merchant statistics
   */
  async getStatistics(merchantId: string, days: number = 30): Promise<{
    totalTransactions: number
    totalAmount: number
    avgRiskScore: number
    highRiskCount: number
    successRate: number
  }> {
    const cacheKey = `merchant:stats:${merchantId}:${days}`
    const cached = await cache.get<any>(cacheKey)
    if (cached) {
      return cached
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const stats = await db
      .select({
        totalTransactions: sql<number>`count(*)::int`,
        totalAmount: sql<number>`COALESCE(sum(${transactions.amount}), 0)`,
        avgRiskScore: sql<number>`COALESCE(avg(${transactions.riskScore}), 0)`,
        highRiskCount: sql<number>`count(case when ${transactions.riskCategory} = 'RED' then 1 end)::int`,
        successCount: sql<number>`count(case when ${transactions.status} = 'COMPLETED' then 1 end)::int`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.merchantId, merchantId),
          gte(transactions.createdAt, cutoffDate)
        )
      )

    const result = stats[0]
    const successRate = result.totalTransactions > 0
      ? (result.successCount / result.totalTransactions) * 100
      : 0

    const statistics = {
      totalTransactions: result.totalTransactions,
      totalAmount: parseFloat(result.totalAmount.toString()),
      avgRiskScore: parseFloat(result.avgRiskScore.toString()),
      highRiskCount: result.highRiskCount,
      successRate: parseFloat(successRate.toFixed(2))
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, statistics, 600)

    return statistics
  }

  /**
   * Deactivate merchant account
   */
  async deactivate(id: string): Promise<void> {
    await db.update(merchants)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(merchants.id, id))

    await cache.del(`merchant:${id}`)
  }

  /**
   * Reactivate merchant account
   */
  async reactivate(id: string): Promise<void> {
    await db.update(merchants)
      .set({
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(merchants.id, id))

    await cache.del(`merchant:${id}`)
  }
}

export const merchantService = new MerchantService()
