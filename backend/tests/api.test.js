
const request = require('supertest')
const app = require('../server')

describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200)
      
      expect(res.body.status).toBe('ok')
      expect(res.body.timestamp).toBeDefined()
    })
  })

  describe('User Routes', () => {
    describe('GET /api/user/:address/nfts', () => {
      it('should return user NFTs', async () => {
        const address = '0x1234567890123456789012345678901234567890'
        
        const res = await request(app)
          .get(`/api/user/${address}/nfts`)
          .expect(200)
        
        expect(res.body.success).toBe(true)
        expect(res.body.data.nfts).toBeDefined()
        expect(Array.isArray(res.body.data.nfts)).toBe(true)
      })
      
      it('should reject invalid address', async () => {
        const invalidAddress = 'invalid-address'
        
        await request(app)
          .get(`/api/user/${invalidAddress}/nfts`)
          .expect(400)
      })
    })

    describe('GET /api/user/:address/loans', () => {
      it('should return user loans', async () => {
        const address = '0x1234567890123456789012345678901234567890'
        
        const res = await request(app)
          .get(`/api/user/${address}/loans`)
          .expect(200)
        
        expect(res.body.success).toBe(true)
        expect(res.body.data.loans).toBeDefined()
      })
    })
  })

  describe('Analytics Routes', () => {
    describe('GET /api/analytics/collections', () => {
      it('should return collections data', async () => {
        const res = await request(app)
          .get('/api/analytics/collections')
          .expect(200)
        
        expect(res.body.success).toBe(true)
        expect(res.body.data.collections).toBeDefined()
        expect(Array.isArray(res.body.data.collections)).toBe(true)
      })
    })
  })

  describe('Auth Routes', () => {
    describe('GET /api/auth/nonce', () => {
      it('should return nonce', async () => {
        const res = await request(app)
          .get('/api/auth/nonce?address=0x1234567890123456789012345678901234567890')
          .expect(200)
        
        expect(res.body.nonce).toBeDefined()
        expect(typeof res.body.nonce).toBe('string')
      })
    })
  })
})
