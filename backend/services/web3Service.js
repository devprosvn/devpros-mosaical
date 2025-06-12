
const { ethers } = require('ethers')
const logger = require('../utils/logger')

class Web3Service {
  constructor() {
    this.provider = null
    this.contracts = {}
  }

  async initWeb3() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.SAGA_RPC_URL)
      
      // Test connection
      const network = await this.provider.getNetwork()
      logger.info('Connected to Saga chainlet:', {
        chainId: network.chainId.toString(),
        name: network.name
      })

      // Initialize contracts
      await this.initContracts()
      
    } catch (error) {
      logger.error('Web3 initialization failed:', error)
      throw error
    }
  }

  async initContracts() {
    try {
      // Vault Contract ABI (simplified)
      const vaultABI = [
        "function deposit(address nftContract, uint256 tokenId) external",
        "function withdraw(address nftContract, uint256 tokenId) external",
        "function getUserDeposits(address user) external view returns (tuple(address nftContract, uint256 tokenId, uint256 value)[])",
        "event Deposit(address indexed user, address indexed nftContract, uint256 indexed tokenId, uint256 value)",
        "event Withdraw(address indexed user, address indexed nftContract, uint256 indexed tokenId)"
      ]

      // Loan Manager ABI (simplified)
      const loanManagerABI = [
        "function borrow(address nftContract, uint256 tokenId, uint256 amount) external",
        "function repay(uint256 loanId, uint256 amount) external",
        "function getLoan(uint256 loanId) external view returns (tuple(address borrower, uint256 amount, uint256 collateralValue, uint256 interestRate, uint256 healthFactor))",
        "function getUserLoans(address user) external view returns (uint256[])",
        "event Borrow(address indexed user, uint256 indexed loanId, uint256 amount)",
        "event Repay(address indexed user, uint256 indexed loanId, uint256 amount)",
        "event Liquidation(address indexed user, uint256 indexed loanId, uint256 amount)"
      ]

      // DPO Token ABI (simplified)
      const dpoTokenABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function totalSupply() external view returns (uint256)",
        "function earned(address account) external view returns (uint256)",
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ]

      // Initialize contract instances
      this.contracts.vault = new ethers.Contract(
        process.env.VAULT_CONTRACT_ADDRESS,
        vaultABI,
        this.provider
      )

      this.contracts.loanManager = new ethers.Contract(
        process.env.LOAN_MANAGER_ADDRESS,
        loanManagerABI,
        this.provider
      )

      this.contracts.dpoToken = new ethers.Contract(
        process.env.DPO_TOKEN_ADDRESS,
        dpoTokenABI,
        this.provider
      )

      logger.info('Smart contracts initialized')

    } catch (error) {
      logger.error('Contract initialization failed:', error)
      throw error
    }
  }

  // Get user's deposited NFTs
  async getUserDeposits(userAddress) {
    try {
      const deposits = await this.contracts.vault.getUserDeposits(userAddress)
      return deposits.map(deposit => ({
        nftContract: deposit.nftContract,
        tokenId: deposit.tokenId.toString(),
        value: ethers.formatEther(deposit.value)
      }))
    } catch (error) {
      logger.error('Failed to get user deposits:', error)
      throw error
    }
  }

  // Get user's active loans
  async getUserLoans(userAddress) {
    try {
      const loanIds = await this.contracts.loanManager.getUserLoans(userAddress)
      const loans = []

      for (const loanId of loanIds) {
        const loan = await this.contracts.loanManager.getLoan(loanId)
        loans.push({
          id: loanId.toString(),
          borrower: loan.borrower,
          amount: ethers.formatEther(loan.amount),
          collateralValue: ethers.formatEther(loan.collateralValue),
          interestRate: loan.interestRate.toString(),
          healthFactor: ethers.formatUnits(loan.healthFactor, 4)
        })
      }

      return loans
    } catch (error) {
      logger.error('Failed to get user loans:', error)
      throw error
    }
  }

  // Get DPO token balance
  async getDPOBalance(userAddress) {
    try {
      const balance = await this.contracts.dpoToken.balanceOf(userAddress)
      const earned = await this.contracts.dpoToken.earned(userAddress)
      
      return {
        balance: ethers.formatEther(balance),
        earned: ethers.formatEther(earned)
      }
    } catch (error) {
      logger.error('Failed to get DPO balance:', error)
      throw error
    }
  }

  // Get latest block number
  async getLatestBlockNumber() {
    try {
      return await this.provider.getBlockNumber()
    } catch (error) {
      logger.error('Failed to get latest block:', error)
      throw error
    }
  }

  // Get block with transactions
  async getBlock(blockNumber) {
    try {
      return await this.provider.getBlock(blockNumber, true)
    } catch (error) {
      logger.error('Failed to get block:', error)
      throw error
    }
  }

  // Listen to contract events
  setupEventListeners() {
    try {
      // Vault events
      this.contracts.vault.on('Deposit', (user, nftContract, tokenId, value, event) => {
        logger.info('Deposit event:', { user, nftContract, tokenId: tokenId.toString(), value: ethers.formatEther(value) })
        this.handleDepositEvent(user, nftContract, tokenId, value, event)
      })

      this.contracts.vault.on('Withdraw', (user, nftContract, tokenId, event) => {
        logger.info('Withdraw event:', { user, nftContract, tokenId: tokenId.toString() })
        this.handleWithdrawEvent(user, nftContract, tokenId, event)
      })

      // Loan Manager events
      this.contracts.loanManager.on('Borrow', (user, loanId, amount, event) => {
        logger.info('Borrow event:', { user, loanId: loanId.toString(), amount: ethers.formatEther(amount) })
        this.handleBorrowEvent(user, loanId, amount, event)
      })

      this.contracts.loanManager.on('Repay', (user, loanId, amount, event) => {
        logger.info('Repay event:', { user, loanId: loanId.toString(), amount: ethers.formatEther(amount) })
        this.handleRepayEvent(user, loanId, amount, event)
      })

      this.contracts.loanManager.on('Liquidation', (user, loanId, amount, event) => {
        logger.info('Liquidation event:', { user, loanId: loanId.toString(), amount: ethers.formatEther(amount) })
        this.handleLiquidationEvent(user, loanId, amount, event)
      })

      logger.info('Event listeners set up')

    } catch (error) {
      logger.error('Failed to setup event listeners:', error)
    }
  }

  // Event handlers
  async handleDepositEvent(user, nftContract, tokenId, value, event) {
    // Update database and notify frontend
    if (global.io) {
      global.io.to(`user:${user}`).emit('nft_deposited', {
        nftContract,
        tokenId: tokenId.toString(),
        value: ethers.formatEther(value),
        txHash: event.transactionHash
      })
    }
  }

  async handleWithdrawEvent(user, nftContract, tokenId, event) {
    if (global.io) {
      global.io.to(`user:${user}`).emit('nft_withdrawn', {
        nftContract,
        tokenId: tokenId.toString(),
        txHash: event.transactionHash
      })
    }
  }

  async handleBorrowEvent(user, loanId, amount, event) {
    if (global.io) {
      global.io.to(`user:${user}`).emit('loan_created', {
        loanId: loanId.toString(),
        amount: ethers.formatEther(amount),
        txHash: event.transactionHash
      })
    }
  }

  async handleRepayEvent(user, loanId, amount, event) {
    if (global.io) {
      global.io.to(`user:${user}`).emit('loan_repaid', {
        loanId: loanId.toString(),
        amount: ethers.formatEther(amount),
        txHash: event.transactionHash
      })
    }
  }

  async handleLiquidationEvent(user, loanId, amount, event) {
    if (global.io) {
      global.io.to(`user:${user}`).emit('loan_liquidated', {
        loanId: loanId.toString(),
        amount: ethers.formatEther(amount),
        txHash: event.transactionHash
      })
    }
  }
}

const web3Service = new Web3Service()

module.exports = {
  initWeb3: () => web3Service.initWeb3(),
  web3Service
}
