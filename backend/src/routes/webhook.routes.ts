import { FastifyInstance } from 'fastify'
import { webhookService } from '@/services/webhook.service'

export async function webhookRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /webhook
   * Receive PayPal webhook events
   */
  fastify.post('/webhook', async (request, reply) => {
    const headers = request.headers as any
    const body = request.body as any

    // Verify webhook signature
    const isValid = await webhookService.verifySignature(
      {
        'paypal-transmission-id': headers['paypal-transmission-id'],
        'paypal-transmission-time': headers['paypal-transmission-time'],
        'paypal-transmission-sig': headers['paypal-transmission-sig'],
        'paypal-cert-url': headers['paypal-cert-url'],
        'paypal-auth-algo': headers['paypal-auth-algo']
      },
      body
    )

    if (!isValid) {
      return reply.status(401).send({
        error: 'Invalid webhook signature'
      })
    }

    // Process webhook asynchronously
    const eventType = body.event_type
    const eventId = body.id

    try {
      await webhookService.processWebhook(eventType, eventId, body)

      return reply.status(200).send({
        message: 'Webhook received'
      })
    } catch (error: any) {
      console.error('❌ Webhook processing error:', error)

      // Still return 200 to PayPal to avoid retries
      // The error is logged and stored in the database
      return reply.status(200).send({
        message: 'Webhook received (processing failed)'
      })
    }
  })

  /**
   * GET /webhook/unprocessed
   * Get unprocessed webhooks (internal use)
   */
  fastify.get('/webhook/unprocessed', async (request, reply) => {
    const webhooks = await webhookService.getUnprocessedWebhooks()

    return reply.send({ webhooks })
  })

  /**
   * POST /webhook/:id/retry
   * Retry failed webhook (internal use)
   */
  fastify.post('/webhook/:id/retry', async (request, reply) => {
    const { id } = request.params as { id: string }

    await webhookService.retryWebhook(id)

    return reply.send({
      message: 'Webhook retried'
    })
  })
}
