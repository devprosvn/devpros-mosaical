
const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mosaical',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const connectDB = async () => {
  try {
    const client = await pool.connect()
    logger.info('PostgreSQL connected successfully')

    // Run initial migrations
    await runMigrations(client)
    client.release()

  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

const runMigrations = async (client) => {
  try {
    logger.info('Running database migrations...')
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        nonce VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create NFTs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nfts (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) NOT NULL,
        token_id VARCHAR(78) NOT NULL,
        owner_address VARCHAR(42) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        image_url TEXT,
        metadata JSONB,
        estimated_value DECIMAL(18,8),
        utility_score INTEGER DEFAULT 0,
        deposited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(contract_address, token_id)
      )
    `)

    // Create loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        nft_contract VARCHAR(42) NOT NULL,
        token_id VARCHAR(78) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        duration_days INTEGER NOT NULL,
        collateral_value DECIMAL(18,8) NOT NULL,
        health_factor DECIMAL(10,6) DEFAULT 1.0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create DPO balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dpo_balances (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) PRIMARY KEY,
        balance DECIMAL(18,8) DEFAULT 0,
        earned DECIMAL(18,8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create DPO transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dpo_transactions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        tx_hash VARCHAR(66),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) NOT NULL,
        event_name VARCHAR(100) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        block_number BIGINT NOT NULL,
        log_index INTEGER NOT NULL,
        event_data JSONB,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(transaction_hash, log_index)
      )
    `)

    // Create analytics snapshots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_snapshots (
        id SERIAL PRIMARY KEY,
        total_loans INTEGER DEFAULT 0,
        total_borrowed DECIMAL(18,8) DEFAULT 0,
        average_health_factor DECIMAL(10,6) DEFAULT 0,
        total_dpo_supply DECIMAL(18,8) DEFAULT 0,
        active_users INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
      CREATE INDEX IF NOT EXISTS idx_nfts_deposited ON nfts(deposited);
      CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_address);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
      CREATE INDEX IF NOT EXISTS idx_dpo_user ON dpo_balances(user_address);
      CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
      CREATE INDEX IF NOT EXISTS idx_events_block ON events(block_number);
    `)

    logger.info('Database migrations completed')

  } catch (error) {
    logger.error('Migration failed:', error)
    throw error
  }
}

module.exports = { pool, connectDB }
