
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { formatCurrency, formatNumber } from '../lib/utils'
import { CONTRACT_ADDRESSES, USD_TO_DPSV_RATE } from '../lib/constants'
import {
  CreditCard,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowRight,
  Coins,
} from 'lucide-react'

// Mock loan data converted to DPSV
const mockLoans = [
  {
    id: '1',
    nftName: 'CryptoPunk #5678',
    collateralValue: 7820, // 78.2 ETH * 100 DPSV/ETH
    borrowedAmount: 4550, // 45.5 ETH * 100 DPSV/ETH
    interestRate: 6.5,
    healthFactor: 1.72,
    ltv: 58.2,
    liquidationPrice: 5820, // 58.2 ETH * 100 DPSV/ETH
    status: 'active',
    nftContract: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
    tokenId: '5678'
  },
  {
    id: '2',
    nftName: 'Bored Ape #3456',
    collateralValue: 5230, // 52.3 ETH * 100 DPSV/ETH
    borrowedAmount: 3580, // 35.8 ETH * 100 DPSV/ETH
    interestRate: 7.2,
    healthFactor: 1.46,
    ltv: 68.5,
    liquidationPrice: 5230, // 52.3 ETH * 100 DPSV/ETH
    status: 'active',
    nftContract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    tokenId: '3456'
  },
]

const Loans: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected, account, signer } = useWeb3()
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'borrow' | 'repay' | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dpoBalance, setDpoBalance] = useState(0)

  useEffect(() => {
    if (isConnected && account) {
      fetchDPOBalance()
    }
  }, [isConnected, account])

  const fetchDPOBalance = async () => {
    try {
      const response = await fetch(`/api/user/balance?address=${account}`)
      const data = await response.json()
      setDpoBalance(data.dpoBalance || 0)
    } catch (error) {
      console.error('Failed to fetch DPO balance:', error)
    }
  }

  const handleBorrow = async (loanId: string, amount: number) => {
    setIsLoading(true)
    try {
      const loan = mockLoans.find(l => l.id === loanId)
      if (!loan) throw new Error('Loan not found')

      const response = await fetch('/api/tx/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          nftContract: loan.nftContract,
          tokenId: loan.tokenId,
          amount: amount.toString()
        })
      })

      const { data } = await response.json()
      
      if (signer) {
        const tx = await signer.sendTransaction({
          to: data.transactionPayload.to,
          data: data.transactionPayload.data,
          value: data.transactionPayload.value || '0'
        })
        
        await tx.wait()
        alert(`Successfully borrowed ${amount} DPSV!`)
        setShowModal(false)
        setAmount('')
      }
    } catch (error) {
      console.error('Borrow failed:', error)
      alert('Borrow transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepay = async (loanId: string, amount: number) => {
    setIsLoading(true)
    try {
      if (dpoBalance < amount) {
        alert('Insufficient DPSV balance')
        return
      }

      const response = await fetch('/api/tx/repay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          loanId: loanId,
          amount: amount.toString()
        })
      })

      const { data } = await response.json()
      
      if (signer) {
        const tx = await signer.sendTransaction({
          to: data.transactionPayload.to,
          data: data.transactionPayload.data,
          value: data.transactionPayload.value || '0'
        })
        
        await tx.wait()
        alert(`Successfully repaid ${amount} DPSV!`)
        setShowModal(false)
        setAmount('')
        fetchDPOBalance() // Refresh balance
      }
    } catch (error) {
      console.error('Repay failed:', error)
      alert('Repay transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const openActionModal = (loanId: string, action: 'borrow' | 'repay') => {
    setSelectedLoan(loanId)
    setActionType(action)
    setShowModal(true)
    setAmount('')
  }

  const executeAction = () => {
    if (!selectedLoan || !amount || parseFloat(amount) <= 0) return
    
    if (actionType === 'borrow') {
      handleBorrow(selectedLoan, parseFloat(amount))
    } else if (actionType === 'repay') {
      handleRepay(selectedLoan, parseFloat(amount))
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-400">{t('connectWallet')}</p>
        </Card>
      </div>
    )
  }

  const totalBorrowed = mockLoans.reduce((sum, loan) => sum + loan.borrowedAmount, 0)
  const avgHealthFactor = mockLoans.reduce((sum, loan) => sum + loan.healthFactor, 0) / mockLoans.length
  const riskLoans = mockLoans.filter(loan => loan.healthFactor < 1.5).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('loans')}</h1>
        <p className="text-gray-400">Manage your active loans and borrowing positions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Borrowed</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumber(totalBorrowed)} DPSV
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Active Loans</p>
              <p className="text-xl font-bold text-blue-400">{mockLoans.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className={`w-5 h-5 ${avgHealthFactor < 1.5 ? 'text-red-400' : 'text-green-400'}`} />
            <div>
              <p className="text-sm text-gray-400">Avg Health Factor</p>
              <p className={`text-xl font-bold ${avgHealthFactor < 1.5 ? 'text-red-400' : 'text-green-400'}`}>
                {formatNumber(avgHealthFactor)}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${riskLoans > 0 ? 'border-red-500/50 animate-glow' : ''}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-5 h-5 ${riskLoans > 0 ? 'text-red-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm text-gray-400">At Risk</p>
              <p className={`text-xl font-bold ${riskLoans > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {riskLoans}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('activeLoan')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockLoans.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">No active loans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockLoans.map((loan) => (
                <div
                  key={loan.id}
                  className={`border rounded-lg p-6 transition-all duration-200 ${
                    loan.healthFactor < 1.5
                      ? 'border-red-500/50 bg-red-500/5 animate-glow'
                      : 'border-gray-700 hover:border-neon-purple/50'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Loan Info */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{loan.nftName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.healthFactor < 1.5
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {loan.healthFactor < 1.5 ? 'At Risk' : 'Healthy'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Collateral Value</p>
                          <p className="text-lg font-semibold text-neon-cyan">
                            {formatNumber(loan.collateralValue)} DPSV
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Borrowed</p>
                          <p className="text-lg font-semibold text-orange-400">
                            {formatNumber(loan.borrowedAmount)} DPSV
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Interest Rate</p>
                          <p className="text-lg font-semibold text-purple-400">
                            {formatNumber(loan.interestRate)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">LTV</p>
                          <p className="text-lg font-semibold text-gray-300">
                            {formatNumber(loan.ltv)}%
                          </p>
                        </div>
                      </div>

                      {/* Health Factor */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Health Factor</span>
                          <span className={`font-semibold ${
                            loan.healthFactor < 1.5 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {formatNumber(loan.healthFactor)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              loan.healthFactor < 1.2
                                ? 'bg-red-500'
                                : loan.healthFactor < 1.5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(loan.healthFactor * 50, 100)}%` }}
                          />
                        </div>
                      </div>

                      {loan.healthFactor < 1.5 && (
                        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-red-400">Liquidation Risk</p>
                            <p className="text-xs text-red-300">
                              Consider repaying to improve health factor
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col justify-center space-y-4">
                      <Button
                        variant="neon"
                        onClick={() => openActionModal(loan.id, 'borrow')}
                        className="gap-2"
                        disabled={loan.healthFactor < 1.3}
                      >
                        <TrendingDown className="w-4 h-4" />
                        {t('borrow')} More DPSV
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => openActionModal(loan.id, 'repay')}
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        {t('repay')} Loan
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-400">
                          Liquidation at: {formatNumber(loan.liquidationPrice)} DPSV
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Your DPO Balance: {formatNumber(dpoBalance)} DPSV
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {actionType === 'borrow' ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-neon-cyan" />
                    Borrow More DPSV
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 text-green-400" />
                    Repay Loan
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (DPSV)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  placeholder="Enter amount in DPSV"
                  min="0"
                  step="0.01"
                />
              </div>

              {actionType === 'repay' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    Available Balance: {formatNumber(dpoBalance)} DPSV
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="neon"
                  onClick={executeAction}
                  className="flex-1"
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                >
                  {isLoading ? 'Processing...' : actionType === 'borrow' ? 'Borrow' : 'Repay'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Loans
