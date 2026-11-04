import { pgTable, uuid, varchar, timestamp, decimal, jsonb, index, text, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Merchants table
export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
  industryCategory: varchar('industry_category', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  emailIdx: index('merchants_email_idx').on(table.email),
  apiKeyIdx: index('merchants_api_key_idx').on(table.apiKey)
}))

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => merchants.id).notNull(),
  buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  riskScore: decimal('risk_score', { precision: 4, scale: 3 }),
  riskCategory: varchar('risk_category', { length: 10 }), // GREEN, YELLOW, RED
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  paypalOrderId: varchar('paypal_order_id', { length: 50 }),
  paypalCaptureId: varchar('paypal_capture_id', { length: 50 }),
  deviceData: jsonb('device_data'),
  sessionData: jsonb('session_data'),
  cartItems: jsonb('cart_items'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  merchantIdIdx: index('transactions_merchant_id_idx').on(table.merchantId),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  riskCategoryIdx: index('transactions_risk_category_idx').on(table.riskCategory),
  statusIdx: index('transactions_status_idx').on(table.status)
}))

// Risk scores table
export const riskScores = pgTable('risk_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  overallScore: decimal('overall_score', { precision: 4, scale: 3 }).notNull(),
  mlScore: decimal('ml_score', { precision: 4, scale: 3 }),
  patternScore: decimal('pattern_score', { precision: 4, scale: 3 }),
  deviceScore: decimal('device_score', { precision: 4, scale: 3 }),
  flags: jsonb('flags').$type<string[]>(),
  explanation: jsonb('explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  transactionIdIdx: index('risk_scores_transaction_id_idx').on(table.transactionId)
}))

// Webhook events table
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  paypalEventId: varchar('paypal_event_id', { length: 100 }),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').default(false).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  eventTypeIdx: index('webhook_events_type_idx').on(table.eventType),
  processedIdx: index('webhook_events_processed_idx').on(table.processed)
}))

// Relations
export const merchantsRelations = relations(merchants, ({ many }) => ({
  transactions: many(transactions)
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id]
  }),
  riskScores: many(riskScores)
}))

export const riskScoresRelations = relations(riskScores, ({ one }) => ({
  transaction: one(transactions, {
    fields: [riskScores.transactionId],
    references: [transactions.id]
  })
}))

// Types
export type Merchant = typeof merchants.$inferSelect
export type NewMerchant = typeof merchants.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type RiskScore = typeof riskScores.$inferSelect
export type NewRiskScore = typeof riskScores.$inferInsert
export type WebhookEvent = typeof webhookEvents.$inferSelect
export type NewWebhookEvent = typeof webhookEvents.$inferInsert
