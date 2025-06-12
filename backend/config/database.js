const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const connectDB = async () => {
  try {
    const client = await pool.connect()
    logger.info('Connected to PostgreSQL database')

    // Run migrations
    await runMigrations(client)

    client.release()
    return pool
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
        nonce VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18,8),
        token_address VARCHAR(42),
        nft_contract VARCHAR(42),
        nft_token_id VARCHAR(255),
        tx_hash VARCHAR(66) UNIQUE,
        block_number INTEGER,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_address) REFERENCES users(address)
      );
    `)

    // Create loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        borrower_address VARCHAR(42) NOT NULL,
        lender_address VARCHAR(42),
        nft_contract VARCHAR(42) NOT NULL,
        nft_token_id VARCHAR(255) NOT NULL,
        loan_amount DECIMAL(18,8) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        duration INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (borrower_address) REFERENCES users(address)
      );
    `)

    // Create analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(18,8),
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    logger.info('Database migrations completed successfully!')
  } catch (error) {
    logger.error('Migration error:', error)
    throw error
  }
}

module.exports = { pool, connectDB, runMigrations }