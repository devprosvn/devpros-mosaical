
const cron = require('node-cron')
const { web3Service } = require('./web3Service')
const logger = require('../utils/logger')

class IndexerService {
  constructor() {
    this.isRunning = false
    this.lastProcessedBlock = 0
    this.retryAttempts = 3
    this.retryDelay = 5000 // 5 seconds
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Indexer service is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting indexer service...')

    try {
      // Get current block number to start from
      this.lastProcessedBlock = await web3Service.getLatestBlockNumber()
      logger.info('Starting from block:', this.lastProcessedBlock)

      // Set up event listeners
      web3Service.setupEventListeners()

      // Schedule periodic block scanning every 30 seconds
      cron.schedule('*/30 * * * * *', async () => {
        await this.scanBlocks()
      })

      logger.info('Indexer service started successfully')

    } catch (error) {
      logger.error('Failed to start indexer service:', error)
      this.isRunning = false
      throw error
    }
  }

  async scanBlocks() {
    if (!this.isRunning) return

    try {
      const currentBlock = await web3Service.getLatestBlockNumber()
      
      if (currentBlock <= this.lastProcessedBlock) {
        return // No new blocks
      }

      logger.info(`Scanning blocks ${this.lastProcessedBlock + 1} to ${currentBlock}`)

      // Process blocks in batches to avoid overwhelming the system
      const batchSize = 10
      for (let i = this.lastProcessedBlock + 1; i <= currentBlock; i += batchSize) {
        const endBlock = Math.min(i + batchSize - 1, currentBlock)
        await this.processBlockRange(i, endBlock)
      }

      this.lastProcessedBlock = currentBlock
      logger.info(`Processed blocks up to ${currentBlock}`)

    } catch (error) {
      logger.error('Error scanning blocks:', error)
      await this.retryWithDelay()
    }
  }

  async processBlockRange(startBlock, endBlock) {
    try {
      for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
        await this.processBlock(blockNumber)
      }
    } catch (error) {
      logger.error(`Error processing block range ${startBlock}-${endBlock}:`, error)
      throw error
    }
  }

  async processBlock(blockNumber) {
    try {
      const block = await web3Service.getBlock(blockNumber)
      
      if (!block || !block.transactions) {
        return
      }

      // Process each transaction in the block
      for (const tx of block.transactions) {
        await this.processTransaction(tx, blockNumber)
      }

    } catch (error) {
      logger.error(`Error processing block ${blockNumber}:`, error)
      throw error
    }
  }

  async processTransaction(tx, blockNumber) {
    try {
      // Check if transaction is related to our contracts
      const contractAddresses = [
        process.env.VAULT_CONTRACT_ADDRESS?.toLowerCase(),
        process.env.LOAN_MANAGER_ADDRESS?.toLowerCase(),
        process.env.DPO_TOKEN_ADDRESS?.toLowerCase()
      ].filter(Boolean)

      if (!contractAddresses.includes(tx.to?.toLowerCase())) {
        return // Not related to our contracts
      }

      // Get transaction receipt for event logs
      const receipt = await web3Service.provider.getTransactionReceipt(tx.hash)
      
      if (receipt && receipt.logs) {
        await this.processTransactionLogs(receipt.logs, tx, blockNumber)
      }

    } catch (error) {
      logger.error(`Error processing transaction ${tx.hash}:`, error)
      // Don't throw error here to avoid stopping the entire indexing process
    }
  }

  async processTransactionLogs(logs, tx, blockNumber) {
    for (const log of logs) {
      try {
        await this.processEventLog(log, tx, blockNumber)
      } catch (error) {
        logger.error('Error processing event log:', error)
      }
    }
  }

  async processEventLog(log, tx, blockNumber) {
    try {
      // Parse event based on contract address and topic
      const contractAddress = log.address.toLowerCase()
      const eventSignature = log.topics[0]

      // Event signatures (keccak256 of event signature)
      const eventSignatures = {
        // Vault events
        '0x1234...': 'NFTDeposited', // This would be the actual keccak256 hash
        '0x5678...': 'NFTWithdrawn',
        
        // Loan Manager events  
        '0x9abc...': 'LoanCreated',
        '0xdef0...': 'LoanRepaid',
        '0x1357...': 'LoanLiquidated',
        
        // DPO Token events
        '0x2468...': 'DPOTokensMinted',
        '0x3579...': 'DPOTokensTraded'
      }

      const eventName = eventSignatures[eventSignature]
      if (!eventName) {
        return // Unknown event
      }

      // Store event in database
      await this.storeEvent({
        eventName,
        contractAddress,
        transactionHash: tx.hash,
        blockNumber,
        logIndex: log.logIndex,
        topics: log.topics,
        data: log.data,
        timestamp: new Date()
      })

      // Send real-time notification if user-related
      await this.sendRealtimeNotification(eventName, log, tx)

    } catch (error) {
      logger.error('Error processing event log:', error)
    }
  }

  async storeEvent(eventData) {
    try {
      // In production, store in PostgreSQL
      // For now, just log the event
      logger.info('Storing event:', eventData)
      
      // TODO: Implement database storage
      // await db.query('INSERT INTO events (...) VALUES (...)', eventData)
      
    } catch (error) {
      logger.error('Error storing event:', error)
    }
  }

  async sendRealtimeNotification(eventName, log, tx) {
    try {
      if (!global.io) return

      // Extract user address from event (this depends on the specific event structure)
      let userAddress = null
      
      // For most events, the user address is in the first indexed parameter
      if (log.topics.length > 1) {
        // Remove the '0x' and pad to 40 characters, then add '0x' back
        const addressTopic = log.topics[1]
        userAddress = '0x' + addressTopic.slice(-40)
      }

      if (userAddress) {
        const notification = {
          type: eventName,
          transactionHash: tx.hash,
          userAddress,
          timestamp: new Date().toISOString(),
          blockNumber: log.blockNumber
        }

        global.io.to(`user:${userAddress.toLowerCase()}`).emit('blockchain_event', notification)
        logger.info('Sent real-time notification:', notification)
      }

    } catch (error) {
      logger.error('Error sending real-time notification:', error)
    }
  }

  async retryWithDelay() {
    for (let i = 0; i < this.retryAttempts; i++) {
      try {
        logger.info(`Retrying indexer operation, attempt ${i + 1}/${this.retryAttempts}`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        
        // Try to reconnect to provider
        await web3Service.initWeb3()
        return // Success
        
      } catch (error) {
        logger.error(`Retry attempt ${i + 1} failed:`, error)
        
        if (i === this.retryAttempts - 1) {
          logger.error('All retry attempts exhausted, stopping indexer')
          this.isRunning = false
          throw error
        }
      }
    }
  }

  stop() {
    this.isRunning = false
    logger.info('Indexer service stopped')
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastProcessedBlock: this.lastProcessedBlock
    }
  }
}

const indexerService = new IndexerService()
module.exports = indexerService
