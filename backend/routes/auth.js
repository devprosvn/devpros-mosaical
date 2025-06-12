
const express = require('express')
const router = express.Router()
const { getNonce, verifySignature } = require('../middleware/auth')
const logger = require('../utils/logger')

// GET /auth/nonce - Get nonce for SIWE
router.get('/nonce', getNonce)

// POST /auth/verify - Verify SIWE signature
router.post('/verify', verifySignature, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        address: req.user.address,
        message: 'Authentication successful'
      }
    })
    
  } catch (error) {
    logger.error('Auth verification error:', error)
    res.status(500).json({
      error: 'Authentication verification failed',
      code: 'AUTH_VERIFY_ERROR'
    })
  }
})

// POST /auth/logout - Logout user
router.post('/logout', (req, res) => {
  // In production, invalidate JWT token or session
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

module.exports = router
