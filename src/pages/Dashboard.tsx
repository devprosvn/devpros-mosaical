
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { formatCurrency, formatNumber } from '../lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Shield,
  DollarSign,
  Activity,
} from 'lucide-react'

// Mock data - would come from API
const mockData = {
  totalValue: 45650.32,
  collateralValue: 28940.15,
  borrowedAmount: 15420.50,
  healthFactor: 1.87,
  availableCredit: 13519.65,
  dpoBalance: 1250.75,
}

const portfolioData = [
  { name: 'NFT Collateral', value: 28940, color: '#9945FF' },
  { name: 'Available', value: 16710, color: '#14F195' },
  { name: 'Borrowed', value: 15420, color: '#FF6EC7' },
]

const yieldData = [
  { date: '1/1', yield: 5.2 },
  { date: '1/2', yield: 5.8 },
  { date: '1/3', yield: 4.9 },
  { date: '1/4', yield: 6.1 },
  { date: '1/5', yield: 5.7 },
  { date: '1/6', yield: 6.3 },
  { date: '1/7', yield: 5.9 },
]

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-400">{t('connectWallet')}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('dashboard')}</h1>
        <p className="text-gray-400">Overview of your NFT lending portfolio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">{t('totalValue')}</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(mockData.totalValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">{t('collateralValue')}</p>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(mockData.collateralValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">{t('borrowedAmount')}</p>
              <p className="text-xl font-bold text-orange-400">
                {formatCurrency(mockData.borrowedAmount)}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${mockData.healthFactor < 1.2 ? 'animate-glow border-red-500/50' : ''}`}>
          <div className="flex items-center space-x-2">
            <Activity className={`w-5 h-5 ${mockData.healthFactor < 1.2 ? 'text-red-400' : 'text-green-400'}`} />
            <div>
              <p className="text-sm text-gray-400">{t('healthFactor')}</p>
              <p className={`text-xl font-bold ${mockData.healthFactor < 1.2 ? 'text-red-400' : 'text-green-400'}`}>
                {formatNumber(mockData.healthFactor)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">{t('availableCredit')}</p>
              <p className="text-xl font-bold text-purple-400">
                {formatCurrency(mockData.availableCredit)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full" />
            <div>
              <p className="text-sm text-gray-400">{t('dpoBalance')}</p>
              <p className="text-xl font-bold text-cyan-400">
                {formatNumber(mockData.dpoBalance)} DPO
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4 space-x-6">
              {portfolioData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yield Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Yield']}
                  labelStyle={{ color: '#9CA3AF' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#14F195" 
                  strokeWidth={2}
                  dot={{ fill: '#14F195', strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Factor Warning */}
      {mockData.healthFactor < 1.2 && (
        <Card className="border-red-500/50 bg-red-500/10 animate-glow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">{t('liquidationWarning')}</h3>
                <p className="text-red-300">{t('healthFactorLow')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
