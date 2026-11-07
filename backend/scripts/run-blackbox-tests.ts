/**
 * PayGuard AI - End-to-End Blackbox Testing Suite
 *
 * Exercises the entire platform strictly as an external client:
 * - Multi-user authentication & credential security
 * - Real-time ML risk assessment with XGBoost & TreeSHAP
 * - Transaction lifecycle & Pre-capture fraud interception
 * - Multi-tenant isolation (Merchant A vs Merchant B)
 * - Negative scenarios, boundary values, and SQL injection fuzzing
 */

import { fastify, registerPlugins, registerRoutes } from '../src/server.js'
import { db, checkDatabaseConnection } from '../src/config/database.js'
import { checkRedisConnection } from '../src/config/redis.js'
import { merchants, transactions, riskScores } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

interface TestResult {
  suite: string
  name: string
  passed: boolean
  durationMs: number
  error?: string
  details?: any
}

const results: TestResult[] = []

async function runTest(
  suite: string,
  name: string,
  fn: () => Promise<void | any>
): Promise<void> {
  const start = Date.now()
  try {
    const details = await fn()
    const durationMs = Date.now() - start
    results.push({ suite, name, passed: true, durationMs, details })
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`)
  } catch (err: any) {
    const durationMs = Date.now() - start
    results.push({ suite, name, passed: false, durationMs, error: err.message })
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms): ${err.message}`)
  }
}

async function main() {
  console.log('='.repeat(75))
  console.log('🧪 PAYGUARD AI - BLACKBOX TEST SUITE EXECUTION')
  console.log('='.repeat(75))
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('Environment: In-Memory Full HTTP Stack (fastify.inject)\n')

  // Verify connections and initialize plugins & routes
  process.env.NODE_ENV = 'test'
  await checkDatabaseConnection()
  await checkRedisConnection()
  await registerPlugins()
  await registerRoutes()
  await fastify.ready()

  // Track session tokens
  let merchantAToken = ''
  let merchantBToken = ''
  let merchantCToken = ''
  let merchantAId = ''
  let merchantBId = ''
  let sampleTxIdMerchantA = ''

  // =========================================================================
  // SUITE 1: Multi-User Authentication & Identity Security
  // =========================================================================
  console.log('📦 SUITE 1: Multi-User Authentication & Identity Security')

  await runTest('Suite 1: Auth', 'Scenario 1.1: Enterprise Merchant Login (demo@payguard.ai)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'demo@payguard.ai',
        password: 'Demo123!'
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const body = JSON.parse(res.body)
    if (!body.token || typeof body.token !== 'string') throw new Error('Missing or invalid JWT token in response')
    if (body.merchant?.name !== 'Demo Merchant') throw new Error(`Unexpected merchant name: ${body.merchant?.name}`)
    if (!body.merchant?.apiKey?.startsWith('pk_')) throw new Error('API key must start with pk_')
    if (body.merchant?.passwordHash) throw new Error('Security flaw: passwordHash leaked in API response')

    merchantAToken = body.token
    merchantAId = body.merchant.id
  })

  await runTest('Suite 1: Auth', 'Scenario 1.2: Standard Retail Merchant Login (test@example.com)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'Test123!'
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const body = JSON.parse(res.body)
    if (!body.token) throw new Error('Missing token')
    if (body.token === merchantAToken) throw new Error('Security flaw: Distinct users received identical JWT tokens')
    if (body.merchant?.name !== 'Test Store') throw new Error(`Unexpected merchant: ${body.merchant?.name}`)

    merchantBToken = body.token
    merchantBId = body.merchant.id
  })

  await runTest('Suite 1: Auth', 'Scenario 1.3: Dynamic Onboarding (New Merchant Registration)', async () => {
    const uniqueEmail = `onboard_${Date.now()}@payguard-testing.com`
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: uniqueEmail,
        password: 'SecurePass2026!',
        name: 'Omni Retail Global',
        industryCategory: 'Digital Marketplace'
      }
    })

    if (res.statusCode !== 201) {
      throw new Error(`Expected 201 Created but got ${res.statusCode}: ${res.body}`)
    }

    const body = JSON.parse(res.body)
    if (!body.merchant?.id) throw new Error('Missing registered merchant ID')
    if (!body.token) throw new Error('Missing token on registration')
    if (!body.merchant?.apiKey?.startsWith('pk_')) throw new Error('Invalid API key on registration')

    merchantCToken = body.token
  })

  await runTest('Suite 1: Auth', 'Scenario 1.4: Invalid Credentials Defense (Wrong Password)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'demo@payguard.ai',
        password: 'IncorrectPassword999!'
      }
    })

    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${res.statusCode}`)
    }
  })

  await runTest('Suite 1: Auth', 'Scenario 1.5: Unauthenticated Route Protection (Missing Header)', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/transactions'
    })

    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${res.statusCode}`)
    }
  })

  await runTest('Suite 1: Auth', 'Scenario 1.6: Token Tampering & Forgery Defense', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/transactions',
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature_string'
      }
    })

    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${res.statusCode}`)
    }
  })

  // =========================================================================
  // SUITE 2: Pre-Capture AI Risk Scoring Engine (XGBoost & SHAP)
  // =========================================================================
  console.log('\n📦 SUITE 2: Pre-Capture AI Risk Scoring Engine (XGBoost & SHAP)')

  await runTest('Suite 2: Risk Scoring', 'Scenario 2.1: Verified Safe Shopper ($42.50, Corporate Email, Trusted Device)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/risk-check',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        transactionId: `tx_safe_${Date.now()}`,
        buyerEmail: 'sarah.connor@microsoft.com',
        amount: 42.50,
        currency: 'USD',
        country: 'US',
        deviceData: {
          deviceId: 'dev_mac_retina_trusted',
          ipAddress: '24.120.45.18',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          vpnDetected: false,
          torDetected: false,
          deviceReputationScore: 0.95
        },
        sessionData: {
          timeOnSiteSeconds: 145,
          pagesVisited: 5,
          checkoutSpeedSeconds: 38
        },
        cartItems: [
          { name: 'Ergonomic Desk Mat', price: 42.50, quantity: 1, category: 'Office', isDigital: false, isHighRisk: false }
        ]
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const data = JSON.parse(res.body)
    if (data.riskCategory !== 'GREEN') {
      throw new Error(`Expected GREEN category for safe shopper but got: ${data.riskCategory} (score: ${data.riskScore})`)
    }
    if (data.riskScore >= 0.35) {
      throw new Error(`Risk score too high for safe shopper: ${data.riskScore}`)
    }
    const hasFeatures = data.explanation?.topFeatures || data.explanation?.top_features
    if (!hasFeatures) {
      throw new Error(`Missing SHAP feature importance explanation in response: ${JSON.stringify(data.explanation)}`)
    }
  })

  await runTest('Suite 2: Risk Scoring', 'Scenario 2.2: Velocity Surge & Micro-Carding Attack ($18.99, 1.2s Checkout)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/risk-check',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        transactionId: `tx_vel_${Date.now()}`,
        buyerEmail: 'speedy.test@gmail.com',
        amount: 18.99,
        currency: 'USD',
        country: 'US',
        deviceData: {
          deviceId: 'dev_new_unknown_hw',
          ipAddress: '172.56.21.9',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          vpnDetected: false,
          torDetected: false,
          deviceReputationScore: 0.35
        },
        sessionData: {
          timeOnSiteSeconds: 3,
          pagesVisited: 1,
          checkoutSpeedSeconds: 1
        }
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const data = JSON.parse(res.body)
    if (data.riskCategory === 'GREEN') {
      throw new Error(`Rapid 1s checkout was not flagged (got score ${data.riskScore}, category ${data.riskCategory})`)
    }
    if (!data.flags?.includes('FAST_CHECKOUT')) {
      throw new Error(`Expected FAST_CHECKOUT flag in response: ${JSON.stringify(data.flags)}`)
    }
  })

  await runTest('Suite 2: Risk Scoring', 'Scenario 2.3: High-Ticket Bot Attack ($3,850, Disposable Email, Tor/VPN)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/risk-check',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        transactionId: `tx_bot_${Date.now()}`,
        buyerEmail: 'attacker_x@tempmail.ninja',
        amount: 3850.00,
        currency: 'USD',
        country: 'US',
        deviceData: {
          deviceId: 'dev_bot_selenium_headless',
          ipAddress: '185.220.101.5',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0',
          vpnDetected: true,
          torDetected: true,
          deviceReputationScore: 0.05
        },
        sessionData: {
          timeOnSiteSeconds: 1,
          pagesVisited: 1,
          checkoutSpeedSeconds: 0
        },
        cartItems: [
          { name: 'Apple App Store $500 Gift Card', price: 500.00, quantity: 7, category: 'Gift Cards', isDigital: true, isHighRisk: true },
          { name: 'Steam Wallet $350 Code', price: 350.00, quantity: 1, category: 'Gift Cards', isDigital: true, isHighRisk: true }
        ],
        emailIsDisposable: true
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const data = JSON.parse(res.body)
    if (data.riskCategory !== 'RED') {
      throw new Error(`Hostile bot attack failed to trigger RED status (got category: ${data.riskCategory}, score: ${data.riskScore})`)
    }
    if (data.riskScore < 0.70) {
      throw new Error(`Risk score for bot attack is too low: ${data.riskScore} (expected >= 0.70)`)
    }
    if (!data.flags?.includes('VPN_DETECTED') && !data.flags?.includes('TOR_DETECTED') && !data.flags?.includes('HIGH_AMOUNT')) {
      throw new Error(`Expected risk flags missing: ${JSON.stringify(data.flags)}`)
    }
  })

  await runTest('Suite 2: Risk Scoring', 'Scenario 2.4: International Geo-Mismatch & Proxy Anomaly', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/risk-check',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        transactionId: `tx_geo_${Date.now()}`,
        buyerEmail: 'remote.buyer@yahoo.com',
        amount: 720.00,
        currency: 'USD',
        country: 'US',
        deviceData: {
          deviceId: 'dev_proxy_router',
          ipAddress: '103.251.167.22',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          vpnDetected: true,
          torDetected: false,
          deviceReputationScore: 0.40
        },
        sessionData: {
          timeOnSiteSeconds: 85,
          pagesVisited: 3,
          checkoutSpeedSeconds: 19
        },
        geoIpBillingDistanceKm: 6400
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 OK but got ${res.statusCode}: ${res.body}`)
    }

    const data = JSON.parse(res.body)
    if (!data.flags?.includes('GEO_MISMATCH') && !data.flags?.includes('VPN_DETECTED')) {
      throw new Error(`Missing expected anomaly flags: ${JSON.stringify(data.flags)}`)
    }
  })

  // =========================================================================
  // SUITE 3: Transaction Lifecycle & Pre-Capture Interception
  // =========================================================================
  console.log('\n📦 SUITE 3: Transaction Lifecycle & Pre-Capture Interception')

  await runTest('Suite 3: Lifecycle', 'Scenario 3.1: Create Order in PENDING State', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        buyerEmail: 'customer@legitbuyer.com',
        amount: 89.95,
        currency: 'USD',
        deviceData: {
          deviceId: 'dev_shopper_1',
          ipAddress: '72.14.201.12'
        },
        sessionData: {
          timeOnSiteSeconds: 95,
          pagesVisited: 4,
          checkoutSpeedSeconds: 25
        }
      }
    })

    if (res.statusCode !== 201) {
      throw new Error(`Expected 201 Created but got ${res.statusCode}: ${res.body}`)
    }

    const body = JSON.parse(res.body)
    if (!body.transaction?.id) throw new Error('Missing transaction ID')
    if (body.transaction.status !== 'PENDING') throw new Error(`Initial status must be PENDING, got: ${body.transaction.status}`)
    if (!body.transaction.paypalOrderId) throw new Error('Missing PayPal order ID')

    sampleTxIdMerchantA = body.transaction.id
  })

  await runTest('Suite 3: Lifecycle', 'Scenario 3.2: High-Risk Order Capture Interception (Auto-Blocked to FAILED)', async () => {
    // 1. Create a high-risk transaction in database
    const [highRiskTx] = await db.insert(transactions).values({
      merchantId: merchantAId,
      paypalOrderId: `MOCK_PP_RED_${Date.now()}`,
      buyerEmail: 'fraud_script@tempmail.ninja',
      amount: '4500.00',
      currency: 'USD',
      status: 'PENDING',
      deviceData: {
        deviceId: 'bot_dev_9',
        ipAddress: '185.220.101.5',
        vpnDetected: true,
        torDetected: true,
        deviceReputationScore: 0.02
      },
      sessionData: {
        timeOnSiteSeconds: 1,
        pagesVisited: 1,
        checkoutSpeedSeconds: 0
      }
    }).returning()

    // 2. Trigger capture
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/transactions/${highRiskTx.id}/capture`,
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        orderId: highRiskTx.paypalOrderId
      }
    })

    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 response from capture handler but got ${res.statusCode}: ${res.body}`)
    }

    const body = JSON.parse(res.body)
    if (body.transaction?.status !== 'FAILED') {
      throw new Error(`Security breach: High-risk transaction was NOT intercepted! Status is: ${body.transaction?.status}`)
    }
    if (body.riskScore?.category !== 'RED') {
      throw new Error(`Expected RED risk category but got: ${body.riskScore?.category}`)
    }
  })

  // =========================================================================
  // SUITE 4: Multi-Tenant Data Isolation & Security
  // =========================================================================
  console.log('\n📦 SUITE 4: Multi-Tenant Data Isolation & Security')

  await runTest('Suite 4: Multi-Tenant', 'Scenario 4.1: Cross-Merchant Data Access Defense (Merchant B -> Merchant A Transaction)', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/transactions/${sampleTxIdMerchantA}`,
      headers: { authorization: `Bearer ${merchantBToken}` }
    })

    // Must be 403 Forbidden or 404 Not Found to prevent data snooping
    if (res.statusCode !== 403 && res.statusCode !== 404) {
      throw new Error(`Tenant isolation breached! Merchant B accessed Merchant A transaction. Got status: ${res.statusCode}`)
    }
  })

  await runTest('Suite 4: Multi-Tenant', 'Scenario 4.2: Merchant Ledger Boundary Isolation', async () => {
    const resA = await fastify.inject({
      method: 'GET',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` }
    })
    const resB = await fastify.inject({
      method: 'GET',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantBToken}` }
    })

    const dataA = JSON.parse(resA.body)
    const dataB = JSON.parse(resB.body)

    const listA: any[] = dataA.transactions || []
    const listB: any[] = dataB.transactions || []

    const merchantAHasTxB = listA.some((t: any) => t.merchantId === merchantBId)
    const merchantBHasTxA = listB.some((t: any) => t.merchantId === merchantAId)

    if (merchantAHasTxB || merchantBHasTxA) {
      throw new Error('Tenant isolation violated: Cross-merchant records leaked in ledger query!')
    }
  })

  // =========================================================================
  // SUITE 5: Boundary Testing, Schema Fuzzing & SQL Injection Defense
  // =========================================================================
  console.log('\n📦 SUITE 5: Boundary Testing, Schema Fuzzing & SQL Injection Defense')

  await runTest('Suite 5: Validation', 'Scenario 5.1: Negative Amount Rejection (-150.00)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        buyerEmail: 'user@example.com',
        amount: -150.00
      }
    })

    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 Bad Request for negative amount but got: ${res.statusCode}`)
    }
  })

  await runTest('Suite 5: Validation', 'Scenario 5.2: Zero Amount Rejection ($0.00)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        buyerEmail: 'user@example.com',
        amount: 0.00
      }
    })

    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 Bad Request for zero amount but got: ${res.statusCode}`)
    }
  })

  await runTest('Suite 5: Validation', 'Scenario 5.3: Malformed Email Address Rejection', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        buyerEmail: 'not-an-email-at-all',
        amount: 50.00
      }
    })

    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 Bad Request for malformed email but got: ${res.statusCode}`)
    }
  })

  await runTest('Suite 5: Validation', 'Scenario 5.4: SQL Injection Defense in Device ID & Notes', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${merchantAToken}` },
      payload: {
        buyerEmail: 'hacker@injection-test.com',
        amount: 100.00,
        deviceData: {
          deviceId: "' OR '1'='1' --",
          userAgent: "Mozilla/5.0'; DROP TABLE transactions; --"
        }
      }
    })

    // Should create successfully with parameterized values or reject; must NOT crash or drop tables
    if (res.statusCode !== 201 && res.statusCode !== 400) {
      throw new Error(`Unexpected status during SQL injection probe: ${res.statusCode}`)
    }

    // Verify database tables are intact
    const checkTable = await db.query.transactions.findMany({ limit: 1 })
    if (!checkTable) {
      throw new Error('Database compromised: transactions table check failed!')
    }
  })

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n' + '='.repeat(75))
  console.log('📊 BLACKBOX TEST SUMMARY REPORT')
  console.log('='.repeat(75))

  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0)

  console.log(`Total Scenarios Executed: ${total}`)
  console.log(`Passed:                   ${passed}`)
  console.log(`Failed:                   ${failed}`)
  console.log(`Total Execution Time:     ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`)
  console.log(`Success Rate:             ${((passed / total) * 100).toFixed(1)}%\n`)

  if (failed > 0) {
    console.log('FAILED SCENARIOS:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - [${r.suite}] ${r.name}: ${r.error}`)
    })
    process.exit(1)
  } else {
    console.log('🎉 ALL BLACKBOX TEST SCENARIOS PASSED WITH 100% SUCCESS!')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err)
  process.exit(1)
})
