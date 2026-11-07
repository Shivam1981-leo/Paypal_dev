export interface Merchant {
  id: string
  email: string
  name: string
  apiKey: string
  industryCategory?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DeviceData {
  deviceId?: string
  ipAddress?: string
  userAgent?: string
  vpnDetected?: boolean
  torDetected?: boolean
  deviceReputationScore?: number
}

export interface SessionData {
  timeOnSiteSeconds?: number
  pagesVisited?: number
  checkoutSpeedSeconds?: number
}

export interface CartItem {
  name: string
  price: number
  quantity: number
  category: string
  isDigital?: boolean
  isHighRisk?: boolean
}

export interface Transaction {
  id: string
  merchantId: string
  buyerEmail: string
  amount: string | number
  currency: string
  riskScore?: string | number | null
  riskCategory?: 'GREEN' | 'YELLOW' | 'RED' | string | null
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string
  paypalOrderId?: string | null
  paypalCaptureId?: string | null
  deviceData?: DeviceData | null
  sessionData?: SessionData | null
  cartItems?: CartItem[] | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface Statistics {
  totalTransactions: number
  totalAmount: number
  averageRiskScore?: number
  avgRiskScore?: number
  fraudulentTransactions?: number
  highRiskCount?: number
  successRate?: number
}

export interface FeatureImpact {
  feature: string
  impact: number
  value?: string | number | boolean
}

export interface RiskCheckResult {
  riskScore: number
  riskCategory: 'GREEN' | 'YELLOW' | 'RED' | string
  flags: string[]
  recommendation: string
  explanation?: {
    summary?: string
    top_features?: FeatureImpact[]
  } | string
  processingTimeMs?: number
  modelUsed?: string
  error?: boolean
  message?: string
}
