import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'

import { env } from './config/env'
import { db, checkDatabaseConnection } from './config/database'
import { redis, checkRedisConnection } from './config/redis'
import { elastic, checkElasticConnection, initializeIndices } from './config/elastic'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { logger } from './utils/logger'

// Routes
import { authRoutes } from './routes/auth.routes'
import { merchantsRoutes } from './routes/merchants.routes'
import { transactionsRoutes } from './routes/transactions.routes'
import { riskCheckRoutes } from './routes/risk-check.routes'
import { webhookRoutes } from './routes/webhook.routes'

const fastify = Fastify({
  logger: false, // Using custom logger
  requestIdHeader: 'x-request-id',
  trustProxy: true
})

// Register plugins
async function registerPlugins(): Promise<void> {
  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: false
  })

  // CORS
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true
  })

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '7d'
    }
  })

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    skipOnError: true
  })

  // WebSocket
  await fastify.register(websocket)

  logger.info('✅ Plugins registered')
}

// Register routes
async function registerRoutes(): Promise<void> {
  // Health check
  fastify.get('/health', async (request, reply) => {
    const dbHealth = await checkDatabaseConnection()
    const redisHealth = await checkRedisConnection()
    const elasticHealth = await checkElasticConnection()

    const isHealthy = dbHealth && redisHealth && elasticHealth

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'up' : 'down',
        redis: redisHealth ? 'up' : 'down',
        elasticsearch: elasticHealth ? 'up' : 'down'
      }
    })
  })

  // API info
  fastify.get('/', async (request, reply) => {
    return reply.send({
      name: 'PayGuard AI API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api/v1',
        websocket: '/ws'
      }
    })
  })

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/v1' })
  await fastify.register(merchantsRoutes, { prefix: '/api/v1' })
  await fastify.register(transactionsRoutes, { prefix: '/api/v1' })
  await fastify.register(riskCheckRoutes, { prefix: '/api/v1' })
  await fastify.register(webhookRoutes, { prefix: '/api/v1' })

  // WebSocket route for real-time updates
  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, request) => {
      logger.info('WebSocket connection established')

      connection.socket.on('message', (message) => {
        // Echo back for now - will be enhanced for real-time risk alerts
        connection.socket.send(JSON.stringify({
          type: 'echo',
          data: message.toString(),
          timestamp: new Date().toISOString()
        }))
      })

      connection.socket.on('close', () => {
        logger.info('WebSocket connection closed')
      })

      connection.socket.on('error', (error) => {
        logger.error('WebSocket error', { error: error.message })
      })

      // Send welcome message
      connection.socket.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to PayGuard AI WebSocket',
        timestamp: new Date().toISOString()
      }))
    })
  })

  logger.info('✅ Routes registered')
}

// Request logging middleware
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now()
})

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - (request.startTime || Date.now())
  logger.request(request.method, request.url, reply.statusCode, duration)
})

// Error handlers
fastify.setErrorHandler(errorHandler)
fastify.setNotFoundHandler(notFoundHandler)

// Graceful shutdown
async function closeGracefully(signal: string): Promise<void> {
  logger.info(`Received ${signal}, closing gracefully...`)

  try {
    await fastify.close()
    await redis.quit()
    await elastic.close()
    logger.info('✅ Server closed gracefully')
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown', { error })
    process.exit(1)
  }
}

process.on('SIGTERM', () => closeGracefully('SIGTERM'))
process.on('SIGINT', () => closeGracefully('SIGINT'))

// Start server
async function start(): Promise<void> {
  try {
    // Check connections
    logger.info('🔍 Checking service connections...')
    await checkDatabaseConnection()
    await checkRedisConnection()
    await checkElasticConnection()

    // Initialize Elasticsearch indices
    await initializeIndices()

    // Register plugins and routes
    await registerPlugins()
    await registerRoutes()

    // Start listening
    await fastify.listen({
      port: env.PORT,
      host: env.HOST
    })

    logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`)
    logger.info(`🔌 WebSocket available at ws://${env.HOST}:${env.PORT}/ws`)
    logger.info(`🌍 Environment: ${env.NODE_ENV}`)

  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

// Extend FastifyRequest with custom properties
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number
  }
}

// Start the server
start()
