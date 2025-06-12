
import React from 'react'
import { Button } from './ui/button'
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
      <Button variant="neon" onClick={handleConnect} className="gap-2">
        <Wallet className="w-4 h-4" />
        {t('connectWallet')}
      </Button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="destructive" onClick={handleNetworkSwitch} className="gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4" />
          {t('switchNetwork')}
        </Button>
        <Button variant="ghost" onClick={disconnectWallet}>
          {t('disconnect')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
        <span className="text-green-400 text-sm font-mono">{formatAddress(account!)}</span>
      </div>
      <Button variant="ghost" onClick={disconnectWallet}>
        {t('disconnect')}
      </Button>
    </div>
  )
}

export default ConnectWallet
