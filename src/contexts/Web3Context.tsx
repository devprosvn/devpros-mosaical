
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import { MetaMaskSDK } from '@metamask/sdk'

// Saga chainlet configuration
const SAGA_CHAINLET_CONFIG = {
  chainId: '0x29bcb168c28b9c0001', // devpros_2749656616387000-1 in hex
  chainName: 'Saga Protocol Devpros',
  nativeCurrency: {
    name: 'DPSV',
    symbol: 'DPSV',
    decimals: 18,
  },
  rpcUrls: ['https://devpros-2749656616387000-1.jsonrpc.sagarpc.io'],
  blockExplorerUrls: ['https://devpros-2749656616387000-1.sagaexplorer.io'],
}

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isCorrectNetwork: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToSagaNetwork: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

// Initialize MetaMask SDK
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Mosaical NFT Lending Platform",
    url: window.location.href,
  },
  headless: false,
})

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkConnection()
    
    const mmProvider = MMSDK.getProvider()
    if (mmProvider) {
      mmProvider.on('accountsChanged', handleAccountsChanged)
      mmProvider.on('chainChanged', handleChainChanged)
      
      return () => {
        mmProvider.removeListener('accountsChanged', handleAccountsChanged)
        mmProvider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      const mmProvider = MMSDK.getProvider()
      if (mmProvider) {
        const accounts = await mmProvider.request({ 
          method: 'eth_accounts',
          params: [] 
        })
        
        if (accounts && accounts.length > 0) {
          const provider = new ethers.BrowserProvider(mmProvider)
          setProvider(provider)
          setAccount(accounts[0])
          setSigner(await provider.getSigner())
          setIsConnected(true)
          await checkNetwork(provider)
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const isCorrect = network.chainId === BigInt(SAGA_CHAINLET_CONFIG.chainId)
      setIsCorrectNetwork(isCorrect)
      return isCorrect
    } catch (error) {
      console.error('Error checking network:', error)
      setIsCorrectNetwork(false)
      return false
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const connectWallet = async () => {
    try {
      // Connect using MetaMask SDK
      const accounts = await MMSDK.connect()
      console.log('Connected accounts:', accounts)

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get provider from SDK
      const mmProvider = MMSDK.getProvider()
      if (!mmProvider) {
        throw new Error('Provider not available')
      }

      const provider = new ethers.BrowserProvider(mmProvider)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setProvider(provider)
      setSigner(signer)
      setAccount(address)
      setIsConnected(true)
      
      const isCorrectNet = await checkNetwork(provider)
      if (!isCorrectNet) {
        await switchToSagaNetwork()
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    setIsCorrectNetwork(false)
  }

  const switchToSagaNetwork = async () => {
    const mmProvider = MMSDK.getProvider()
    if (!mmProvider) return

    try {
      await mmProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SAGA_CHAINLET_CONFIG.chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await mmProvider.request({
            method: 'wallet_addEthereumChain',
            params: [SAGA_CHAINLET_CONFIG],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          throw addError
        }
      } else {
        console.error('Error switching network:', switchError)
        throw switchError
      }
    }
  }

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToSagaNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
