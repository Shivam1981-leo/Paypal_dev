import { db } from '@/config/database'
import { webhookEvents, transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { paypalService } from './paypal.service'
import { env } from '@/config/env'

interface PayPalWebhookHeaders {
  'paypal-transmission-id': string
  'paypal-transmission-time': string
  'paypal-transmission-sig': string
  'paypal-cert-url': string
  'paypal-auth-algo': string
}

export class WebhookService {
  /**
   * Verify PayPal webhook signature
   */
  async verifySignature(
    headers: PayPalWebhookHeaders,
    body: any
  ): Promise<boolean> {
    if (!env.PAYPAL_WEBHOOK_ID) {
      console.warn('⚠️ PAYPAL_WEBHOOK_ID not set, skipping signature verification')
      return true // Allow in development if webhook ID not configured
    }

    try {
      const verified = await paypalService.verifyWebhookSignature({
        authAlgo: headers['paypal-auth-algo'],
        certUrl: headers['paypal-cert-url'],
        transmissionId: headers['paypal-transmission-id'],
        transmissionSig: headers['paypal-transmission-sig'],
        transmissionTime: headers['paypal-transmission-time'],
        webhookId: env.PAYPAL_WEBHOOK_ID,
        webhookEvent: body
      })

      return verified
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error)
      return false
    }
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    eventType: string,
    eventId: string,
    payload: any
  ): Promise<void> {
    // Store webhook event
    const [event] = await db.insert(webhookEvents).values({
      eventType,
      paypalEventId: eventId,
      payload,
      processed: false
    }).returning()

    try {
      // Process different event types
      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCaptured(payload)
          break

        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaymentDenied(payload)
          break

        case 'PAYMENT.CAPTURE.REFUNDED':
          await this.handlePaymentRefunded(payload)
          break

        case 'CHECKOUT.ORDER.APPROVED':
          await this.handleOrderApproved(payload)
          break

        default:
          console.log(`ℹ️ Unhandled webhook event type: ${eventType}`)
      }

      // Mark as processed
      await db.update(webhookEvents)
        .set({
          processed: true,
          processedAt: new Date()
        })
        .where(eq(webhookEvents.id, event.id))

      console.log(`✅ Webhook processed: ${eventType} (${eventId})`)
    } catch (error: any) {
      console.error(`❌ Failed to process webhook ${eventId}:`, error)

      // Store error
      await db.update(webhookEvents)
        .set({
          error: error.message
        })
        .where(eq(webhookEvents.id, event.id))

      throw error
    }
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(payload: any): Promise<void> {
    const captureId = payload.resource?.id
    const orderId = payload.resource?.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.warn('⚠️ Order ID not found in payment capture event')
      return
    }

    // Find transaction by PayPal order ID
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.paypalOrderId, orderId)
    })

    if (!transaction) {
      console.warn(`⚠️ Transaction not found for order ${orderId}`)
      return
    }

    // Update transaction status
    await db.update(transactions)
      .set({
        status: 'COMPLETED',
        paypalCaptureId: captureId,
        updatedAt: new Date(),
        metadata: payload.resource
      })
      .where(eq(transactions.id, transaction.id))

    console.log(`✅ Payment captured for transaction ${transaction.id}`)
  }

  /**
   * Handle payment denied event
   */
  private async handlePaymentDenied(payload: any): Promise<void> {
    const orderId = payload.resource?.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.warn('⚠️ Order ID not found in payment denied event')
      return
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.paypalOrderId, orderId)
    })

    if (!transaction) {
      console.warn(`⚠️ Transaction not found for order ${orderId}`)
      return
    }

    await db.update(transactions)
      .set({
        status: 'FAILED',
        updatedAt: new Date(),
        metadata: payload.resource
      })
      .where(eq(transactions.id, transaction.id))

    console.log(`✅ Payment denied for transaction ${transaction.id}`)
  }

  /**
   * Handle payment refunded event
   */
  private async handlePaymentRefunded(payload: any): Promise<void> {
    const captureId = payload.resource?.supplementary_data?.related_ids?.capture_id

    if (!captureId) {
      console.warn('⚠️ Capture ID not found in refund event')
      return
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.paypalCaptureId, captureId)
    })

    if (!transaction) {
      console.warn(`⚠️ Transaction not found for capture ${captureId}`)
      return
    }

    await db.update(transactions)
      .set({
        status: 'REFUNDED',
        updatedAt: new Date(),
        metadata: payload.resource
      })
      .where(eq(transactions.id, transaction.id))

    console.log(`✅ Payment refunded for transaction ${transaction.id}`)
  }

  /**
   * Handle order approved event
   */
  private async handleOrderApproved(payload: any): Promise<void> {
    const orderId = payload.resource?.id

    if (!orderId) {
      console.warn('⚠️ Order ID not found in order approved event')
      return
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.paypalOrderId, orderId)
    })

    if (!transaction) {
      console.warn(`⚠️ Transaction not found for order ${orderId}`)
      return
    }

    await db.update(transactions)
      .set({
        status: 'APPROVED',
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transaction.id))

    console.log(`✅ Order approved for transaction ${transaction.id}`)
  }

  /**
   * Get unprocessed webhooks
   */
  async getUnprocessedWebhooks(limit: number = 100): Promise<any[]> {
    return db.query.webhookEvents.findMany({
      where: eq(webhookEvents.processed, false),
      limit,
      orderBy: (webhookEvents, { asc }) => [asc(webhookEvents.createdAt)]
    })
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(webhookId: string): Promise<void> {
    const webhook = await db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.id, webhookId)
    })

    if (!webhook) {
      throw new Error('Webhook not found')
    }

    await this.processWebhook(
      webhook.eventType,
      webhook.paypalEventId || webhook.id,
      webhook.payload
    )
  }
}

export const webhookService = new WebhookService()
