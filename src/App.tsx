import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Web3Provider } from './contexts/Web3Context'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import NFTVault from './pages/NFTVault'
import Loans from './pages/Loans'
import Analytics from './pages/Analytics'
import DPOPanel from './pages/DPOPanel'
import './i18n'

function App() {
  useEffect(() => {
    // Enable dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <LanguageProvider>
      <Web3Provider>
        <Router>
          <div className="dark min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vault" element={<NFTVault />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/dpo" element={<DPOPanel />} />
              </Routes>
            </main>
          </div>
        </Router>
      </Web3Provider>
    </LanguageProvider>
  )
}

export default App