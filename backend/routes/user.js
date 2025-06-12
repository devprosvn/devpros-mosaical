const express = require('express')
const router = express.Router()
const { validateAddressParam } = require('../middleware/validation')
const { web3Service } = require('../services/web3Service')
const logger = require('../utils/logger')

// GET /user/balance - Get user's DPO/DPSV balance
router.get('/balance', async (req, res) => {
  try {
    const { address } = req.query

    if (!address) {
      return res.status(400).json({
        error: 'Address is required',
        code: 'MISSING_ADDRESS'
      })
    }

    // Mock DPO balance for now - in production, query the smart contract
    const mockBalance = Math.random() * 10000 + 1000

    res.json({
      success: true,
      data: {
        address,
        dpoBalance: mockBalance,
        dpoEarned: Math.random() * 100,
        currency: 'DPSV'
      }
    })

  } catch (error) {
    logger.error('Error getting user balance:', error)
    res.status(500).json({
      error: 'Failed to get user balance',
      code: 'GET_BALANCE_ERROR'
    })
  }
})

// GET /user/:address/nfts - Get user's NFTs and vault status
router.get('/:address/nfts', validateAddressParam, async (req, res) => {
  try {
    const { address } = req.params

    // Get user's deposited NFTs from contract
    const deposits = await web3Service.getUserDeposits(address)

    // Mock data for demonstration (in production, fetch from DB and external APIs)
    const mockNFTs = [
      {
        tokenId: '1234',
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Bored Ape #1234',
        collection: 'Bored Ape Yacht Club',
        image: '/api/placeholder/200/200',
        estimatedValue: 45.5,
        utilityScore: 85,
        deposited: true,
        vaultStatus: 'active',
        canWithdraw: false // Has active loan
      },
      {
        tokenId: '5678',
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Bored Ape #5678',
        collection: 'Bored Ape Yacht Club', 
        image: '/api/placeholder/200/200',
        estimatedValue: 52.3,
        utilityScore: 92,
        deposited: false,
        vaultStatus: 'available',
        canWithdraw: true
      }
    ]

    res.json({
      success: true,
      data: {
        nfts: mockNFTs,
        totalCount: mockNFTs.length,
        depositedCount: mockNFTs.filter(nft => nft.deposited).length,
        totalValue: mockNFTs.reduce((sum, nft) => sum + nft.estimatedValue, 0)
      }
    })

  } catch (error) {
    logger.error('Error fetching user NFTs:', error)
    res.status(500).json({
      error: 'Failed to fetch user NFTs',
      code: 'FETCH_NFTS_ERROR'
    })
  }
})

// GET /user/:address/loans - Get user's loans
router.get('/:address/loans', validateAddressParam, async (req, res) => {
  try {
    const { address } = req.params

    // Get user's loans from contract
    const loans = await web3Service.getUserLoans(address)

    // Add additional computed fields
    const enrichedLoans = loans.map(loan => ({
      ...loan,
      ltv: (parseFloat(loan.amount) / parseFloat(loan.collateralValue)) * 100,
      liquidationPrice: parseFloat(loan.collateralValue) * 0.75, // 75% threshold
      riskLevel: parseFloat(loan.healthFactor) < 1.2 ? 'high' : 
                parseFloat(loan.healthFactor) < 1.5 ? 'medium' : 'low',
      status: parseFloat(loan.healthFactor) > 1.0 ? 'active' : 'liquidated'
    }))

    res.json({
      success: true,
      data: {
        loans: enrichedLoans,
        totalBorrowed: enrichedLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
        averageHealthFactor: enrichedLoans.reduce((sum, loan) => sum + parseFloat(loan.healthFactor), 0) / enrichedLoans.length || 0,
        atRiskCount: enrichedLoans.filter(loan => parseFloat(loan.healthFactor) < 1.5).length
      }
    })

  } catch (error) {
    logger.error('Error fetching user loans:', error)
    res.status(500).json({
      error: 'Failed to fetch user loans',
      code: 'FETCH_LOANS_ERROR'
    })
  }
})

// GET /user/:address/dpo - Get user's DPO token info
router.get('/:address/dpo', validateAddressParam, async (req, res) => {
  try {
    const { address } = req.params

    // Get DPO balance from contract
    const dpoData = await web3Service.getDPOBalance(address)

    // Mock transaction history (in production, fetch from DB)
    const mockTransactions = [
      {
        id: '1',
        type: 'earn',
        amount: 25.5,
        txHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timestamp: '2024-01-15T10:30:00Z',
        description: 'Lending rewards'
      },
      {
        id: '2', 
        type: 'transfer',
        amount: -50,
        txHash: '0x9876543210987654321098765432109876543210987654321098765432109876',
        timestamp: '2024-01-14T15:45:00Z',
        description: 'Transfer to 0x1234...abcd'
      }
    ]

    res.json({
      success: true,
      data: {
        balance: dpoData.balance,
        earned: dpoData.earned,
        estimatedValue: parseFloat(dpoData.balance) * 2.0, // Mock price $2 per DPO
        transactions: mockTransactions,
        apy: 12.5 // Mock APY
      }
    })

  } catch (error) {
    logger.error('Error fetching user DPO data:', error)
    res.status(500).json({
      error: 'Failed to fetch DPO data',
      code: 'FETCH_DPO_ERROR'
    })
  }
})

module.exports = router