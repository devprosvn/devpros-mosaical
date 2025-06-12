
import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { TrendingUp, Brain, RefreshCw } from 'lucide-react'

interface PredictionData {
  day: number
  date: string
  predicted_price_usd: number
  predicted_price_dpsv: number
  confidence: number
}

interface PricePredictionChartProps {
  collectionId: string
  collectionName: string
}

const PricePredictionChart: React.FC<PricePredictionChartProps> = ({ 
  collectionId, 
  collectionName 
}) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [loading, setLoading] = useState(false)
  const [isTraining, setIsTraining] = useState(false)

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/predictions/${collectionId}`)
      if (response.ok) {
        const data = await response.json()
        setPredictions(data.data.predictions || [])
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const trainModel = async () => {
    try {
      setIsTraining(true)
      const response = await fetch('/api/predictions/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection_id: collectionId,
          days: 90
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Model trained successfully:', data)
        // Refresh predictions after training
        await fetchPredictions()
      }
    } catch (error) {
      console.error('Failed to train model:', error)
    } finally {
      setIsTraining(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [collectionId])

  const formatTooltip = (value: any, name: string) => {
    if (name === 'predicted_price_dpsv') {
      return [`${Number(value).toFixed(0)} DPSV`, 'Price (DPSV)']
    }
    if (name === 'predicted_price_usd') {
      return [`$${Number(value).toFixed(2)}`, 'Price (USD)']
    }
    if (name === 'confidence') {
      return [`${(Number(value) * 100).toFixed(1)}%`, 'Confidence']
    }
    return [value, name]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-purple" />
            AI Price Predictions - {collectionName}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPredictions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="neon"
              size="sm"
              onClick={trainModel}
              disabled={isTraining}
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Training...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Train AI Model
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="dpsv"
                  stroke="#A259F7"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="usd"
                  orientation="right"
                  stroke="#00FF85"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(162, 89, 247, 0.3)',
                    borderRadius: '8px'
                  }}
                  formatter={formatTooltip}
                />
                <Legend />
                <Line
                  yAxisId="dpsv"
                  type="monotone"
                  dataKey="predicted_price_dpsv"
                  stroke="#A259F7"
                  strokeWidth={3}
                  dot={{ fill: '#A259F7', strokeWidth: 0, r: 4 }}
                  name="Price (DPSV)"
                />
                <Line
                  yAxisId="usd"
                  type="monotone"
                  dataKey="predicted_price_usd"
                  stroke="#00FF85"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#00FF85', strokeWidth: 0, r: 3 }}
                  name="Price (USD)"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Prediction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">7-Day Avg</p>
                <p className="text-xl font-bold text-neon-purple">
                  {(predictions.reduce((sum, p) => sum + p.predicted_price_dpsv, 0) / predictions.length).toFixed(0)} DPSV
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Price Trend</p>
                <p className="text-xl font-bold text-green-400">
                  {predictions[predictions.length - 1]?.predicted_price_dpsv > predictions[0]?.predicted_price_dpsv ? '↑' : '↓'} 
                  {' '}
                  {(((predictions[predictions.length - 1]?.predicted_price_dpsv - predictions[0]?.predicted_price_dpsv) / predictions[0]?.predicted_price_dpsv) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Avg Confidence</p>
                <p className="text-xl font-bold text-neon-cyan">
                  {((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">No predictions available</p>
            <Button
              variant="neon"
              onClick={trainModel}
              disabled={isTraining}
            >
              {isTraining ? 'Training...' : 'Train AI Model'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PricePredictionChart
