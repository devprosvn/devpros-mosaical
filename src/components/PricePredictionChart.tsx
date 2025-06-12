import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { TrendingUp, Download, RefreshCw } from 'lucide-react'

interface PredictionData {
  future_dates: string[]
  predicted_prices: number[]
  collection_id: string
}

interface ChartDataPoint {
  date: string
  price: number
  priceDPSV: number
}

interface PricePredictionChartProps {
  collection?: string
}

const PricePredictionChart: React.FC<PricePredictionChartProps> = ({ 
  collection = 'cryptopunks' 
}) => {
  const { t } = useLanguage()
  const [predictionData, setPredictionData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = async (collection: string) => {
    try {
      setLoading(true)
      setError(null)

      // Chỉ sử dụng AI API với CORS headers
      const response = await fetch(`http://localhost:5000/api/predictions/${collection}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Kiểm tra content type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON format')
      }

      const result = await response.json()

      // Handle prediction data
      const predictions = result.future_predictions || []

      if (!Array.isArray(predictions) || predictions.length === 0) {
        throw new Error('No prediction data available')
      }

      // Transform data for chart
      const data: ChartDataPoint[] = predictions.map((item: any, index: number) => ({
        date: `Day ${index + 1}`,
        price: item.predicted_price_usd || 0,
        priceDPSV: item.predicted_price_dpsv || 0
      }))

      setPredictionData(data)
      setError(null)

    } catch (err) {
      console.error('Error fetching predictions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions')

      // Fallback to mock data
      const mockData: ChartDataPoint[] = Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${index + 1}`,
        price: Math.random() * 50 + 50,
        priceDPSV: (Math.random() * 50 + 50) * 100
      }))
      setPredictionData(mockData)

    } finally {
      setLoading(false)
    }
  }

  const handleTrainModel = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:5000/train/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Training failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('Training completed:', result)

      // Refresh predictions after training
      await fetchPredictions(collection)

    } catch (err) {
      console.error('Error training model:', err)
      setError(err instanceof Error ? err.message : 'Training failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadModel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/models/${collection}/download`)

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nft_model_${collection}.pkl`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err) {
      console.error('Error downloading model:', err)
      setError('Download failed')
    }
  }

  useEffect(() => {
    if (collection) {
      fetchPredictions(collection);
    }
  }, [collection]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 gradient-text">
            <TrendingUp className="h-5 w-5" />
            {t('pricePrediction')} - {collection.toUpperCase()}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchPredictions(collection)}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleTrainModel}
              disabled={loading}
              size="sm"
              className="cyber-button"
            >
              {loading ? 'Training...' : 'Train AI'}
            </Button>
            <Button
              onClick={downloadModel}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2">Loading predictions...</span>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'price' ? 'USD' : 'DPSV'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#A855F7" 
                  strokeWidth={3}
                  dot={{ fill: '#A855F7', strokeWidth: 2, r: 4 }}
                  name="Price (USD)"
                />
                <Line 
                  type="monotone" 
                  dataKey="priceDPSV" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 3 }}
                  name="Price (DPSV)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <div className="text-purple-300">Avg. Prediction</div>
            <div className="text-xl font-bold text-purple-100">
              ${predictionData.length > 0 ? 
                (predictionData.reduce((sum, item) => sum + item.price, 0) / predictionData.length).toFixed(2) 
                : '0.00'}
            </div>
          </div>
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <div className="text-cyan-300">7-Day Trend</div>
            <div className="text-xl font-bold text-cyan-100">
              {predictionData.length >= 2 ? 
                (predictionData[predictionData.length - 1].price > predictionData[0].price ? '↗️ Up' : '↘️ Down')
                : '📊 Loading'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PricePredictionChart