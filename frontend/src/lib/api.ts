import type {
  Merchant,
  Transaction,
  Statistics,
  RiskCheckResult,
  DeviceData,
  SessionData,
  CartItem
} from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'

// Auth Token Management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export interface RiskCheckPayload {
  buyerEmail: string
  amount: number
  currency?: string
  country?: string
  deviceData?: DeviceData
  sessionData?: SessionData
  cartItems?: CartItem[]
  accountAgeDays?: number
  emailIsDisposable?: boolean
  geoIpBillingDistanceKm?: number
  useMLModel?: boolean
}

// API Client
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      message: string
      merchant: Merchant
      token: string
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: { email: string; password: string; name: string; industryCategory?: string }) {
    return this.request<{
      message: string
      merchant: Merchant
      token: string
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser() {
    return this.request<{ merchant: Merchant }>('/auth/me')
  }

  // Merchant endpoints
  async getMerchantProfile() {
    return this.request<{ merchant: Merchant }>('/merchants/profile')
  }

  async getStatistics(days: number = 30) {
    return this.request<{ statistics: Statistics }>(`/merchants/statistics?days=${days}`)
  }

  // Transaction endpoints
  async getTransactions(params: {
    limit?: number
    offset?: number
    status?: string
    riskCategory?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString())
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString())
    if (params.status) searchParams.append('status', params.status)
    if (params.riskCategory) searchParams.append('riskCategory', params.riskCategory)

    const query = searchParams.toString()
    return this.request<{
      transactions: Transaction[]
      total: number
      limit: number
      offset: number
    }>(`/transactions${query ? `?${query}` : ''}`)
  }

  async createTransaction(data: {
    buyerEmail: string
    amount: number
    currency?: string
    deviceData?: DeviceData
  }) {
    return this.request<{
      message: string
      transaction: Transaction
      paypalOrder: Record<string, unknown>
    }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTransaction(id: string) {
    return this.request<{ transaction: Transaction }>(`/transactions/${id}`)
  }

  // Risk check
  async performRiskCheck(data: RiskCheckPayload): Promise<RiskCheckResult> {
    return this.request<RiskCheckResult>('/risk-check', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Model health info
  async getModelInfo() {
    return this.request<{
      healthy: boolean
      modelInfo: string | Record<string, unknown>
    }>('/risk-check/model-info')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export { API_BASE_URL, WS_URL }
