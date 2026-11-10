import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null // stop reconnecting if redis server is unavailable
    }
    return Math.min(times * 100, 2000)
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY'
    if (err?.message?.includes(targetError)) {
      return true
    }
    return false
  }
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err: any) => {
  // Only log if not a standard ECONNREFUSED/EACCES to prevent console flood
  if (err?.code !== 'ECONNREFUSED' && err?.code !== 'EACCES') {
    console.error('❌ Redis error:', err?.message || err)
  }
})

export async function checkRedisConnection(): Promise<boolean> {
  try {
    if (redis.status === 'wait') {
      await redis.connect()
    }
    await redis.ping()
    console.log('✅ Redis health check passed')
    return true
  } catch (error: any) {
    console.error('❌ Redis health check failed:', error?.message || error)
    return false
  }
}

// Cache helper functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status !== 'ready') return null
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (redis.status !== 'ready') return
      await redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch {
      // Non-critical cache failure
    }
  },

  async del(key: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return
      await redis.del(key)
    } catch {
      // Non-critical cache failure
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch {
      // Non-critical cache failure
    }
  }
}
