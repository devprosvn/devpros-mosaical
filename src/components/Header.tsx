
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import ConnectWallet from './ConnectWallet'
import LanguageSwitch from './LanguageSwitch'
import { useLanguage } from '../contexts/LanguageContext'
import { cn } from '../lib/utils'
import { 
  LayoutDashboard, 
  Vault, 
  CreditCard, 
  Coins, 
  BarChart3,
  Menu
} from 'lucide-react'

const Header: React.FC = () => {
  const { t } = useLanguage()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('vault'), href: '/vault', icon: Vault },
    { name: t('loans'), href: '/loans', icon: CreditCard },
    { name: t('dpo'), href: '/dpo', icon: Coins },
    { name: t('analytics'), href: '/analytics', icon: BarChart3 },
  ]

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold gradient-text">Mosaical</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitch />
            <ConnectWallet />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
