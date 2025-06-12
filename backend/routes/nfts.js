
const express = require('express')
const { coinGeckoService } = require('../services/coingeckoService')
const logger = require('../utils/logger')

const router = express.Router()

// GET /nfts - Get all supported NFT collections
router.get('/', async (req, res) => {
  try {
    const collections = await coinGeckoService.getAllNFTsData()
    
    // Convert to DPSV prices
    const collectionsWithDPSV = collections.map(collection => ({
      ...collection,
      floorPriceDPSV: coinGeckoService.convertUSDtoDPSV(collection.floorPrice),
      marketCapDPSV: coinGeckoService.convertUSDtoDPSV(collection.marketCap),
      volume24hDPSV: coinGeckoService.convertUSDtoDPSV(collection.volume24h)
    }))

    res.json({
      success: true,
      data: collectionsWithDPSV
    })
  } catch (error) {
    logger.error('Error fetching NFT collections:', error)
    res.status(500).json({
      error: 'Failed to fetch NFT collections',
      message: error.message
    })
  }
})

// GET /nfts/:id - Get specific NFT collection
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const collection = await coinGeckoService.getNFTDataForApp(id)

    res.json({
      success: true,
      data: collection
    })
  } catch (error) {
    logger.error('Error fetching NFT collection:', error)
    res.status(500).json({
      error: 'Failed to fetch NFT collection',
      message: error.message
    })
  }
})

// GET /nfts/:id/chart - Get NFT market chart data
router.get('/:id/chart', async (req, res) => {
  try {
    const { id } = req.params
    const { days = 90 } = req.query
    
    const chartData = await coinGeckoService.getNFTMarketChart(id, days)
    
    // Convert to DPSV and format for charts
    const formattedData = {
      floorPrices: chartData.floorPrices.map(([timestamp, price]) => ({
        timestamp,
        date: new Date(timestamp).toISOString().split('T')[0],
        priceUSD: price,
        priceDPSV: coinGeckoService.convertUSDtoDPSV(price)
      })),
      volumes: chartData.volumes.map(([timestamp, volume]) => ({
        timestamp,
        date: new Date(timestamp).toISOString().split('T')[0],
        volumeUSD: volume,
        volumeDPSV: coinGeckoService.convertUSDtoDPSV(volume)
      })),
      marketCaps: chartData.marketCaps.map(([timestamp, cap]) => ({
        timestamp,
        date: new Date(timestamp).toISOString().split('T')[0],
        marketCapUSD: cap,
        marketCapDPSV: coinGeckoService.convertUSDtoDPSV(cap)
      }))
    }

    res.json({
      success: true,
      data: formattedData
    })
  } catch (error) {
    logger.error('Error fetching NFT chart data:', error)
    res.status(500).json({
      error: 'Failed to fetch NFT chart data',
      message: error.message
    })
  }
})

module.exports = router
