
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
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
} from 'lucide-react'

// Mock analytics data
const yieldData = [
  { date: '1/1', yield: 5.2, volume: 1250 },
  { date: '1/2', yield: 5.8, volume: 1420 },
  { date: '1/3', yield: 4.9, volume: 1180 },
  { date: '1/4', yield: 6.1, volume: 1650 },
  { date: '1/5', yield: 5.7, volume: 1380 },
  { date: '1/6', yield: 6.3, volume: 1720 },
  { date: '1/7', yield: 5.9, volume: 1590 },
]

const collectionData = [
  { name: 'BAYC', floor: 45.2, volume: 1250, change: 5.8 },
  { name: 'CryptoPunks', floor: 78.5, volume: 980, change: -2.1 },
  { name: 'Azuki', floor: 12.3, volume: 560, change: 12.4 },
  { name: 'Doodles', floor: 8.7, volume: 340, change: -5.6 },
  { name: 'MAYC', floor: 15.6, volume: 720, change: 8.2 },
]

const riskData = [
  { category: 'Low Risk', value: 45, color: '#14F195' },
  { category: 'Medium Risk', value: 30, color: '#FFA500' },
  { category: 'High Risk', value: 25, color: '#FF6EC7' },
]

const Analytics: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-400">{t('connectWallet')}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('analytics')}</h1>
        <p className="text-gray-400">Market insights and portfolio analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-xl font-bold text-green-400">1,250 ETH</p>
              <p className="text-xs text-green-300">+12.5% 24h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Avg Yield</p>
              <p className="text-xl font-bold text-blue-400">5.8%</p>
              <p className="text-xs text-blue-300">+0.3% from yesterday</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Active Loans</p>
              <p className="text-xl font-bold text-purple-400">156</p>
              <p className="text-xs text-purple-300">8 new today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">At Risk</p>
              <p className="text-xl font-bold text-orange-400">12</p>
              <p className="text-xs text-orange-300">Health factor < 1.5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield & Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Yield & Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#14F195" 
                  strokeWidth={2}
                  name="Yield %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#9945FF" 
                  strokeWidth={2}
                  name="Volume ETH"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4 space-x-6">
              {riskData.map((item) => (
                <div key={item.category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-400">{item.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Collection</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">Floor Price</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">Volume</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {collectionData.map((collection, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-4 font-medium text-white">{collection.name}</td>
                    <td className="py-3 px-4 text-right text-neon-cyan">
                      {collection.floor} ETH
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {collection.volume} ETH
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      collection.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {collection.change > 0 ? '+' : ''}{collection.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Volatility Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Market Volatility</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yieldData}>
              <defs>
                <linearGradient id="volatility" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6EC7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF6EC7" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area
                type="monotone"
                dataKey="yield"
                stroke="#FF6EC7"
                fillOpacity={1}
                fill="url(#volatility)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
