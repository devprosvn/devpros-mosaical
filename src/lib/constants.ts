
// Devpros Chainlet Configuration
export const CHAINLET_CONFIG = {
  chainId: '0x29bcb168c28b9c0001', // devpros_2749656616387000-1 in hex
  chainIdDecimal: 2998266161697554433,
  chainName: 'Devpros Chainlet',
  nativeCurrency: {
    name: 'DPSV',
    symbol: 'DPSV',
    decimals: 18,
  },
  rpcUrls: ['https://devpros-2749656616387000-1.jsonrpc.sagarpc.io'],
  wsUrls: ['https://devpros-2749656616387000-1.ws.sagarpc.io'],
  blockExplorerUrls: ['https://devpros-2749656616387000-1.sagaexplorer.io'],
  chainletId: 'devpros_2749656616387000-1',
}

// Contract addresses on devpros chainlet
export const CONTRACT_ADDRESSES = {
  // Core contracts
  VAULT_CONTRACT: '0xB834ED9acF0C047251d37e7190edfc5631e9D7E8',
  LOAN_MANAGER: '0x29679B0bED366e26468808dbBEfC7cBA65198DBd',
  DPO_TOKEN: '0x59E25E5284AbCc195293D135b049a0daE96be7CA',
  PRICE_ORACLE: '0xe7B8457F907bD96EEC025E587B3c3aaeeDd91078',
  LIQUIDATION_MANAGER: '0x164a8437d9Bf146F76e87d4fabb5c6EaC10d2f8D',
  INTEREST_RATE_MODEL: '0xede2E7d72E3Ba0BF6F22613E35C29f727379E381',
  GOVERNANCE: '0xaA8e83D125bff13078eeB220eBee0B2410ef3Bf7',
} as const

// Gas Return Account
export const GAS_RETURN_ACCOUNT = '0xcca6F4EA7e82941535485C2363575404C3061CD2'

// Genesis Account with initial DPSV balance
export const GENESIS_ACCOUNT = {
  address: '0xcca6F4EA7e82941535485C2363575404C3061CD2',
  balance: '1000000000', // 1B DPSV
}

// Network utilities
export const getExplorerUrl = (txHash: string) => 
  `${CHAINLET_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`

export const getAddressUrl = (address: string) => 
  `${CHAINLET_CONFIG.blockExplorerUrls[0]}/address/${address}`
// DPSV Token Information
export const DPSV_TOKEN = {
  name: 'DevPros Value',
  symbol: 'DPSV',
  decimals: 18,
  address: CONTRACT_ADDRESSES.DPO_TOKEN,
} as const

// Conversion rates (mock - in production would be from price oracle)
export const USD_TO_DPSV_RATE = 100 // 1 USD = 100 DPSV

// Supported NFT Collections
export const SUPPORTED_NFTS = {
  CRYPTOPUNKS: {
    id: 'cryptopunks',
    name: 'CryptoPunks',
    contractAddress: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'
  },
  AZUKI: {
    id: 'azuki',
    name: 'Azuki',
    contractAddress: '0xED5AF388653567Af2F388E6224dC7C4b3241C544'
  },
  BAYC: {
    id: 'bored-ape-yacht-club',
    name: 'Bored Ape Yacht Club',
    contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
  }
} as const
