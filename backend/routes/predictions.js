
const express = require('express')
const { spawn } = require('child_process')
const path = require('path')
const logger = require('../utils/logger')

const router = express.Router()

// POST /predictions/train - Train AI model for specific NFT collection
router.post('/train', async (req, res) => {
  try {
    const { collection_id, days = 90 } = req.body
    
    if (!collection_id) {
      return res.status(400).json({
        error: 'collection_id is required'
      })
    }

    logger.info(`Starting AI training for collection: ${collection_id}`)

    // For demo purposes, simulate training with mock data instead of heavy ML
    // This makes it fast and responsive for UI testing
    const mockTrainingResults = {
      collection_id,
      performance: {
        ensemble: {
          mae: Math.random() * 10 + 5,
          rmse: Math.random() * 15 + 10,
          r2: Math.random() * 0.3 + 0.7
        },
        random_forest: {
          mae: Math.random() * 12 + 6,
          rmse: Math.random() * 18 + 12,
          r2: Math.random() * 0.25 + 0.65
        },
        gradient_boosting: {
          mae: Math.random() * 11 + 5.5,
          rmse: Math.random() * 16 + 11,
          r2: Math.random() * 0.28 + 0.68
        },
        xgboost: {
          mae: Math.random() * 10.5 + 5.2,
          rmse: Math.random() * 15.5 + 10.5,
          r2: Math.random() * 0.32 + 0.72
        }
      },
      future_predictions: Array.from({ length: 7 }, (_, i) => {
        const basePrice = 50 + Math.random() * 100
        return basePrice + (Math.random() - 0.5) * 20
      }),
      feature_names: [
        'floor_price_pct_change', 'floor_price_ma_7', 'floor_price_ma_30',
        'floor_price_volatility', 'volume_pct_change', 'volume_ma_7'
      ],
      training_time: new Date().toISOString(),
      status: 'completed'
    }

    // Simulate some processing time (but keep it short)
    await new Promise(resolve => setTimeout(resolve, 2000))

    logger.info(`AI training completed for collection: ${collection_id}`)
    
    res.json({
      success: true,
      data: mockTrainingResults
    })

  } catch (error) {
    logger.error('Error training AI model:', error)
    res.status(500).json({
      error: 'Failed to train AI model',
      message: error.message
    })
  }
})

// GET /predictions/:collection_id - Get price predictions for collection
router.get('/:collection_id', async (req, res) => {
  try {
    const { collection_id } = req.params
    const { days_ahead = 7 } = req.query

    logger.info(`Fetching predictions for collection: ${collection_id}`)

    // Generate more realistic mock prediction data
    const basePrice = collection_id === 'cryptopunks' ? 75 : 
                     collection_id === 'azuki' ? 12 : 
                     collection_id === 'bored-ape-yacht-club' ? 45 : 30

    const mockPredictions = Array.from({ length: parseInt(days_ahead) }, (_, i) => {
      const trend = Math.sin(i * 0.5) * 0.1 // Add some realistic trend
      const noise = (Math.random() - 0.5) * 0.15 // Add some randomness
      const priceMultiplier = 1 + trend + noise
      
      const predictedPriceUSD = basePrice * priceMultiplier
      const predictedPriceDPSV = predictedPriceUSD * (100 + Math.random() * 50) // DPSV conversion
      
      return {
        day: i + 1,
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted_price_usd: Math.round(predictedPriceUSD * 100) / 100,
        predicted_price_dpsv: Math.round(predictedPriceDPSV),
        confidence: Math.random() * 0.25 + 0.75 // 75-100% confidence
      }
    })

    res.json({
      success: true,
      data: {
        collection_id,
        predictions: mockPredictions,
        generated_at: new Date().toISOString(),
        model_version: '1.0.0',
        training_status: 'completed'
      }
    })

  } catch (error) {
    logger.error('Error getting predictions:', error)
    res.status(500).json({
      error: 'Failed to get predictions',
      message: error.message
    })
  }
})

module.exports = router
