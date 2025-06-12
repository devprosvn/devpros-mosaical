const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { createServer } = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const logger = require('./utils/logger')
const { connectDB } = require('./config/database')
const { initWeb3 } = require('./services/web3Service')
const indexerService = require('./services/indexerService')

// Routes
const userRoutes = require('./routes/user')
const transactionRoutes = require('./routes/transaction')
const analyticsRoutes = require('./routes/analytics')
const authRoutes = require('./routes/auth')
const nftRoutes = require('./routes/nfts')
const predictionRoutes = require('./routes/predictions')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://replit.dev",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://replit.dev"
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  })
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/tx', transactionRoutes)
app.use('/api/nfts', nftRoutes)
app.use('/api/predictions', predictionRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id)

  socket.on('subscribe', (address) => {
    socket.join(`user:${address}`)
    logger.info(`User ${address} subscribed to notifications`)
  })

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id)
  })
})

// Make io available globally for other modules
global.io = io

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Initialize database
    await connectDB()
    logger.info('Database connected')

    // Initialize Web3
    await initWeb3()
    logger.info('Web3 initialized')

    // Start indexer service
    indexerService.start()
    logger.info('Indexer service started')

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`)
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

startServer()