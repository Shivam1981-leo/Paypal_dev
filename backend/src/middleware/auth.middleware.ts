import { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from '@/services/auth.service'

declare module 'fastify' {
  interface FastifyRequest {
    merchant?: {
      id: string
      email: string
      name: string
      apiKey: string
      isActive: boolean
    }
  }
}

/**
 * Verify JWT token from Authorization header
 */
export async function verifyJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<{ id?: string; merchantId?: string }>()

    if (!decoded || typeof decoded !== 'object' || (!decoded.merchantId && !decoded.id)) {
      return reply.status(401).send({
        error: 'Invalid token'
      })
    }

    // Attach merchant data to request (guarantee both id and merchantId)
    const payload = decoded as any
    request.merchant = {
      ...payload,
      id: payload.id || payload.merchantId,
      merchantId: payload.merchantId || payload.id
    }
  } catch (error) {
    return reply.status(401).send({
      error: 'Authentication required'
    })
  }
}

/**
 * Verify API key from X-API-Key header
 */
export async function verifyApiKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string

  if (!apiKey) {
    return reply.status(401).send({
      error: 'API key required'
    })
  }

  const merchant = await authService.verifyApiKey(apiKey)

  if (!merchant) {
    return reply.status(401).send({
      error: 'Invalid API key'
    })
  }

  // Attach merchant data to request
  request.merchant = {
    ...merchant,
    merchantId: merchant.id
  } as any
}

/**
 * Verify either JWT or API key (flexible authentication)
 */
export async function verifyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string
  const authHeader = request.headers.authorization

  // Try API key first
  if (apiKey) {
    return verifyApiKey(request, reply)
  }

  // Try JWT
  if (authHeader?.startsWith('Bearer ')) {
    return verifyJWT(request, reply)
  }

  return reply.status(401).send({
    error: 'Authentication required (JWT or API key)'
  })
}
