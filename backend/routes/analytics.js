
const express = require('express')
const router = express.Router()
const logger = require('../utils/logger')

// GET /analytics/collections - Collection performance data
router.get('/collections', async (req, res) => {
  try {
    // Mock collection data (in production, aggregate from DB and external APIs)
    const collections = [
      {
        name: 'Bored Ape Yacht Club',
        contractAddress: '0x1234567890123456789012345678901234567890',
        floorPrice: 45.2,
        volume24h: 1250,
        change24h: 5.8,
        utilityScore: 95,
        volatility: 15.2,
        expectedYield: 6.5,
        totalSupply: 10000,
        activeLoans: 156
      },
      {
        name: 'CryptoPunks',
        contractAddress: '0x2345678901234567890123456789012345678901',
        floorPrice: 78.5,
        volume24h: 980,
        change24h: -2.1,
        utilityScore: 88,
        volatility: 12.8,
        expectedYield: 5.2,
        totalSupply: 10000,
        activeLoans: 89
      },
      {
        name: 'Azuki',
        contractAddress: '0x3456789012345678901234567890123456789012',
        floorPrice: 12.3,
        volume24h: 560,
        change24h: 12.4,
        utilityScore: 82,
        volatility: 18.5,
        expectedYield: 7.8,
        totalSupply: 10000,
        activeLoans: 234
      }
    ]
    
    res.json({
      success: true,
      data: {
        collections,
        totalVolume: collections.reduce((sum, col) => sum + col.volume24h, 0),
        averageFloorPrice: collections.reduce((sum, col) => sum + col.floorPrice, 0) / collections.length,
        topPerformer: collections.reduce((max, col) => col.change24h > max.change24h ? col : max)
      }
    })
    
  } catch (error) {
    logger.error('Error fetching collections analytics:', error)
    res.status(500).json({
      error: 'Failed to fetch collections data',
      code: 'FETCH_COLLECTIONS_ERROR'
    })
  }
})

// GET /analytics/loans - Loan analytics and health data
router.get('/loans', async (req, res) => {
  try {
    // Mock loan analytics (in production, aggregate from DB)
    const loanStats = {
      totalLoans: 1456,
      activeLoans: 1289,
      totalBorrowed: 45650.32,
      averageHealthFactor: 1.68,
      averageLTV: 65.2,
      liquidationThreshold: 75.0,
      atRiskLoans: 89, // Health factor < 1.5
      criticalLoans: 23, // Health factor < 1.2
      liquidatedToday: 5,
      riskDistribution: [
        { category: 'Low Risk', count: 856, percentage: 66.4 },
        { category: 'Medium Risk', count: 344, percentage: 26.7 },
        { category: 'High Risk', count: 89, percentage: 6.9 }
      ],
      collateralBreakdown: [
        { collection: 'BAYC', totalValue: 15420.5, loanCount: 245 },
        { collection: 'CryptoPunks', totalValue: 12850.2, loanCount: 189 },
        { collection: 'Azuki', totalValue: 8940.8, loanCount: 334 }
      ]
    }
    
    res.json({
      success: true,
      data: loanStats
    })
    
  } catch (error) {
    logger.error('Error fetching loan analytics:', error)
    res.status(500).json({
      error: 'Failed to fetch loan analytics',
      code: 'FETCH_LOAN_ANALYTICS_ERROR'
    })
  }
})

// GET /analytics/yield - Yield and interest rate data over time
router.get('/yield', async (req, res) => {
  try {
    const { period = '7d' } = req.query
    
    // Mock yield data (in production, fetch from time-series DB)
    const yieldData = [
      { date: '2024-01-01', yield: 5.2, volume: 1250, interestRate: 6.5 },
      { date: '2024-01-02', yield: 5.8, volume: 1420, interestRate: 6.8 },
      { date: '2024-01-03', yield: 4.9, volume: 1180, interestRate: 6.2 },
      { date: '2024-01-04', yield: 6.1, volume: 1650, interestRate: 7.1 },
      { date: '2024-01-05', yield: 5.7, volume: 1380, interestRate: 6.9 },
      { date: '2024-01-06', yield: 6.3, volume: 1720, interestRate: 7.3 },
      { date: '2024-01-07', yield: 5.9, volume: 1590, interestRate: 7.0 }
    ]
    
    const aggregatedStats = {
      averageYield: yieldData.reduce((sum, item) => sum + item.yield, 0) / yieldData.length,
      totalVolume: yieldData.reduce((sum, item) => sum + item.volume, 0),
      yieldVolatility: 2.4, // Standard deviation
      trendDirection: 'stable', // up/down/stable
      peakYield: Math.max(...yieldData.map(item => item.yield)),
      lowestYield: Math.min(...yieldData.map(item => item.yield))
    }
    
    res.json({
      success: true,
      data: {
        period,
        timeSeries: yieldData,
        stats: aggregatedStats
      }
    })
    
  } catch (error) {
    logger.error('Error fetching yield analytics:', error)
    res.status(500).json({
      error: 'Failed to fetch yield data',
      code: 'FETCH_YIELD_ERROR'
    })
  }
})

module.exports = router
