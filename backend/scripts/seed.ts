import * as dotenv from 'dotenv'
dotenv.config()

import { db } from '../src/config/database.js'
import { merchants, transactions, riskScores } from '../src/db/schema.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const API_KEY_SALT = process.env.API_KEY_SALT || 'nT8xW1yU4zV7cB9mL2oP5qR3sN6tH0kJ4iF8gD1eA7wX'

async function generateApiKey(prefix = 'pk_live'): Promise<string> {
  const random = crypto.randomBytes(24).toString('hex')
  const hash = crypto.createHmac('sha256', API_KEY_SALT).update(random).digest('hex')
  return `${prefix}_${hash.substring(0, 40)}`
}

// Helper to generate past dates within the last 30 days
function getPastDate(daysAgo: number, hourOffset = 0, minuteOffset = 0): Date {
  const now = new Date()
  const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  d.setHours((now.getHours() + hourOffset) % 24, (now.getMinutes() + minuteOffset) % 60, 0, 0)
  return d
}

async function seed() {
  console.log('🌱 Starting comprehensive multi-user database seed...')

  try {
    // 1. Clean existing records
    console.log('🧹 Purging existing transactions, risk scores, and merchants...')
    await db.delete(riskScores)
    await db.delete(transactions)
    await db.delete(merchants)

    // 2. Define Multi-Tenant Merchants (Users)
    const merchantDefinitions = [
      {
        email: 'demo@payguard.ai',
        password: 'Demo123!',
        name: 'Demo Merchant',
        industryCategory: 'Consumer Tech & Electronics',
        apiKeyPrefix: 'pk_live_demo'
      },
      {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test Store',
        industryCategory: 'Fashion & Apparel',
        apiKeyPrefix: 'pk_live_nova'
      },
      {
        email: 'fashion@luxurypalace.com',
        password: 'Luxury123!',
        name: 'Luxury Palace Haute Couture',
        industryCategory: 'High-Ticket Luxury & Watches',
        apiKeyPrefix: 'pk_live_lux'
      },
      {
        email: 'support@gamingvouchers.io',
        password: 'Gaming123!',
        name: 'GameVault Digital Entertainment',
        industryCategory: 'Digital Goods & Gaming Keys',
        apiKeyPrefix: 'pk_live_game'
      },
      {
        email: 'orders@ecocoffee.co',
        password: 'Coffee123!',
        name: 'EcoBean Artisanal Roasters',
        industryCategory: 'Specialty Coffee & Subscriptions',
        apiKeyPrefix: 'pk_live_coffee'
      },
      {
        email: 'dev@cloudstack.net',
        password: 'Cloud123!',
        name: 'CloudStack Developer Cloud',
        industryCategory: 'SaaS & Developer Infrastructure',
        apiKeyPrefix: 'pk_live_cloud'
      }
    ]

    console.log('👥 Inserting 6 diverse merchants...')
    const insertedMerchants: (typeof merchants.$inferSelect)[] = []

    for (const m of merchantDefinitions) {
      const passwordHash = await bcrypt.hash(m.password, 10)
      const apiKey = await generateApiKey(m.apiKeyPrefix)
      const [record] = await db.insert(merchants).values({
        email: m.email,
        passwordHash,
        name: m.name,
        apiKey,
        industryCategory: m.industryCategory,
        isActive: true
      }).returning()
      insertedMerchants.push(record)
    }

    const [demoM, novaM, luxM, gameM, coffeeM, cloudM] = insertedMerchants

    // 3. Buyer Profiles & Network
    // Notice: Multiple buyers purchase across different merchants (cross-merchant purchasing network)
    const buyers = {
      alex: { email: 'alex.turner@gmail.com', ip: '172.56.21.89', country: 'US', device: 'macOS / Safari 17.4', isBot: false },
      sarah: { email: 'sarah.jenkins@gmail.com', ip: '98.245.112.44', country: 'US', device: 'iOS 17.5 / Mobile Safari', isBot: false },
      elena: { email: 'elena.rostova@vip-client.eu', ip: '82.165.197.1', country: 'FR', device: 'macOS / Chrome 124', isBot: false },
      michael: { email: 'michael.corporate@enterprise.com', ip: '198.51.100.22', country: 'US', device: 'Windows 11 / Edge 123', isBot: false },
      marcus: { email: 'marcus.webdev@freelance.org', ip: '73.189.44.12', country: 'US', device: 'Ubuntu Linux / Firefox 125', isBot: false },
      rachel: { email: 'rachel.green@gmail.com', ip: '104.28.19.45', country: 'GB', device: 'iOS 17.4 / Mobile Safari', isBot: false },
      carlos: { email: 'carlos.mendoza@yahoo.com', ip: '187.189.14.92', country: 'MX', device: 'Android 14 / Chrome Mobile', isBot: false },
      // Merchant-to-Merchant purchases (merchants buying from each other)
      gameFounder: { email: 'support@gamingvouchers.io', ip: '142.250.190.46', country: 'US', device: 'macOS / Chrome 124', isBot: false },
      coffeeFounder: { email: 'orders@ecocoffee.co', ip: '172.217.16.206', country: 'US', device: 'iPadOS / Safari', isBot: false },
      demoFounder: { email: 'demo@payguard.ai', ip: '64.233.160.1', country: 'US', device: 'macOS / Chrome 124', isBot: false },
      // Fraudsters / Bots (Attacking GameVault, Demo, and Luxury Palace)
      bot1: { email: 'carder_bot99@tempmail.ninja', ip: '185.220.101.5', country: 'RU', device: 'HeadlessChrome / Puppeteer', isBot: true },
      bot2: { email: 'stolen_bins_42@guerrillamail.com', ip: '185.220.101.7', country: 'RO', device: 'Python Requests / Script', isBot: true },
      bot3: { email: 'stealth_drop@10minutemail.com', ip: '194.26.29.112', country: 'UA', device: 'Tor Exit Node / Linux', isBot: true }
    }

    // 4. Generate Realistic Transaction Ledgers for each Merchant
    interface TxTemplate {
      merchant: typeof demoM
      buyer: typeof buyers.alex
      amount: number
      daysAgo: number
      hourOffset?: number
      cart: { name: string; qty: number; price: number }[]
      riskLevel: 'GREEN' | 'YELLOW' | 'RED'
      flags?: string[]
    }

    const txTemplates: TxTemplate[] = [
      // --- DEMO MERCHANT (Electronics, High Volume, Mixed Traffic) ---
      { merchant: demoM, buyer: buyers.alex, amount: 249.99, daysAgo: 0, cart: [{ name: 'Sony WH-1000XM5 Headphones', qty: 1, price: 249.99 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.sarah, amount: 1199.00, daysAgo: 1, cart: [{ name: 'Apple iPad Pro 11" M4', qty: 1, price: 1199.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.coffeeFounder, amount: 799.00, daysAgo: 2, cart: [{ name: 'Epson Commercial Receipt & Label Printer', qty: 1, price: 799.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.marcus, amount: 489.50, daysAgo: 3, cart: [{ name: 'LG 27" 4K IPS Ergonomic Monitor', qty: 1, price: 489.50 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.michael, amount: 2450.00, daysAgo: 4, cart: [{ name: 'Dell Precision 3660 Workstation', qty: 1, price: 2450.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.rachel, amount: 129.99, daysAgo: 5, cart: [{ name: 'Logitech MX Master 3S + Mechanical Mini', qty: 1, price: 129.99 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.carlos, amount: 649.00, daysAgo: 6, cart: [{ name: 'Samsung Galaxy Tab S9 FE+', qty: 1, price: 649.00 }], riskLevel: 'YELLOW', flags: ['GEO_MISMATCH'] },
      { merchant: demoM, buyer: buyers.bot1, amount: 3899.00, daysAgo: 7, cart: [{ name: 'NVIDIA GeForce RTX 4090 24GB GPU', qty: 2, price: 1949.50 }], riskLevel: 'RED', flags: ['TOR_DETECTED', 'DISPOSABLE_EMAIL', 'BOT_VELOCITY'] },
      { merchant: demoM, buyer: buyers.alex, amount: 89.95, daysAgo: 8, cart: [{ name: 'Anker Prime 20,000mAh Power Bank 200W', qty: 1, price: 89.95 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.sarah, amount: 349.00, daysAgo: 10, cart: [{ name: 'Bose QuietComfort Ultra Earbuds', qty: 1, price: 349.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.bot2, amount: 2850.00, daysAgo: 11, cart: [{ name: 'Apple MacBook Air 15" M3', qty: 2, price: 1425.00 }], riskLevel: 'RED', flags: ['VPN_DETECTED', 'DISPOSABLE_EMAIL', 'HIGH_AMOUNT'] },
      { merchant: demoM, buyer: buyers.marcus, amount: 179.99, daysAgo: 13, cart: [{ name: 'Keychron Q1 Pro Custom Mechanical Keyboard', qty: 1, price: 179.99 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.gameFounder, amount: 1540.00, daysAgo: 15, cart: [{ name: 'Ubiquiti UniFi Enterprise Gateway Router', qty: 1, price: 1540.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.elena, amount: 1890.00, daysAgo: 18, cart: [{ name: 'Leica Sofort 2 Instant Camera & Optics', qty: 2, price: 945.00 }], riskLevel: 'YELLOW', flags: ['HIGH_AMOUNT', 'INTL_CARD'] },
      { merchant: demoM, buyer: buyers.bot3, amount: 4200.00, daysAgo: 20, cart: [{ name: 'Apple Vision Pro 512GB VR Headset', qty: 1, price: 4200.00 }], riskLevel: 'RED', flags: ['TOR_DETECTED', 'BOT_VELOCITY', 'DISPOSABLE_EMAIL'] },
      { merchant: demoM, buyer: buyers.alex, amount: 45.00, daysAgo: 22, cart: [{ name: 'Thunderbolt 4 Pro Cable 2m', qty: 1, price: 45.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.michael, amount: 3120.00, daysAgo: 25, cart: [{ name: 'Lenovo ThinkPad P1 Gen 6 Workstation', qty: 1, price: 3120.00 }], riskLevel: 'GREEN' },
      { merchant: demoM, buyer: buyers.rachel, amount: 99.00, daysAgo: 28, cart: [{ name: 'CalDigit TS4 Thunderbolt Docking Station', qty: 1, price: 99.00 }], riskLevel: 'GREEN' },

      // --- LUXURY PALACE (High-Ticket Fashion & Watches, Target of Sophisticated Attacks) ---
      { merchant: luxM, buyer: buyers.elena, amount: 4850.00, daysAgo: 0, cart: [{ name: 'Rolex Oyster Perpetual 36mm Datejust', qty: 1, price: 4850.00 }], riskLevel: 'GREEN' },
      { merchant: luxM, buyer: buyers.sarah, amount: 2600.00, daysAgo: 2, cart: [{ name: 'Hermes Birkin Hand-Stitched Leather Belt', qty: 2, price: 1300.00 }], riskLevel: 'GREEN' },
      { merchant: luxM, buyer: buyers.bot1, amount: 7900.00, daysAgo: 4, cart: [{ name: 'Cartier Santos de Cartier Large Steel Watch', qty: 1, price: 7900.00 }], riskLevel: 'RED', flags: ['TOR_DETECTED', 'DISPOSABLE_EMAIL', 'HIGH_AMOUNT'] },
      { merchant: luxM, buyer: buyers.elena, amount: 3200.00, daysAgo: 6, cart: [{ name: 'Chanel Classic Flap Quilted Shoulder Bag', qty: 1, price: 3200.00 }], riskLevel: 'GREEN' },
      { merchant: luxM, buyer: buyers.michael, amount: 1850.00, daysAgo: 9, cart: [{ name: 'Tom Ford Wool-Silk Bespoke Dinner Tuxedo', qty: 1, price: 1850.00 }], riskLevel: 'GREEN' },
      { merchant: luxM, buyer: buyers.bot3, amount: 6400.00, daysAgo: 12, cart: [{ name: 'Patek Philippe Nautilus Cufflinks & Accessory', qty: 1, price: 6400.00 }], riskLevel: 'RED', flags: ['VPN_DETECTED', 'BOT_VELOCITY', 'DISPOSABLE_EMAIL'] },
      { merchant: luxM, buyer: buyers.rachel, amount: 1450.00, daysAgo: 16, cart: [{ name: 'Prada Cleo Brushed Leather Shoulder Bag', qty: 1, price: 1450.00 }], riskLevel: 'YELLOW', flags: ['INTL_CARD'] },
      { merchant: luxM, buyer: buyers.elena, amount: 5100.00, daysAgo: 21, cart: [{ name: 'Audemars Piguet Royal Oak Travel Case & Pouch', qty: 1, price: 5100.00 }], riskLevel: 'GREEN' },
      { merchant: luxM, buyer: buyers.demoFounder, amount: 2200.00, daysAgo: 27, cart: [{ name: 'Bottega Veneta Intrecciato Briefcase', qty: 1, price: 2200.00 }], riskLevel: 'GREEN' },

      // --- GAMEVAULT (Digital Gift Cards, High Velocity Carding Attacks) ---
      { merchant: gameM, buyer: buyers.alex, amount: 50.00, daysAgo: 0, cart: [{ name: 'Steam Wallet $50 Digital Gift Card', qty: 1, price: 50.00 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.marcus, amount: 100.00, daysAgo: 1, cart: [{ name: 'PlayStation Network $100 Code', qty: 1, price: 100.00 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.bot2, amount: 200.00, daysAgo: 1, cart: [{ name: 'Steam $100 Code', qty: 2, price: 100.00 }], riskLevel: 'RED', flags: ['FAST_CHECKOUT', 'DISPOSABLE_EMAIL', 'VPN_DETECTED'] },
      { merchant: gameM, buyer: buyers.bot2, amount: 200.00, daysAgo: 1, cart: [{ name: 'Steam $100 Code', qty: 2, price: 100.00 }], riskLevel: 'RED', flags: ['CARDING_BURST', 'DISPOSABLE_EMAIL'] },
      { merchant: gameM, buyer: buyers.bot2, amount: 200.00, daysAgo: 1, cart: [{ name: 'Steam $100 Code', qty: 2, price: 100.00 }], riskLevel: 'RED', flags: ['CARDING_BURST', 'FAST_CHECKOUT'] },
      { merchant: gameM, buyer: buyers.carlos, amount: 75.00, daysAgo: 3, cart: [{ name: 'Xbox Game Pass Ultimate 6-Month Key', qty: 1, price: 75.00 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.bot1, amount: 500.00, daysAgo: 5, cart: [{ name: 'Apple App Store $100 Gift Card', qty: 5, price: 100.00 }], riskLevel: 'RED', flags: ['TOR_DETECTED', 'BOT_VELOCITY'] },
      { merchant: gameM, buyer: buyers.alex, amount: 69.99, daysAgo: 7, cart: [{ name: 'Elden Ring: Shadow of the Erdtree Deluxe Steam Key', qty: 1, price: 69.99 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.rachel, amount: 25.00, daysAgo: 10, cart: [{ name: 'Nintendo eShop $25 Code', qty: 1, price: 25.00 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.bot3, amount: 400.00, daysAgo: 14, cart: [{ name: 'Razer Gold $100 Pin', qty: 4, price: 100.00 }], riskLevel: 'RED', flags: ['VPN_DETECTED', 'DISPOSABLE_EMAIL'] },
      { merchant: gameM, buyer: buyers.marcus, amount: 120.00, daysAgo: 19, cart: [{ name: 'World of Warcraft 6-Month Subscription Token', qty: 1, price: 120.00 }], riskLevel: 'GREEN' },
      { merchant: gameM, buyer: buyers.bot1, amount: 250.00, daysAgo: 24, cart: [{ name: 'Roblox 10,000 Robux Card', qty: 1, price: 250.00 }], riskLevel: 'RED', flags: ['TOR_DETECTED'] },

      // --- ECOBEAN ROASTERS (Artisanal Coffee & Subscriptions, Pristine Low Risk) ---
      { merchant: coffeeM, buyer: buyers.sarah, amount: 48.00, daysAgo: 0, cart: [{ name: 'Ethiopia Yirgacheffe Washed 1kg', qty: 1, price: 48.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.alex, amount: 36.50, daysAgo: 1, cart: [{ name: 'Colombia Geisha Micro-Lot 250g', qty: 1, price: 36.50 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.demoFounder, amount: 165.00, daysAgo: 3, cart: [{ name: 'Corporate Office Espresso Beans 5kg Bulk', qty: 1, price: 165.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.michael, amount: 120.00, daysAgo: 5, cart: [{ name: 'Fellow Ode Gen 2 Brew Burr Set', qty: 1, price: 120.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.marcus, amount: 28.00, daysAgo: 7, cart: [{ name: 'Guatemala Huehuetenango Whole Bean 500g', qty: 1, price: 28.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.gameFounder, amount: 84.00, daysAgo: 9, cart: [{ name: 'Cold Brew Blend 2kg', qty: 1, price: 84.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.rachel, amount: 65.00, daysAgo: 12, cart: [{ name: 'Monthly Coffee Roasters Club Subscription', qty: 1, price: 65.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.elena, amount: 145.00, daysAgo: 15, cart: [{ name: 'Hario V60 Copper Pour-Over Kit', qty: 1, price: 145.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.sarah, amount: 48.00, daysAgo: 21, cart: [{ name: 'Ethiopia Yirgacheffe Washed 1kg', qty: 1, price: 48.00 }], riskLevel: 'GREEN' },
      { merchant: coffeeM, buyer: buyers.carlos, amount: 32.00, daysAgo: 26, cart: [{ name: 'Costa Rica Tarrazu Honey Process 500g', qty: 1, price: 32.00 }], riskLevel: 'GREEN' },

      // --- CLOUDSTACK SAAS (Developer Hosting & Cloud Tools) ---
      { merchant: cloudM, buyer: buyers.gameFounder, amount: 450.00, daysAgo: 0, cart: [{ name: 'Dedicated Redis & Anti-DDoS Node Cluster', qty: 1, price: 450.00 }], riskLevel: 'GREEN' },
      { merchant: cloudM, buyer: buyers.marcus, amount: 79.00, daysAgo: 2, cart: [{ name: 'Pro Developer Cloud Container Tier', qty: 1, price: 79.00 }], riskLevel: 'GREEN' },
      { merchant: cloudM, buyer: buyers.michael, amount: 1250.00, daysAgo: 5, cart: [{ name: 'Enterprise VPC Peering & Audit Logs Tier', qty: 1, price: 1250.00 }], riskLevel: 'GREEN' },
      { merchant: cloudM, buyer: buyers.demoFounder, amount: 320.00, daysAgo: 8, cart: [{ name: 'Automated Global CDN Edge Bandwidth', qty: 1, price: 320.00 }], riskLevel: 'GREEN' },
      { merchant: cloudM, buyer: buyers.bot1, amount: 890.00, daysAgo: 11, cart: [{ name: 'High-Compute GPU Instance 30-Day Lease', qty: 1, price: 890.00 }], riskLevel: 'RED', flags: ['TOR_DETECTED', 'DISPOSABLE_EMAIL'] },
      { merchant: cloudM, buyer: buyers.alex, amount: 49.00, daysAgo: 16, cart: [{ name: 'Starter Postgres Managed DB', qty: 1, price: 49.00 }], riskLevel: 'GREEN' },
      { merchant: cloudM, buyer: buyers.rachel, amount: 199.00, daysAgo: 23, cart: [{ name: 'Team Collaborator 5-Seat Cloud License', qty: 1, price: 199.00 }], riskLevel: 'GREEN' },

      // --- NOVA RETAIL (General Apparel & Sneaker Drops) ---
      { merchant: novaM, buyer: buyers.sarah, amount: 185.00, daysAgo: 1, cart: [{ name: 'Nike Air Max 1 \'86 OG Sneakers', qty: 1, price: 185.00 }], riskLevel: 'GREEN' },
      { merchant: novaM, buyer: buyers.rachel, amount: 120.00, daysAgo: 3, cart: [{ name: 'Oversized Merino Wool Cardigan', qty: 1, price: 120.00 }], riskLevel: 'GREEN' },
      { merchant: novaM, buyer: buyers.bot2, amount: 950.00, daysAgo: 4, cart: [{ name: 'Limited Edition Travis Scott Low Sneakers', qty: 5, price: 190.00 }], riskLevel: 'RED', flags: ['BOT_VELOCITY', 'FAST_CHECKOUT', 'DISPOSABLE_EMAIL'] },
      { merchant: novaM, buyer: buyers.carlos, amount: 79.50, daysAgo: 6, cart: [{ name: 'Raw Selvedge Denim Jeans', qty: 1, price: 79.50 }], riskLevel: 'GREEN' },
      { merchant: novaM, buyer: buyers.alex, amount: 65.00, daysAgo: 9, cart: [{ name: 'Heavyweight Pima Cotton Tee 3-Pack', qty: 1, price: 65.00 }], riskLevel: 'GREEN' },
      { merchant: novaM, buyer: buyers.elena, amount: 340.00, daysAgo: 14, cart: [{ name: 'Cashmere Ribbed Scarf & Beanie Set', qty: 1, price: 340.00 }], riskLevel: 'YELLOW', flags: ['INTL_CARD'] },
      { merchant: novaM, buyer: buyers.michael, amount: 210.00, daysAgo: 18, cart: [{ name: 'Italian Leather Oxford Dress Shoes', qty: 1, price: 210.00 }], riskLevel: 'GREEN' },
      { merchant: novaM, buyer: buyers.marcus, amount: 95.00, daysAgo: 25, cart: [{ name: 'Water-Resistant Commuter Backpack 24L', qty: 1, price: 95.00 }], riskLevel: 'GREEN' }
    ]

    console.log(`📦 Generating ${txTemplates.length} realistic transactions and ML risk evaluations...`)

    let greenCount = 0
    let yellowCount = 0
    let redCount = 0

    for (const t of txTemplates) {
      let score: number
      let status: 'COMPLETED' | 'PENDING' | 'FAILED'
      let flags: string[] = t.flags || []
      let shapExplanation: Array<{ feature: string; impact: number }> = []

      if (t.riskLevel === 'GREEN') {
        greenCount++
        score = parseFloat((0.03 + Math.random() * 0.22).toFixed(3))
        status = 'COMPLETED'
        shapExplanation = [
          { feature: 'Corporate/Consumer Email Domain', impact: -0.14 },
          { feature: 'Residential ISP Verified', impact: -0.11 },
          { feature: 'Consistent Browser Fingerprint', impact: -0.08 },
          { feature: 'Human Behavioral Dwell Cadence', impact: -0.06 }
        ]
      } else if (t.riskLevel === 'YELLOW') {
        yellowCount++
        score = parseFloat((0.42 + Math.random() * 0.23).toFixed(3))
        status = Math.random() > 0.4 ? 'COMPLETED' : 'PENDING'
        if (flags.length === 0) flags.push('ELEVATED_AMOUNT')
        shapExplanation = [
          { feature: 'High Transaction Ticket Value', impact: +0.22 },
          { feature: 'New Hardware Device Signature', impact: +0.14 },
          { feature: 'Non-Standard Geographic Routing', impact: +0.12 },
          { feature: 'Residential ISP Network', impact: -0.09 }
        ]
      } else {
        redCount++
        score = parseFloat((0.84 + Math.random() * 0.15).toFixed(3))
        // High-risk transactions are PRE-CAPTURE INTERCEPTED -> status FAILED (prevents dispute & fee)
        status = 'FAILED'
        if (flags.length === 0) flags.push('VPN_DETECTED', 'DISPOSABLE_EMAIL')
        shapExplanation = [
          { feature: 'Tor / Bulletproof Proxy Exit Node', impact: +0.38 },
          { feature: 'Disposable Mailbox Provider', impact: +0.32 },
          { feature: 'High-Velocity Bot Checkout Cadence (<2s)', impact: +0.24 },
          { feature: 'Rapid Successive BIN Probing Pattern', impact: +0.19 }
        ]
      }

      const txDate = getPastDate(t.daysAgo, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
      const paypalOrderId = `PAYPAL_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
      const paypalCaptureId = status === 'COMPLETED' ? `CAP_${crypto.randomBytes(8).toString('hex').toUpperCase()}` : null

      const deviceData = {
        ip: t.buyer.ip,
        country: t.buyer.country,
        userAgent: t.buyer.device,
        screenResolution: t.buyer.isBot ? '800x600' : '1920x1080',
        platform: t.buyer.isBot ? 'Linux x86_64' : 'Desktop/Mobile OS',
        isVpn: flags.includes('VPN_DETECTED') || flags.includes('TOR_DETECTED'),
        isTor: flags.includes('TOR_DETECTED')
      }

      const sessionData = {
        dwellTimeSeconds: t.buyer.isBot ? 3 : Math.floor(45 + Math.random() * 180),
        checkoutSpeedSeconds: t.buyer.isBot ? 1.5 : Math.floor(18 + Math.random() * 45),
        mouseMovementsCount: t.buyer.isBot ? 0 : Math.floor(80 + Math.random() * 250),
        formAutofilled: t.buyer.isBot
      }

      // Insert transaction
      const [insertedTx] = await db.insert(transactions).values({
        merchantId: t.merchant.id,
        buyerEmail: t.buyer.email,
        amount: t.amount.toFixed(2),
        currency: 'USD',
        riskScore: score.toFixed(3),
        riskCategory: t.riskLevel,
        status,
        paypalOrderId,
        paypalCaptureId,
        deviceData,
        sessionData,
        cartItems: t.cart,
        metadata: {
          seeded: true,
          platform: 'PayGuard v2 Engine',
          interceptedPreCapture: status === 'FAILED'
        },
        createdAt: txDate,
        updatedAt: txDate
      }).returning()

      // Insert corresponding risk score evaluation
      await db.insert(riskScores).values({
        transactionId: insertedTx.id,
        overallScore: score.toFixed(3),
        mlScore: (score * 0.95 + (Math.random() * 0.05)).toFixed(3),
        patternScore: t.riskLevel === 'RED' ? '0.880' : t.riskLevel === 'YELLOW' ? '0.450' : '0.080',
        deviceScore: flags.includes('TOR_DETECTED') || flags.includes('VPN_DETECTED') ? '0.920' : '0.050',
        flags,
        explanation: shapExplanation,
        createdAt: txDate
      })
    }

    console.log(`\n✅ Database seeding successfully finished!`)
    console.log(`📊 Statistics:`)
    console.log(`  - Total Merchants: ${insertedMerchants.length}`)
    console.log(`  - Total Transactions: ${txTemplates.length}`)
    console.log(`  - 🟢 Low Risk (GREEN - Captured): ${greenCount}`)
    console.log(`  - 🟡 Medium Risk (YELLOW - Review/Auth): ${yellowCount}`)
    console.log(`  - 🔴 High Risk (RED - Pre-Capture Intercepted): ${redCount}`)

    console.log('\n📋 Merchant Login Credentials for Testing:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    merchantDefinitions.forEach((m, idx) => {
      console.log(`[${idx + 1}] ${m.name}`)
      console.log(`    Category: ${m.industryCategory}`)
      console.log(`    Email:    ${m.email}`)
      console.log(`    Password: ${m.password}`)
      console.log(`    API Key:  ${insertedMerchants[idx].apiKey}`)
      console.log('────────────────────────────────────────────────────────────────────────────')
    })

  } catch (error) {
    console.error('❌ Seeding failed with error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seed()
