import { env } from '@/config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta))
    }
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta))
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta))
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta))
  }

  request(method: string, path: string, statusCode: number, duration: number): void {
    const emoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅'
    this.info(`${emoji} ${method} ${path} - ${statusCode} (${duration}ms)`)
  }
}

export const logger = new Logger()
