import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'
import PricePredictionChart from '../components/PricePredictionChart'

const Analytics: React.FC = () => {
  const { t } = useLanguage()
  const [selectedCollection, setSelectedCollection] = useState('cryptopunks')

  const collections = [
    { id: 'cryptopunks', name: 'CryptoPunks' },
    { id: 'azuki', name: 'Azuki' },
    { id: 'bored-ape-yacht-club', name: 'BAYC' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 gradient-text" />
        <h1 className="text-3xl font-bold gradient-text">{t('analytics')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs Deposited</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Selector */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>AI Price Prediction Analytics</CardTitle>
          <div className="flex gap-2 mt-4">
            {collections.map((collection) => (
              <Button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                variant={selectedCollection === collection.id ? "default" : "outline"}
                size="sm"
                className={selectedCollection === collection.id ? "cyber-button" : ""}
              >
                {collection.name}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Price Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PricePredictionChart collection={selectedCollection} />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 rounded-lg">
                <div className="text-green-300 text-sm">Model Accuracy (R²)</div>
                <div className="text-2xl font-bold text-green-100">0.85</div>
              </div>
              <div className="p-4 bg-blue-500/20 rounded-lg">
                <div className="text-blue-300 text-sm">Mean Absolute Error</div>
                <div className="text-2xl font-bold text-blue-100">$2.34</div>
              </div>
              <div className="p-4 bg-orange-500/20 rounded-lg">
                <div className="text-orange-300 text-sm">Last Updated</div>
                <div className="text-lg font-bold text-orange-100">2 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Collections Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <PricePredictionChart 
            key={collection.id} 
            collection={collection.id} 
          />
        ))}
      </div>
    </div>
  )
}

export default Analytics