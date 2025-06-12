import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Wallet, TrendingUp, Shield, Zap } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()

  const mockData = {
    totalValue: 12500,
    collateralValue: 8750,
    borrowedAmount: 3200,
    healthFactor: 2.73
  }

  return (
    <div className="container-fluid">
      <div className="text-center mb-5">
        <h1 className="display-4 gradient-text fw-bold mb-3">{t('dashboard')}</h1>
        <p className="fs-5 text-gray-400">Welcome to the future of NFT lending</p>
      </div>

      {!isConnected && (
        <div className="row mb-4">
          <div className="col-12">
            <Card className="border-warning bg-warning bg-opacity-10">
              <CardContent className="p-4">
                <div className="d-flex align-items-center">
                  <Wallet className="text-warning me-3" size={24} />
                  <div>
                    <h5 className="text-warning mb-1">Connect Your Wallet</h5>
                    <p className="text-gray-400 mb-0 small">
                      Connect your wallet to access all platform features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <Card className="glass-card neon-glow h-100">
            <CardHeader className="pb-2">
              <CardTitle className="small text-gray-400 d-flex align-items-center">
                <TrendingUp className="me-2" size={16} />
                {t('totalValue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h4 gradient-text fw-bold">${mockData.totalValue.toLocaleString()}</div>
              <small className="text-muted">+2.5% from last month</small>
            </CardContent>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="glass-card h-100">
            <CardHeader className="pb-2">
              <CardTitle className="small text-gray-400 d-flex align-items-center">
                <Shield className="me-2" size={16} />
                {t('collateralValue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h4 text-info fw-bold">${mockData.collateralValue.toLocaleString()}</div>
              <small className="text-muted">70% of portfolio</small>
            </CardContent>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="glass-card h-100">
            <CardHeader className="pb-2">
              <CardTitle className="small text-gray-400 d-flex align-items-center">
                <Zap className="me-2" size={16} />
                {t('borrowedAmount')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h4 text-warning fw-bold">${mockData.borrowedAmount.toLocaleString()}</div>
              <small className="text-muted">25.6% utilization</small>
            </CardContent>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="glass-card h-100">
            <CardHeader className="pb-2">
              <CardTitle className="small text-gray-400">
                {t('healthFactor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h4 text-success fw-bold">{mockData.healthFactor}</div>
              <small className="text-muted">Healthy</small>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <Card className="glass-card h-100">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-gray-700">
                <div>
                  <div className="fw-medium">NFT Deposited</div>
                  <small className="text-gray-400">Bored Ape #1234</small>
                </div>
                <span className="small text-success">+$2,500</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-gray-700">
                <div>
                  <div className="fw-medium">Loan Repaid</div>
                  <small className="text-gray-400">Partial repayment</small>
                </div>
                <span className="small text-info">-$1,000</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card className="glass-card h-100">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="d-grid gap-3">
              <Button variant="neon" className="w-100">
                Deposit NFTs
              </Button>
              <Button variant="outline" className="w-100">
                Borrow Funds
              </Button>
              <Button variant="secondary" className="w-100">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard