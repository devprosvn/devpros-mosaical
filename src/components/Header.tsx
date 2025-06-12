
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import ConnectWallet from './ConnectWallet'
import LanguageSwitch from './LanguageSwitch'
import {
  LayoutDashboard,
  PieChart,
  Coins,
  Vault,
  Menu,
  X,
  Zap,
  Shield,
  Activity,
} from 'lucide-react'

const Header: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('analytics'), href: '/analytics', icon: PieChart },
    { name: t('loans'), href: '/loans', icon: Coins },
    { name: t('nftVault'), href: '/vault', icon: Vault },
    { name: 'DPO Panel', href: '/dpo', icon: Activity },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Main Header */}
      <header className="sticky-top">
        <nav className="navbar navbar-expand-lg glass-card border-bottom">
          <div className="container-fluid">
            {/* Logo */}
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <div className="position-relative me-2">
                <div className="d-flex align-items-center justify-content-center rounded-3 neon-glow" 
                     style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #a855f7, #06b6d4)' }}>
                  <Zap className="text-white" size={24} />
                </div>
              </div>
              <div className="d-none d-sm-block">
                <h5 className="mb-0 gradient-text fw-bold">Mosaical</h5>
                <small className="text-gray-400">NFT Lending</small>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <li className="nav-item" key={item.name}>
                      <Link
                        to={item.href}
                        className={`nav-link d-flex align-items-center px-3 py-2 rounded-3 mx-1 ${
                          isActive(item.href)
                            ? 'glass-card neon-border text-white'
                            : 'text-gray-300'
                        }`}
                      >
                        <Icon className={`me-2 ${isActive(item.href) ? 'text-info' : ''}`} size={16} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Actions */}
              <div className="d-flex align-items-center gap-3">
                {/* Connection Status */}
                {isConnected && (
                  <div className="d-none d-sm-flex align-items-center px-3 py-1 rounded-pill bg-success bg-opacity-25 border border-success border-opacity-50">
                    <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                    <small className="text-success fw-medium">Connected</small>
                  </div>
                )}

                <LanguageSwitch />
                <ConnectWallet />

                {/* Mobile Menu Button */}
                <button
                  className="navbar-toggler d-lg-none border-0"
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="d-lg-none">
            <div className="glass-card border-top">
              <div className="container-fluid py-3">
                <nav className="d-flex flex-column gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`d-flex align-items-center px-3 py-3 rounded-3 text-decoration-none ${
                          isActive(item.href)
                            ? 'glass-card neon-border text-white'
                            : 'text-gray-300'
                        }`}
                      >
                        <Icon className={`me-3 ${isActive(item.href) ? 'text-info' : ''}`} size={20} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Status Bar */}
      {isConnected && (
        <div className="w-100 bg-success bg-opacity-10 border-bottom border-success border-opacity-25">
          <div className="container-fluid py-2">
            <div className="d-flex align-items-center justify-content-center gap-4">
              <div className="d-flex align-items-center text-success">
                <Shield className="me-2" size={16} />
                <span>Secure Connection</span>
              </div>
              <div className="bg-secondary rounded-circle" style={{ width: '4px', height: '4px' }}></div>
              <div className="d-flex align-items-center text-info">
                <Activity className="me-2" size={16} />
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
