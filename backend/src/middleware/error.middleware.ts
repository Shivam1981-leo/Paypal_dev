import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    })
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation failed',
      details: error.validation
    })
  }

  // Custom application errors
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      error: error.message
    })
  }

  // Log server errors
  console.error('❌ Server error:', {
    url: request.url,
    method: request.method,
    error: error.message,
    stack: error.stack
  })

  // Don't expose internal errors to client
  return reply.status(500).send({
    error: 'Internal server error'
  })
}

export function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  reply.status(404).send({
    error: 'Route not found',
    path: request.url,
    method: request.method
  })
}
