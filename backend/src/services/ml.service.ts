/**
 * ML Service - Interface to PayGuard AI fraud detection model
 * Communicates with Python FastAPI ML service
 */

import axios from 'axios'
import { env } from '@/config/env'

const ML_API_URL = env.ML_SERVICE_URL || 'http://localhost:8000'

interface MLRiskCheckRequest {
  buyer_email: string
  amount: number
  currency: string
  country?: string
  device_data: {
    device_id: string
    ip_address: string
    user_agent?: string
    vpn_detected?: boolean
    tor_detected?: boolean
    device_reputation_score?: number
  }
  session_data: {
    time_on_site_seconds: number
    pages_visited: number
    checkout_speed_seconds: number
  }
  cart_items?: Array<{
    name: string
    price: number
    quantity: number
    category: string
    is_digital?: boolean
    is_high_risk?: boolean
  }>
  account_age_days?: number
  email_is_disposable?: boolean
  geo_ip_billing_distance_km?: number
}

interface MLRiskCheckResponse {
  transaction_id: string | null
  risk_score: number
  risk_category: 'GREEN' | 'YELLOW' | 'RED'
  recommended_action: 'PROCEED_PAYPAL' | 'MANUAL_REVIEW' | 'BLOCK_TRANSACTION'
  flags: string[]
  explanation: {
    top_features: Array<{
      feature: string
      impact: number
      value: number
    }>
  }
  processing_time_ms: number
  timestamp: string
}

export class MLService {
  private static instance: MLService
  private isHealthy: boolean = false
  private lastHealthCheck: Date = new Date(0)

  private constructor() {
    this.checkHealth()
  }

  static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService()
    }
    return MLService.instance
  }

  /**
   * Check if ML service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_API_URL}/health`, {
        timeout: 5000
      })
      this.isHealthy = response.status === 200
      this.lastHealthCheck = new Date()
      return this.isHealthy
    } catch (error) {
      console.error('ML service health check failed:', error)
      this.isHealthy = false
      return false
    }
  }

  /**
   * Predict fraud risk for a transaction
   */
  async predictRisk(request: MLRiskCheckRequest): Promise<MLRiskCheckResponse> {
    // If not healthy or health check is stale (>30s), verify health
    const isStale = (Date.now() - this.lastHealthCheck.getTime()) > 30000
    if (!this.isHealthy || isStale) {
      await this.checkHealth()
    }

    if (!this.isHealthy) {
      throw new Error('ML service is unavailable')
    }

    try {
      const response = await axios.post<MLRiskCheckResponse>(
        `${ML_API_URL}/predict`,
        request,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error: any) {
      if (error.response) {
        throw new Error(`ML service error: ${error.response.data?.detail || error.message}`)
      } else if (error.request) {
        throw new Error('ML service did not respond')
      } else {
        throw new Error(`ML service request failed: ${error.message}`)
      }
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await axios.get(`${ML_API_URL}/model/info`, {
        timeout: 5000
      })
      return response.data
    } catch (error) {
      console.error('Failed to get model info:', error)
      return null
    }
  }
}
