
import React from 'react'
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '../components/ui/neon-card'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  Target,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react'

// Enhanced mock analytics data
const yieldData = [
  { date: '1/1', yield: 5.2, volume: 1250, tvl: 45000 },
  { date: '1/2', yield: 5.8, volume: 1420, tvl: 47000 },
  { date: '1/3', yield: 4.9, volume: 1180, tvl: 44000 },
  { date: '1/4', yield: 6.1, volume: 1650, tvl: 48000 },
  { date: '1/5', yield: 5.7, volume: 1380, tvl: 46500 },
  { date: '1/6', yield: 6.3, volume: 1720, tvl: 49000 },
  { date: '1/7', yield: 5.9, volume: 1590, tvl: 47800 },
]

const collectionData = [
  { name: 'BAYC', floor: 45.2, volume: 1250, change: 5.8, risk: 'low' },
  { name: 'CryptoPunks', floor: 78.5, volume: 980, change: -2.1, risk: 'low' },
  { name: 'Azuki', floor: 12.3, volume: 560, change: 12.4, risk: 'medium' },
  { name: 'Doodles', floor: 8.7, volume: 340, change: -5.6, risk: 'medium' },
  { name: 'MAYC', floor: 15.6, volume: 720, change: 8.2, risk: 'low' },
]

const riskData = [
  { category: 'Low Risk', value: 45, color: '#00FF85' },
  { category: 'Medium Risk', value: 30, color: '#FFD700' },
  { category: 'High Risk', value: 25, color: '#FF006B' },
]

const Analytics: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <NeonCard className="max-w-md w-full text-center p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan animate-pulse-slow">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold gradient-text">Analytics Dashboard</h2>
              <p className="text-gray-400">Connect wallet to view market insights</p>
            </div>
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
          Market Analytics
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Real-time insights and portfolio performance metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 shadow-glow">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Total Volume</p>
              <p className="text-2xl font-bold text-white">1,250 ETH</p>
              <p className="text-xs text-green-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5% 24h
              </p>
            </div>
          </div>
        </NeonCard>

        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 shadow-glow-cyan">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Avg Yield</p>
              <p className="text-2xl font-bold text-white">5.8%</p>
              <p className="text-xs text-blue-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +0.3% from yesterday
              </p>
            </div>
          </div>
        </NeonCard>

        <NeonCard variant="glow" className="relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Active Loans</p>
              <p className="text-2xl font-bold text-white">156</p>
              <p className="text-xs text-purple-400">
                8 new today
              </p>
            </div>
          </div>
        </NeonCard>

        <NeonCard variant="glow" className="relative overflow-hidden animate-glow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 shadow-glow-pink">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider">At Risk</p>
              <p className="text-2xl font-bold text-red-400">12</p>
              <p className="text-xs text-red-300">Health factor under 1.5</p>
            </div>
          </div>
        </NeonCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yield & Volume Chart */}
        <NeonCard variant="glow">
          <NeonCardHeader>
            <NeonCardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
              <span>Yield & Volume Trends</span>
            </NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldData}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF85" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00FF85" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A259F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A259F7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#00FF85" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#A259F7" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(162, 89, 247, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#00FF85" 
                  strokeWidth={3}
                  dot={{ fill: '#00FF85', strokeWidth: 0, r: 4 }}
                  name="Yield %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#A259F7" 
                  strokeWidth={3}
                  dot={{ fill: '#A259F7', strokeWidth: 0, r: 4 }}
                  name="Volume ETH"
                />
              </LineChart>
            </ResponsiveContainer>
          </NeonCardContent>
        </NeonCard>

        {/* Risk Distribution */}
        <NeonCard variant="glow">
          <NeonCardHeader>
            <NeonCardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-neon-pink" />
              <span>Risk Distribution</span>
            </NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-6 space-x-6">
              {riskData.map((item) => (
                <div key={item.category} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg" 
                    style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }}
                  />
                  <span className="text-sm text-gray-300 font-medium">{item.category}</span>
                </div>
              ))}
            </div>
          </NeonCardContent>
        </NeonCard>
      </div>

      {/* Collection Performance */}
      <NeonCard variant="glow">
        <NeonCardHeader>
          <NeonCardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-neon-cyan" />
            <span>Top Collections Performance</span>
          </NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-4 px-4 font-medium text-gray-400 uppercase tracking-wider">Collection</th>
                  <th className="text-right py-4 px-4 font-medium text-gray-400 uppercase tracking-wider">Floor Price</th>
                  <th className="text-right py-4 px-4 font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="text-right py-4 px-4 font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-400 uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody>
                {collectionData.map((collection, index) => (
                  <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition-all duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{collection.name.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-white">{collection.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-neon-cyan font-bold text-lg">{collection.floor} ETH</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-300 font-medium">{collection.volume} ETH</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold flex items-center justify-end space-x-1 ${
                        collection.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {collection.change > 0 ? 
                          <ArrowUpRight className="w-4 h-4" /> : 
                          <ArrowDownRight className="w-4 h-4" />
                        }
                        <span>{collection.change > 0 ? '+' : ''}{collection.change}%</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        collection.risk === 'low' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        collection.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {collection.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCardContent>
      </NeonCard>

      {/* Market Volatility Chart */}
      <NeonCard variant="glow">
        <NeonCardHeader>
          <NeonCardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-neon-pink" />
            <span>Market Volatility Analysis</span>
          </NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yieldData}>
              <defs>
                <linearGradient id="volatility" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF006B" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#FF006B" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                  border: '1px solid rgba(255, 0, 107, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area
                type="monotone"
                dataKey="yield"
                stroke="#FF006B"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#volatility)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </NeonCardContent>
      </NeonCard>
    </div>
  )
}

export default Analytics
