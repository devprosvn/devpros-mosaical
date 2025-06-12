
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    console.log('Running database migrations...')
    
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
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
      CREATE INDEX IF NOT EXISTS idx_nfts_deposited ON nfts(deposited);
      CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_address);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
      CREATE INDEX IF NOT EXISTS idx_dpo_transactions_user ON dpo_transactions(user_address);
      CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
      CREATE INDEX IF NOT EXISTS idx_events_block ON events(block_number);
    `)
    
    console.log('Database migrations completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { runMigrations }
