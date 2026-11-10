import 'dotenv/config'
import { paypalService } from '../src/services/paypal.service.js'

async function testPayPal() {
  console.log('🧪 Testing PayPal Integration...\n')
  console.log('Environment:', process.env.PAYPAL_MODE)
  console.log('Client ID:', process.env.PAYPAL_CLIENT_ID?.substring(0, 10) + '...\n')

  try {
    // Test 1: Get access token
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Test 1: Getting access token...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const token = await paypalService.getAccessToken()
    console.log('✅ Access token obtained:', token.substring(0, 20) + '...')
    console.log(`   Token length: ${token.length} characters\n`)

    // Test 2: Create order
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Test 2: Creating order...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const order = await paypalService.createOrder(100.00, 'USD')
    console.log('✅ Order created successfully!')
    console.log('   Order ID:', order.id)
    console.log('   Status:', order.status)
    console.log('   Approve URL:', order.links.find(l => l.rel === 'approve')?.href)
    console.log('')

    // Test 3: Get order details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Test 3: Getting order details...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const details = await paypalService.getOrderDetails(order.id)
    console.log('✅ Order details retrieved')
    console.log('   Amount:', details.purchase_units[0].amount.value, details.purchase_units[0].amount.currency_code)
    console.log('   Intent:', details.intent)
    console.log('   Create time:', details.create_time)
    console.log('')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 All PayPal tests passed!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📝 Summary:')
    console.log('   ✅ OAuth authentication working')
    console.log('   ✅ Order creation working')
    console.log('   ✅ Order retrieval working')
    console.log('')
    console.log('✨ PayPal integration is ready!\n')

  } catch (error: any) {
    console.error('\n❌ PayPal test failed!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error.message)
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2))
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    process.exit(1)
  }
}

testPayPal()
