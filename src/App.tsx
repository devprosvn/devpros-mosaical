
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Web3Provider } from './contexts/Web3Context'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import NFTVault from './pages/NFTVault'
import Loans from './pages/Loans'
import DPOPanel from './pages/DPOPanel'
import Analytics from './pages/Analytics'

function App() {
  return (
    <LanguageProvider>
      <Web3Provider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vault" element={<NFTVault />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/dpo" element={<DPOPanel />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </div>
        </Router>
      </Web3Provider>
    </LanguageProvider>
  )
}

export default App
