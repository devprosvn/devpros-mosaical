
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { formatNumber } from '../lib/utils'
import {
  Coins,
  Send,
  History,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'

// Mock DPO data
const mockDpoData = {
  balance: 1250.75,
  value: 2501.50, // in USD
  earned: 156.23,
  apy: 12.5,
}

const mockTransactions = [
  {
    id: '1',
    type: 'earn',
    amount: 25.5,
    hash: '0x1234...5678',
    timestamp: '2024-01-15T10:30:00Z',
    description: 'Lending rewards',
  },
  {
    id: '2',
    type: 'transfer',
    amount: -50,
    hash: '0x9876...4321',
    timestamp: '2024-01-14T15:45:00Z',
    description: 'Transfer to 0x1234...abcd',
  },
  {
    id: '3',
    type: 'earn',
    amount: 18.7,
    hash: '0xabcd...ef01',
    timestamp: '2024-01-13T09:15:00Z',
    description: 'Lending rewards',
  },
]

const DPOPanel: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()
  const [transferAmount, setTransferAmount] = useState('')
  const [transferAddress, setTransferAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTransfer = async () => {
    if (!transferAmount || !transferAddress) return

    setIsLoading(true)
    try {
      console.log('Transferring DPO:', transferAmount, 'to', transferAddress)
      // Call contract transfer function
      await new Promise(resolve => setTimeout(resolve, 2000))
      setTransferAmount('')
      setTransferAddress('')
    } catch (error) {
      console.error('Transfer failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-400">{t('connectWallet')}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('dpo')}</h1>
        <p className="text-gray-400">Manage your DPO tokens and rewards</p>
      </div>

      {/* DPO Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-neon-purple" />
            <div>
              <p className="text-sm text-gray-400">{t('dpoBalance')}</p>
              <p className="text-xl font-bold text-neon-purple">
                {formatNumber(mockDpoData.balance)} DPO
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full" />
            <div>
              <p className="text-sm text-gray-400">USD Value</p>
              <p className="text-xl font-bold text-neon-cyan">
                ${formatNumber(mockDpoData.value)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Earned</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumber(mockDpoData.earned)} DPO
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse" />
            <div>
              <p className="text-sm text-gray-400">Current APY</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumber(mockDpoData.apy)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer DPO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {t('transfer')} DPO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-neon-purple focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('amount')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-neon-purple focus:outline-none text-white pr-16"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">DPO</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatNumber(mockDpoData.balance)} DPO
              </p>
            </div>

            <Button
              variant="neon"
              onClick={handleTransfer}
              disabled={!transferAmount || !transferAddress || isLoading}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? t('loading') : `${t('transfer')} DPO`}
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              {t('history')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-neon-purple/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'earn' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type === 'earn' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)} DPO
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {tx.hash}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <Button variant="ghost" size="sm">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DPO Info */}
      <Card>
        <CardHeader>
          <CardTitle>About DPO Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">How it works</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Earn DPO tokens by providing NFT collateral</li>
                <li>• Receive rewards based on lending activity</li>
                <li>• Higher utility NFTs earn more DPO</li>
                <li>• Compound rewards automatically</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Utility</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Stake for additional yield</li>
                <li>• Vote on protocol governance</li>
                <li>• Access premium features</li>
                <li>• Reduced borrowing fees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DPOPanel
