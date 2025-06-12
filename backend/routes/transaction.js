
const express = require('express')
const router = express.Router()
const { validateTransactionBody } = require('../middleware/validation')
const { requireAuth } = require('../middleware/auth')
const logger = require('../utils/logger')

// POST /tx/deposit - Create NFT deposit transaction
router.post('/deposit', requireAuth, validateTransactionBody, async (req, res) => {
  try {
    const { nftContract, tokenId } = req.body
    const userAddress = req.user.address
    
    // Vault contract ABI for deposit function
    const depositABI = [
      "function deposit(address nftContract, uint256 tokenId) external"
    ]
    
    const transactionPayload = {
      to: process.env.VAULT_CONTRACT_ADDRESS,
      abi: depositABI,
      functionName: 'deposit',
      args: [nftContract, tokenId],
      from: userAddress,
      gas: '200000', // Estimated gas
      gasPrice: '20000000000' // 20 gwei
    }
    
    logger.info('Created deposit transaction:', { userAddress, nftContract, tokenId })
    
    res.json({
      success: true,
      data: {
        transactionPayload,
        estimatedGas: '200000',
        type: 'deposit'
      }
    })
    
  } catch (error) {
    logger.error('Error creating deposit transaction:', error)
    res.status(500).json({
      error: 'Failed to create deposit transaction',
      code: 'CREATE_DEPOSIT_TX_ERROR'
    })
  }
})

// POST /tx/borrow - Create borrow transaction
router.post('/borrow', requireAuth, validateTransactionBody, async (req, res) => {
  try {
    const { nftContract, tokenId, amount } = req.body
    const userAddress = req.user.address
    
    // LoanManager contract ABI for borrow function
    const borrowABI = [
      "function borrow(address nftContract, uint256 tokenId, uint256 amount) external"
    ]
    
    const amountWei = (parseFloat(amount) * 1e18).toString() // Convert to wei
    
    const transactionPayload = {
      to: process.env.LOAN_MANAGER_ADDRESS,
      abi: borrowABI,
      functionName: 'borrow',
      args: [nftContract, tokenId, amountWei],
      from: userAddress,
      gas: '300000',
      gasPrice: '20000000000'
    }
    
    logger.info('Created borrow transaction:', { userAddress, nftContract, tokenId, amount })
    
    res.json({
      success: true,
      data: {
        transactionPayload,
        estimatedGas: '300000',
        type: 'borrow',
        borrowAmount: amount
      }
    })
    
  } catch (error) {
    logger.error('Error creating borrow transaction:', error)
    res.status(500).json({
      error: 'Failed to create borrow transaction',
      code: 'CREATE_BORROW_TX_ERROR'
    })
  }
})

// POST /tx/repay - Create repay transaction
router.post('/repay', requireAuth, validateTransactionBody, async (req, res) => {
  try {
    const { loanId, amount } = req.body
    const userAddress = req.user.address
    
    const repayABI = [
      "function repay(uint256 loanId, uint256 amount) external payable"
    ]
    
    const amountWei = (parseFloat(amount) * 1e18).toString()
    
    const transactionPayload = {
      to: process.env.LOAN_MANAGER_ADDRESS,
      abi: repayABI,
      functionName: 'repay',
      args: [loanId, amountWei],
      from: userAddress,
      value: amountWei, // Send ETH for repayment
      gas: '250000',
      gasPrice: '20000000000'
    }
    
    logger.info('Created repay transaction:', { userAddress, loanId, amount })
    
    res.json({
      success: true,
      data: {
        transactionPayload,
        estimatedGas: '250000',
        type: 'repay',
        repayAmount: amount
      }
    })
    
  } catch (error) {
    logger.error('Error creating repay transaction:', error)
    res.status(500).json({
      error: 'Failed to create repay transaction',
      code: 'CREATE_REPAY_TX_ERROR'
    })
  }
})

// POST /tx/withdraw - Create NFT withdraw transaction
router.post('/withdraw', requireAuth, validateTransactionBody, async (req, res) => {
  try {
    const { nftContract, tokenId } = req.body
    const userAddress = req.user.address
    
    const withdrawABI = [
      "function withdraw(address nftContract, uint256 tokenId) external"
    ]
    
    const transactionPayload = {
      to: process.env.VAULT_CONTRACT_ADDRESS,
      abi: withdrawABI,
      functionName: 'withdraw',
      args: [nftContract, tokenId],
      from: userAddress,
      gas: '200000',
      gasPrice: '20000000000'
    }
    
    logger.info('Created withdraw transaction:', { userAddress, nftContract, tokenId })
    
    res.json({
      success: true,
      data: {
        transactionPayload,
        estimatedGas: '200000',
        type: 'withdraw'
      }
    })
    
  } catch (error) {
    logger.error('Error creating withdraw transaction:', error)
    res.status(500).json({
      error: 'Failed to create withdraw transaction',
      code: 'CREATE_WITHDRAW_TX_ERROR'
    })
  }
})

// POST /tx/dpo/transfer - Create DPO token transfer transaction
router.post('/dpo/transfer', requireAuth, validateTransactionBody, async (req, res) => {
  try {
    const { to, amount } = req.body
    const userAddress = req.user.address
    
    const transferABI = [
      "function transfer(address to, uint256 amount) external returns (bool)"
    ]
    
    const amountWei = (parseFloat(amount) * 1e18).toString()
    
    const transactionPayload = {
      to: process.env.DPO_TOKEN_ADDRESS,
      abi: transferABI,
      functionName: 'transfer',
      args: [to, amountWei],
      from: userAddress,
      gas: '100000',
      gasPrice: '20000000000'
    }
    
    logger.info('Created DPO transfer transaction:', { userAddress, to, amount })
    
    res.json({
      success: true,
      data: {
        transactionPayload,
        estimatedGas: '100000',
        type: 'dpo_transfer',
        transferAmount: amount
      }
    })
    
  } catch (error) {
    logger.error('Error creating DPO transfer transaction:', error)
    res.status(500).json({
      error: 'Failed to create DPO transfer transaction',
      code: 'CREATE_DPO_TRANSFER_TX_ERROR'
    })
  }
})

module.exports = router
