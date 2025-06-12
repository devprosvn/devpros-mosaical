
const { SiweMessage } = require('siwe')
const logger = require('../utils/logger')

// Store nonces in memory (in production, use Redis)
const nonces = new Map()

const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const getNonce = (req, res) => {
  const nonce = generateNonce()
  const address = req.query.address
  
  if (address) {
    nonces.set(address.toLowerCase(), nonce)
  }
  
  res.json({ nonce })
}

const verifySignature = async (req, res, next) => {
  try {
    const { message, signature } = req.body
    
    if (!message || !signature) {
      return res.status(400).json({ 
        error: 'Missing message or signature',
        code: 'MISSING_AUTH_DATA'
      })
    }

    const siweMessage = new SiweMessage(message)
    const { address, nonce } = siweMessage
    
    // Verify nonce
    const storedNonce = nonces.get(address.toLowerCase())
    if (!storedNonce || storedNonce !== nonce) {
      return res.status(401).json({ 
        error: 'Invalid nonce',
        code: 'INVALID_NONCE'
      })
    }

    // Verify signature
    const fields = await siweMessage.verify({ signature })
    
    if (fields.success) {
      // Remove used nonce
      nonces.delete(address.toLowerCase())
      
      // Store user session (simplified - use JWT in production)
      req.user = { address: address.toLowerCase() }
      
      logger.info('User authenticated:', { address })
      next()
    } else {
      res.status(401).json({ 
        error: 'Invalid signature',
        code: 'INVALID_SIGNATURE'
      })
    }
    
  } catch (error) {
    logger.error('Authentication error:', error)
    res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    })
  }
}

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    })
  }
  next()
}

module.exports = {
  getNonce,
  verifySignature,
  requireAuth
}
