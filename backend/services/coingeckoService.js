
const axios = require('axios')
const logger = require('../utils/logger')

class CoinGeckoService {
  constructor() {
    this.baseURL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
    this.apiKey = process.env.COINGECKO_API_KEY
    this.nftCollections = {
      'cryptopunks': 'cryptopunks',
      'azuki': 'azuki',
      'bored-ape-yacht-club': 'bored-ape-yacht-club'
    }
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        },
        params
      })
      return response.data
    } catch (error) {
      logger.error('CoinGecko API request failed:', error.message)
      throw error
    }
  }

  // Get NFT collection data
  async getNFTCollection(collectionId) {
    try {
      const data = await this.makeRequest(`/nfts/${collectionId}`)
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image?.small,
        floorPrice: data.floor_price?.usd || 0,
        marketCap: data.market_cap?.usd || 0,
        volume24h: data.volume_24h?.usd || 0,
        totalSupply: data.total_supply || 0,
        contractAddress: data.contract_address,
        blockchain: data.asset_platform_id
      }
    } catch (error) {
      logger.error(`Failed to get NFT collection ${collectionId}:`, error)
      throw error
    }
  }

  // Get NFT market chart data
  async getNFTMarketChart(collectionId, days = 90) {
    try {
      const data = await this.makeRequest(`/nfts/${collectionId}/market_chart`, {
        vs_currency: 'usd',
        days: days
      })
      
      return {
        floorPrices: data.floor_price_usd || [],
        volumes: data.volume_usd || [],
        marketCaps: data.market_cap_usd || []
      }
    } catch (error) {
      logger.error(`Failed to get NFT market chart for ${collectionId}:`, error)
      throw error
    }
  }

  // Get all supported NFT collections data
  async getAllNFTsData() {
    try {
      const collections = await Promise.all(
        Object.keys(this.nftCollections).map(async (key) => {
          const collectionData = await this.getNFTCollection(this.nftCollections[key])
          return {
            ...collectionData,
            key
          }
        })
      )
      return collections
    } catch (error) {
      logger.error('Failed to get all NFTs data:', error)
      throw error
    }
  }

  // Convert USD price to DPSV (mock conversion rate)
  convertUSDtoDPSV(usdPrice) {
    // Mock conversion rate: 1 USD = 100 DPSV
    const conversionRate = 100
    return usdPrice * conversionRate
  }

  // Get NFT data formatted for our app (in DPSV)
  async getNFTDataForApp(collectionId) {
    try {
      const nftData = await this.getNFTCollection(collectionId)
      return {
        ...nftData,
        floorPriceDPSV: this.convertUSDtoDPSV(nftData.floorPrice),
        marketCapDPSV: this.convertUSDtoDPSV(nftData.marketCap),
        volume24hDPSV: this.convertUSDtoDPSV(nftData.volume24h)
      }
    } catch (error) {
      logger.error('Failed to get NFT data for app:', error)
      throw error
    }
  }
}

const coinGeckoService = new CoinGeckoService()

module.exports = {
  coinGeckoService
}
