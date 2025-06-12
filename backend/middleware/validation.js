
const { ethers } = require('ethers')
const logger = require('../utils/logger')

const validateAddress = (address) => {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

const validateAmount = (amount) => {
  try {
    const parsed = parseFloat(amount)
    return !isNaN(parsed) && parsed > 0
  } catch {
    return false
  }
}

const validateAddressParam = (req, res, next) => {
  const { address } = req.params
  
  if (!address || !validateAddress(address)) {
    return res.status(400).json({
      error: 'Invalid address format',
      code: 'INVALID_ADDRESS'
    })
  }
  
  req.params.address = address.toLowerCase()
  next()
}

const validateTransactionBody = (req, res, next) => {
  const { amount, nftContract, tokenId } = req.body
  
  if (amount && !validateAmount(amount)) {
    return res.status(400).json({
      error: 'Invalid amount',
      code: 'INVALID_AMOUNT'
    })
  }
  
  if (nftContract && !validateAddress(nftContract)) {
    return res.status(400).json({
      error: 'Invalid NFT contract address',
      code: 'INVALID_NFT_CONTRACT'
    })
  }
  
  if (tokenId && (isNaN(tokenId) || parseInt(tokenId) < 0)) {
    return res.status(400).json({
      error: 'Invalid token ID',
      code: 'INVALID_TOKEN_ID'
    })
  }
  
  next()
}

module.exports = {
  validateAddress,
  validateAmount,
  validateAddressParam,
  validateTransactionBody
}
