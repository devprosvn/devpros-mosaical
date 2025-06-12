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
        loan_id VARCHAR(255) UNIQUE NOT NULL,
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
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) UNIQUE NOT NULL,
        balance DECIMAL(18,8) DEFAULT 0,
        earned DECIMAL(18,8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS dpo_transactions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        transaction_hash VARCHAR(66) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        from_address VARCHAR(42),
        to_address VARCHAR(42),
        block_number BIGINT,
        timestamp TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(50) NOT NULL,
        contract_address VARCHAR(42) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        block_number BIGINT NOT NULL,
        log_index INTEGER NOT NULL,
        topics TEXT[],
        data TEXT,
        processed BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(transaction_hash, log_index)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_snapshots (
        id SERIAL PRIMARY KEY,
        snapshot_date DATE UNIQUE NOT NULL,
        total_volume DECIMAL(18,8),
        total_loans INTEGER,
        average_health_factor DECIMAL(10,4),
        average_ltv DECIMAL(5,2),
        collections_data JSONB,
        yield_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
      CREATE INDEX IF NOT EXISTS idx_nfts_deposited ON nfts(deposited);
      CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_address);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
      CREATE INDEX IF NOT EXISTS idx_dpo_transactions_user ON dpo_transactions(user_address);
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