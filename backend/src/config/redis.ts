import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  }
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err) => {
  console.error('❌ Redis error:', err)
})

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    console.log('✅ Redis health check passed')
    return true
  } catch (error) {
    console.error('❌ Redis health check failed:', error)
    return false
  }
}

// Cache helper functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
