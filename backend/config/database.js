
const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        address VARCHAR(42) PRIMARY KEY,
        nonce VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS nfts (
        id SERIAL PRIMARY KEY,
        token_id VARCHAR(255) NOT NULL,
        contract_address VARCHAR(42) NOT NULL,
        owner_address VARCHAR(42) NOT NULL,
        collection_name VARCHAR(255),
        token_name VARCHAR(255),
        token_uri TEXT,
        metadata JSONB,
        deposited BOOLEAN DEFAULT FALSE,
        deposited_at TIMESTAMP,
        value_eth DECIMAL(18,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(contract_address, token_id)
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        nft_id INTEGER REFERENCES nfts(id),
        borrowed_amount DECIMAL(18,8) NOT NULL,
        collateral_value DECIMAL(18,8) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        health_factor DECIMAL(10,4),
        ltv DECIMAL(5,2),
        liquidation_price DECIMAL(18,8),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS dpo_balances (
        user_address VARCHAR(42) PRIMARY KEY,
        balance DECIMAL(18,8) DEFAULT 0,
        total_earned DECIMAL(18,8) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(66) UNIQUE NOT NULL,
        from_address VARCHAR(42),
        to_address VARCHAR(42),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18,8),
        token_address VARCHAR(42),
        block_number BIGINT,
        timestamp TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(18,8),
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_address)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analytics_metric ON analytics(metric_name, recorded_at)`)
    
    logger.info('Database migrations completed')
    
  } catch (error) {
    logger.error('Migration failed:', error)
    throw error
  }
}

module.exports = { pool, connectDB }
