
import React from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useLanguage } from '../contexts/LanguageContext'
import { formatAddress } from '../lib/utils'
import { Wallet, AlertTriangle } from 'lucide-react'

const ConnectWallet: React.FC = () => {
  const { account, isConnected, isCorrectNetwork, connectWallet, disconnectWallet, switchToSagaNetwork } = useWeb3()
  const { t } = useLanguage()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Show user-friendly error message
      alert('Failed to connect MetaMask. Please make sure MetaMask is installed and try again.')
    }
  }

  const handleNetworkSwitch = async () => {
    try {
      await switchToSagaNetwork()
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  if (!isConnected) {
    return (
      <button className="cyber-button d-flex align-items-center" onClick={handleConnect}>
        <Wallet className="me-2" size={16} />
        {t('connectWallet')}
      </button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-danger d-flex align-items-center animate-glow" onClick={handleNetworkSwitch}>
          <AlertTriangle className="me-2" size={16} />
          {t('switchNetwork')}
        </button>
        <button className="btn btn-outline-secondary" onClick={disconnectWallet}>
          {t('disconnect')}
        </button>
      </div>
    )
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="px-3 py-2 bg-success bg-opacity-25 rounded-3 border border-success border-opacity-50">
        <span className="text-success font-monospace small">{formatAddress(account!)}</span>
      </div>
      <button className="btn btn-outline-secondary" onClick={disconnectWallet}>
        {t('disconnect')}
      </button>
    </div>
  )
}

export default ConnectWallet
