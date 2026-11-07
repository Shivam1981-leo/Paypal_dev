import { Client } from '@elastic/elasticsearch'

const elasticNode = process.env.ELASTIC_NODE || 'http://localhost:9200'

export const elastic = new Client({
  node: elasticNode,
  maxRetries: 1,
  requestTimeout: 3000,
  sniffOnStart: false
})

export async function checkElasticConnection(): Promise<boolean> {
  try {
    const health = await elastic.cluster.health()
    console.log('✅ Elasticsearch connected - Status:', health.status)
    return true
  } catch (error: any) {
    console.warn('⚠️ Elasticsearch connection failed:', error?.message || error)
    return false
  }
}

// Initialize indices
export async function initializeIndices(): Promise<void> {
  try {
    // Transactions index
    const transactionsExists = await elastic.indices.exists({
      index: 'transactions'
    })

    if (!transactionsExists) {
      await elastic.indices.create({
        index: 'transactions',
        body: {
          mappings: {
            properties: {
              merchantId: { type: 'keyword' },
              buyerEmail: { type: 'keyword' },
              amount: { type: 'float' },
              currency: { type: 'keyword' },
              riskScore: { type: 'float' },
              riskCategory: { type: 'keyword' },
              status: { type: 'keyword' },
              paypalOrderId: { type: 'keyword' },
              deviceData: { type: 'object' },
              sessionData: { type: 'object' },
              createdAt: { type: 'date' }
            }
          }
        }
      })
      console.log('✅ Transactions index created')
    }

    // Risk scores index
    const riskScoresExists = await elastic.indices.exists({
      index: 'risk-scores'
    })

    if (!riskScoresExists) {
      await elastic.indices.create({
        index: 'risk-scores',
        body: {
          mappings: {
            properties: {
              transactionId: { type: 'keyword' },
              overallScore: { type: 'float' },
              mlScore: { type: 'float' },
              patternScore: { type: 'float' },
              deviceScore: { type: 'float' },
              flags: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      })
      console.log('✅ Risk scores index created')
    }
  } catch (error: any) {
    console.warn('⚠️ Failed to initialize Elasticsearch indices (continuing):', error?.message || error)
  }
}

// Search helper functions
export const search = {
  async indexTransaction(id: string, data: any): Promise<void> {
    try {
      await elastic.index({
        index: 'transactions',
        id,
        document: data
      })
    } catch (error: any) {
      // Non-critical background indexing
    }
  },

  async searchTransactions(query: any): Promise<any> {
    try {
      const result = await elastic.search({
        index: 'transactions',
        body: query
      })
      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source
      }))
    } catch (error: any) {
      console.warn('⚠️ Elasticsearch search failed:', error?.message || error)
      return []
    }
  },

  async aggregateRiskScores(merchantId: string, days: number = 30): Promise<any> {
    try {
      const result = await elastic.search({
        index: 'risk-scores',
        body: {
          query: {
            bool: {
              must: [
                { term: { merchantId } },
                { range: { createdAt: { gte: `now-${days}d` } } }
              ]
            }
          },
          aggs: {
            avgRiskScore: { avg: { field: 'overallScore' } },
            riskDistribution: {
              terms: { field: 'flags' }
            }
          }
        }
      })
      return result.aggregations
    } catch (error: any) {
      console.warn('⚠️ Elasticsearch aggregation failed:', error?.message || error)
      return null
    }
  }
}
