import axios, { AxiosInstance } from 'axios'

const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

interface PayPalTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface PayPalOrder {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

class PayPalService {
  private client: AxiosInstance
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.client = axios.create({
      baseURL: PAYPAL_API,
      timeout: 30000
    })
  }

  /**
   * Get OAuth access token with auto-refresh
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken
    }

    console.log('🔄 Refreshing PayPal access token...')

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64')

    try {
      const response = await axios.post<PayPalTokenResponse>(
        `${PAYPAL_API}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000)

      console.log('✅ PayPal access token refreshed')

      return this.accessToken
    } catch (error: any) {
      console.error('❌ Failed to get PayPal access token:', error.response?.data || error.message)
      throw new Error('Failed to authenticate with PayPal')
    }
  }

  /**
   * Create a PayPal order
   */
  async createOrder(amount: number, currency: string = 'USD'): Promise<PayPalOrder> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post<PayPalOrder>(
        '/v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      )

      console.log(`✅ PayPal order created: ${response.data.id}`)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to create PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to create PayPal order')
    }
  }

  /**
   * Capture a PayPal order
   */
  async captureOrder(orderId: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post(
        `/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      )

      console.log(`✅ PayPal order captured: ${orderId}`)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to capture PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to capture PayPal order')
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.get(
        `/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ Failed to get PayPal order:', error.response?.data || error.message)
      throw new Error('Failed to get PayPal order details')
    }
  }

  /**
   * Search transactions (for ML training data)
   */
  async searchTransactions(startDate: string, endDate: string): Promise<any> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.get(
        '/v1/reporting/transactions',
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            fields: 'all'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ Failed to search PayPal transactions:', error.response?.data || error.message)
      throw new Error('Failed to search PayPal transactions')
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(webhookData: {
    authAlgo: string
    certUrl: string
    transmissionId: string
    transmissionSig: string
    transmissionTime: string
    webhookId: string
    webhookEvent: any
  }): Promise<boolean> {
    const token = await this.getAccessToken()

    try {
      const response = await this.client.post(
        '/v1/notifications/verify-webhook-signature',
        webhookData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.verification_status === 'SUCCESS'
    } catch (error: any) {
      console.error('❌ Failed to verify webhook signature:', error.response?.data || error.message)
      return false
    }
  }
}

export const paypalService = new PayPalService()
