
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { formatCurrency, formatNumber } from '../lib/utils'
import {
  CreditCard,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowRight,
} from 'lucide-react'

// Mock loan data
const mockLoans = [
  {
    id: '1',
    nftName: 'CryptoPunk #5678',
    collateralValue: 78.2,
    borrowedAmount: 45.5,
    interestRate: 6.5,
    healthFactor: 1.72,
    ltv: 58.2,
    liquidationPrice: 58.2,
    status: 'active',
  },
  {
    id: '2',
    nftName: 'Bored Ape #3456',
    collateralValue: 52.3,
    borrowedAmount: 35.8,
    interestRate: 7.2,
    healthFactor: 1.46,
    ltv: 68.5,
    liquidationPrice: 52.3,
    status: 'active',
  },
]

const Loans: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'borrow' | 'repay' | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBorrow = async (loanId: string, amount: number) => {
    setIsLoading(true)
    try {
      console.log('Borrowing:', loanId, amount)
      // Call contract borrow function
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Borrow failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepay = async (loanId: string, amount: number) => {
    setIsLoading(true)
    try {
      console.log('Repaying:', loanId, amount)
      // Call contract repay function
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Repay failed:', error)
    } finally {
      setIsLoading(false)
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
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Borrowed</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumber(totalBorrowed)} ETH
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
                            {formatNumber(loan.collateralValue)} ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Borrowed</p>
                          <p className="text-lg font-semibold text-orange-400">
                            {formatNumber(loan.borrowedAmount)} ETH
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
                        onClick={() => {
                          setSelectedLoan(loan.id)
                          setActionType('borrow')
                        }}
                        className="gap-2"
                        disabled={loan.healthFactor < 1.3}
                      >
                        <TrendingDown className="w-4 h-4" />
                        {t('borrow')} More
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedLoan(loan.id)
                          setActionType('repay')
                        }}
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        {t('repay')} Loan
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-400">
                          Liquidation at: {formatNumber(loan.liquidationPrice)} ETH
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
    </div>
  )
}

export default Loans
