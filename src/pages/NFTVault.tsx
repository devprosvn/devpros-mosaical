
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeb3 } from '../contexts/Web3Context'
import { Image, Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

const NFTVault: React.FC = () => {
  const { t } = useLanguage()
  const { isConnected } = useWeb3()
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [nftCollections, setNFTCollections] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNFTCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/nfts')
      if (response.ok) {
        const data = await response.json()
        setNFTCollections(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch NFT collections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTCollections()
  }, [])

  const handleDeposit = async (nftId: string) => {
    setIsLoading(true)
    try {
      // Call contract deposit function
      console.log('Depositing NFT:', nftId)
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (nftId: string) => {
    setIsLoading(true)
    try {
      // Call contract withdraw function
      console.log('Withdrawing NFT:', nftId)
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Withdraw failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-400">{t('connectWallet')}</p>
        </Card>
      </div>
    )
  }

  const ownedNFTs = nftCollections.filter(nft => !nft.deposited)
  const depositedNFTs = nftCollections.filter(nft => nft.deposited)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('vault')}</h1>
        <p className="text-gray-400">Manage your NFT collateral</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Total NFTs</p>
            <p className="text-2xl font-bold text-white">{nftCollections.length}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Deposited</p>
            <p className="text-2xl font-bold text-neon-cyan">{depositedNFTs.length}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Value</p>
            <p className="text-2xl font-bold text-neon-purple">
              {nftCollections.reduce((sum, nft) => sum + (nft.floorPriceDPSV || 0), 0).toFixed(0)} DPSV
            </p>
          </div>
        </Card>
      </div>

      {/* Your NFTs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t('yourNFTs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedNFTs.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">No NFTs available for deposit</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="border border-gray-700 rounded-lg p-4 hover:border-neon-purple/50 transition-all duration-200"
                >
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{nft.collection}</p>
                  <div className="mb-3">
                    <p className="text-lg font-bold text-neon-purple">{nft.floorPriceDPSV?.toFixed(0)} DPSV</p>
                    <p className="text-sm text-gray-400">${nft.floorPrice?.toFixed(2)} USD</p>
                  </div>
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => handleDeposit(nft.id)}
                    disabled={isLoading}
                    className="w-full gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    {t('deposit')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposited NFTs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5" />
            {t('depositedNFTs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {depositedNFTs.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownToLine className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">No deposited NFTs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {depositedNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="border border-neon-cyan/30 rounded-lg p-4 bg-neon-cyan/5"
                >
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{nft.collection}</p>
                  <p className="text-lg font-bold text-neon-cyan mb-3">{nft.value} ETH</p>
                  <Button
                    variant={nft.canWithdraw ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleWithdraw(nft.id)}
                    disabled={!nft.canWithdraw || isLoading}
                    className="w-full gap-2"
                  >
                    <ArrowUpFromLine className="w-4 h-4" />
                    {nft.canWithdraw ? t('withdraw') : 'Active Loan'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NFTVault
