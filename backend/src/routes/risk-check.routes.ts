import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyAuth } from '@/middleware/auth.middleware'
import { MLService } from '@/services/ml.service'

const riskCheckSchema = z.object({
  buyerEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  country: z.string().length(2).optional(),
  deviceData: z.object({
    deviceId: z.string(),
    ipAddress: z.string(),
    userAgent: z.string().optional(),
    vpnDetected: z.boolean().default(false),
    torDetected: z.boolean().default(false),
    deviceReputationScore: z.number().min(0).max(1).default(0.5)
  }).optional(),
  sessionData: z.object({
    timeOnSiteSeconds: z.number().int().min(0),
    pagesVisited: z.number().int().min(1),
    checkoutSpeedSeconds: z.number().int().min(0)
  }).optional(),
  cartItems: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    category: z.string(),
    isDigital: z.boolean().default(false),
    isHighRisk: z.boolean().default(false)
  })).default([]),
  accountAgeDays: z.number().int().min(0).default(0),
  emailIsDisposable: z.boolean().default(false),
  geoIpBillingDistanceKm: z.number().min(0).default(0),
  merchantHistory: z.boolean().default(true),
  useMLModel: z.boolean().default(true)
})

export async function riskCheckRoutes(fastify: FastifyInstance): Promise<void> {
  const mlService = MLService.getInstance()

  /**
   * POST /risk-check
   * Perform risk assessment before transaction
   */
  fastify.post('/risk-check', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const data = riskCheckSchema.parse(request.body)

    // Use ML model if available and enabled
    if (data.useMLModel) {
      try {
        const mlRequest = {
          buyer_email: data.buyerEmail,
          amount: data.amount,
          currency: data.currency,
          country: data.country || 'US',
          device_data: data.deviceData ? {
            device_id: data.deviceData.deviceId,
            ip_address: data.deviceData.ipAddress,
            user_agent: data.deviceData.userAgent,
            vpn_detected: data.deviceData.vpnDetected,
            tor_detected: data.deviceData.torDetected,
            device_reputation_score: data.deviceData.deviceReputationScore
          } : {
            device_id: 'unknown',
            ip_address: '0.0.0.0'
          },
          session_data: data.sessionData ? {
            time_on_site_seconds: data.sessionData.timeOnSiteSeconds,
            pages_visited: data.sessionData.pagesVisited,
            checkout_speed_seconds: data.sessionData.checkoutSpeedSeconds
          } : {
            time_on_site_seconds: 60,
            pages_visited: 1,
            checkout_speed_seconds: 30
          },
          cart_items: data.cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            is_digital: item.isDigital,
            is_high_risk: item.isHighRisk
          })),
          account_age_days: data.accountAgeDays,
          email_is_disposable: data.emailIsDisposable,
          geo_ip_billing_distance_km: data.geoIpBillingDistanceKm
        }

        const mlResponse = await mlService.predictRisk(mlRequest)

        return reply.send({
          riskScore: mlResponse.risk_score,
          riskCategory: mlResponse.risk_category,
          flags: mlResponse.flags,
          recommendation: mlResponse.recommended_action,
          explanation: mlResponse.explanation,
          processingTimeMs: mlResponse.processing_time_ms,
          modelUsed: 'payguard_vesta_v1'
        })
      } catch (error: any) {
        fastify.log.error('ML model prediction failed:', error)
        // Fallback to placeholder if ML fails
        fastify.log.warn('Falling back to placeholder risk calculation')
      }
    }

    // Fallback placeholder risk calculation
    const riskScore = calculatePlaceholderRiskScore(data)

    return reply.send({
      riskScore: riskScore.score,
      riskCategory: riskScore.category,
      flags: riskScore.flags,
      recommendation: riskScore.recommendation,
      explanation: riskScore.explanation,
      modelUsed: 'placeholder'
    })
  })

  /**
   * GET /risk-check/model-info
   * Get ML model information
   */
  fastify.get('/risk-check/model-info', {
    preHandler: verifyAuth
  }, async (request, reply) => {
    const modelInfo = await mlService.getModelInfo()
    const isHealthy = await mlService.checkHealth()

    return reply.send({
      healthy: isHealthy,
      modelInfo: modelInfo || 'ML service unavailable'
    })
  })
}

/**
 * Placeholder risk calculation
 * This will be replaced with ML model
 */
function calculatePlaceholderRiskScore(data: any): {
  score: number
  category: 'GREEN' | 'YELLOW' | 'RED'
  flags: string[]
  recommendation: string
  explanation: string
} {
  let score = 0.3 // Base score
  const flags: string[] = []

  // Amount-based risk
  if (data.amount > 1000) {
    score += 0.2
    flags.push('HIGH_AMOUNT')
  }

  if (data.amount > 5000) {
    score += 0.3
    flags.push('VERY_HIGH_AMOUNT')
  }

  // Device data check
  if (!data.deviceData) {
    score += 0.15
    flags.push('NO_DEVICE_DATA')
  }

  // Session data check
  if (!data.sessionData) {
    score += 0.1
    flags.push('NO_SESSION_DATA')
  }

  // Determine category
  let category: 'GREEN' | 'YELLOW' | 'RED'
  let recommendation: string

  if (score < 0.3) {
    category = 'GREEN'
    recommendation = 'APPROVE'
  } else if (score < 0.7) {
    category = 'YELLOW'
    recommendation = 'REVIEW'
  } else {
    category = 'RED'
    recommendation = 'DECLINE'
  }

  return {
    score: parseFloat(score.toFixed(3)),
    category,
    flags,
    recommendation,
    explanation: `Risk assessment based on ${flags.length} factors. ML model integration pending.`
  }
}
