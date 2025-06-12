
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
    document.documentElement.setAttribute('data-bs-theme', 'dark')
  }, [])

  return (
    <LanguageProvider>
      <Web3Provider>
        <Router>
          <div className="min-vh-100 bg-dark-custom text-light">
            <Header />

            <div className="container-fluid my-4">
              <div className="glass-card neon-glow text-center p-4">
                <h1 className="display-4">
                  🚀 <span className="gradient-text text-shadow">Bootstrap đang hoạt động!</span> 🚀
                </h1>
                <button className="cyber-button mt-3">Neon Cyber Button</button>
              </div>
            </div>

            <main className="container-fluid px-4 py-3">
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
