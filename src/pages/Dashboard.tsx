
import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { NeonCard, NeonCardHeader, NeonCardTitle, NeonCardContent } from '../components/ui/neon-card'
import { CyberButton } from '../components/ui/cyber-button'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Target,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// Mock data with enhanced structure
const mockData = {
  totalValue: 125.5,
  totalEarned: 15.2,
  activeLoans: 8,
  availableToLend: 45.8,
  healthFactor: 2.45,
  apy: 12.5,
}

const yieldData = [
  { date: 'Mon', yield: 8.2, volume: 120 },
  { date: 'Tue', yield: 9.1, volume: 145 },
  { date: 'Wed', yield: 7.8, volume: 98 },
  { date: 'Thu', yield: 11.5, volume: 180 },
  { date: 'Fri', yield: 12.3, volume: 220 },
  { date: 'Sat', yield: 10.7, volume: 165 },
  { date: 'Sun', yield: 13.2, volume: 240 },
]

const performanceData = [
  { name: 'Lending', value: 45, color: '#A259F7' },
  { name: 'Borrowing', value: 30, color: '#00BFFF' },
  { name: 'Staking', value: 25, color: '#FF006B' },
]

const formatCurrency = (value: number) => `$${value.toLocaleString()}`
const formatNumber = (value: number) => value.toFixed(2)

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <NeonCard className="max-w-md w-full text-center p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan animate-pulse-slow">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold gradient-text">Connect Your Wallet</h2>
              <p className="text-gray-400">Access your NFT lending portfolio</p>
            </div>
            <CyberButton size="lg" className="w-full">
              <Wallet className="w-5 h-5 mr-2" />
              {t('connectWallet')}
            </CyberButton>
          </div>
        </NeonCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text mb-4 text-shadow">
          {t('dashboard')}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your comprehensive NFT lending portfolio overview
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Portfolio Value */}
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 shadow-glow">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Total Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(mockData.totalValue)}
              </p>
              <p className="text-xs text-green-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8.2% 24h
              </p>
            </div>
          </div>
        </NeonCard>

        {/* Total Earned */}
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-neon-purple to-fuchsia-500 shadow-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Total Earned</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(mockData.totalEarned)}
              </p>
              <p className="text-xs text-purple-400 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                APY {formatNumber(mockData.apy)}%
              </p>
            </div>
          </div>
        </NeonCard>

        {/* Active Loans */}
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-glow-cyan">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Active Loans</p>
              <p className="text-2xl font-bold text-white">
                {mockData.activeLoans}
              </p>
              <p className="text-xs text-cyan-400">
                3 expiring soon
              </p>
            </div>
          </div>
        </NeonCard>

        {/* Available to Lend */}
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Available</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(mockData.availableToLend)}
              </p>
              <p className="text-xs text-yellow-400">
                Ready to lend
              </p>
            </div>
          </div>
        </NeonCard>

        {/* Health Factor */}
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl shadow-glow ${
              mockData.healthFactor > 2 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
              mockData.healthFactor > 1.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Health Factor</p>
              <p className={`text-2xl font-bold ${
                mockData.healthFactor > 2 ? 'text-green-400' : 
                mockData.healthFactor > 1.5 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {formatNumber(mockData.healthFactor)}
              </p>
              <p className="text-xs text-green-400">
                Excellent
              </p>
            </div>
          </div>
        </NeonCard>

        {/* Quick Action */}
        <NeonCard variant="border" className="relative overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Target className="w-8 h-8 text-neon-purple animate-pulse" />
            <CyberButton size="sm" className="w-full">
              Quick Lend
            </CyberButton>
          </div>
        </NeonCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yield Performance Chart */}
        <NeonCard variant="glow">
          <NeonCardHeader>
            <NeonCardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
              <span>7-Day Yield Performance</span>
            </NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A259F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A259F7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Yield']}
                  labelStyle={{ color: '#9CA3AF' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#A259F7" 
                  strokeWidth={3}
                  fill="url(#yieldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </NeonCardContent>
        </NeonCard>

        {/* Portfolio Distribution */}
        <NeonCard variant="glow">
          <NeonCardHeader>
            <NeonCardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-neon-pink" />
              <span>Portfolio Distribution</span>
            </NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <div className="space-y-6">
              {performanceData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-white font-bold">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.value}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeonCardContent>
        </NeonCard>
      </div>

      {/* Recent Activity */}
      <NeonCard variant="glow">
        <NeonCardHeader>
          <NeonCardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-neon-cyan" />
            <span>Recent Activity</span>
          </NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <div className="space-y-4">
            {[
              { action: 'Lent NFT', amount: '2.5 ETH', time: '2 hours ago', status: 'success' },
              { action: 'Repaid Loan', amount: '1.8 ETH', time: '5 hours ago', status: 'success' },
              { action: 'Liquidated', amount: '0.3 ETH', time: '1 day ago', status: 'warning' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    activity.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {activity.status === 'success' ? <ArrowUpRight className="w-4 h-4" /> :
                     activity.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                     <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{activity.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </NeonCardContent>
      </NeonCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CyberButton size="lg" className="h-16">
          <DollarSign className="w-6 h-6 mr-2" />
          Lend Assets
        </CyberButton>
        <CyberButton size="lg" variant="outline" className="h-16">
          <Target className="w-6 h-6 mr-2" />
          Borrow Against NFT
        </CyberButton>
        <CyberButton size="lg" variant="secondary" className="h-16">
          <Sparkles className="w-6 h-6 mr-2" />
          Explore Markets
        </CyberButton>
      </div>
    </div>
  )
}

export default Dashboard
