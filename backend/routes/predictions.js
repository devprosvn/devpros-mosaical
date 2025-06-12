
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

    // Run Python AI pipeline
    const pythonScript = path.join(__dirname, '../../ai/nft_price_predictor.py')
    const pythonProcess = spawn('python3', [
      '-c', 
      `
import sys
sys.path.append('${path.join(__dirname, '../../ai')}')
from nft_price_predictor import NFTPricePredictor
import json

predictor = NFTPricePredictor()
results = predictor.run_pipeline('${collection_id}', days=${days}, save_data=True, visualize=False)

# Convert results to JSON serializable format
output = {
    'collection_id': '${collection_id}',
    'performance': results['results'],
    'future_predictions': results['future_predictions'],
    'feature_names': results['feature_names']
}

print(json.dumps(output))
      `
    ])

    let output = ''
    let error = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const results = JSON.parse(output)
          res.json({
            success: true,
            data: results
          })
        } catch (parseError) {
          res.status(500).json({
            error: 'Failed to parse AI results',
            message: parseError.message
          })
        }
      } else {
        logger.error('Python script error:', error)
        res.status(500).json({
          error: 'AI training failed',
          message: error
        })
      }
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

    // Mock prediction data for demo (in production, load from trained model)
    const mockPredictions = Array.from({ length: parseInt(days_ahead) }, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_price_usd: Math.random() * 100 + 50,
      predicted_price_dpsv: (Math.random() * 100 + 50) * 100,
      confidence: Math.random() * 0.3 + 0.7
    }))

    res.json({
      success: true,
      data: {
        collection_id,
        predictions: mockPredictions,
        generated_at: new Date().toISOString()
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
