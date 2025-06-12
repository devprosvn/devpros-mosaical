
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import ConnectWallet from './ConnectWallet'
import LanguageSwitch from './LanguageSwitch'
import { CyberButton } from './ui/cyber-button'
import {
  LayoutDashboard,
  PieChart,
  Coins,
  Vault,
  Settings,
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
      <header className="sticky top-0 z-50 w-full">
        <div className="glass-card border-b border-white/10 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan flex items-center justify-center transform group-hover:scale-110 transition-all duration-200 shadow-glow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan opacity-50 blur-md"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">Mosaical</h1>
                  <p className="text-xs text-gray-400 -mt-1">NFT Lending</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 text-white border border-neon-purple/30 shadow-glow'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-neon-cyan' : ''}`} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {/* Connection Status Indicator */}
                {isConnected && (
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Connected</span>
                  </div>
                )}

                <LanguageSwitch />
                <ConnectWallet />

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="glass-card border-t border-white/10">
              <div className="container mx-auto px-4 py-4">
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 text-white border border-neon-purple/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-neon-cyan' : ''}`} />
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
        <div className="w-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="w-4 h-4" />
                <span>Secure Connection</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="flex items-center space-x-2 text-cyan-400">
                <Activity className="w-4 h-4" />
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
