'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Store, Users, Globe, Coins, CheckCircle, AlertCircle, 
  Clock, TrendingUp, Shield, Zap, Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MarketplaceSelectionProps {
  predictionId: string
  predictionResult: {
    predicted_price_recommended: number
    predicted_price_low: number
    predicted_price_high: number
    condition_grade: string
    prediction_confidence: number
  }
  vehicleInfo: {
    brand_name?: string
    model_name?: string
    year: number
  }
  onListingCreated?: (listingId: string) => void
}

type MarketplaceType = 'dealer_only' | 'public_only' | 'both'

interface TokenSettings {
  ai_prediction_tokens: number
  listing_normal_tokens: number
  listing_normal_duration_days: number
  listing_dealer_tokens: number
  listing_dealer_duration_days: number
  dealer_contact_tokens: number
  token_price_base: number
}

interface TokenBalance {
  balance: number
  total_purchased: number
  total_used: number
}

const MARKETPLACE_OPTIONS = [
  {
    id: 'dealer_only' as MarketplaceType,
    title: 'Ditawarkan ke Dealer',
    subtitle: 'Tampil di Dealer Marketplace saja',
    icon: Store,
    color: 'from-purple-500 to-indigo-600',
    features: [
      'Hanya dealer bisa lihat',
      'Privasi lebih terjaga',
      'Potensi penjualan cepat',
      'Chat dengan dealer aktif'
    ],
    tokens: 20,
    duration: '7 hari',
    bestFor: 'Ingin jual cepat dengan privasi'
  },
  {
    id: 'public_only' as MarketplaceType,
    title: 'Pasang Iklan Normal',
    subtitle: 'Tampil di Public Marketplace',
    icon: Globe,
    color: 'from-emerald-500 to-teal-600',
    features: [
      'Semua user bisa lihat',
      'Chat GRATIS unlimited',
      'Exposure lebih luas',
      'Durasi lebih lama'
    ],
    tokens: 10,
    duration: '30 hari',
    bestFor: 'Ingin eksposur maksimal'
  },
  {
    id: 'both' as MarketplaceType,
    title: 'Kedua Marketplace',
    subtitle: 'Tampil di Dealer + Public',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Dealer + Public Marketplace',
      'Double exposure',
      'Semua fitur gabungan',
      'Fleksibilitas maksimal'
    ],
    tokens: 30,
    duration: 'Dealer 7 hari + Public 30 hari',
    bestFor: 'Ingin semua opsi penjualan'
  }
]

export default function MarketplaceSelection({
  predictionId,
  predictionResult,
  vehicleInfo,
  onListingCreated
}: MarketplaceSelectionProps) {
  const { toast } = useToast()
  
  const [marketplaceType, setMarketplaceType] = useState<MarketplaceType>('public_only')
  const [tokenSettings, setTokenSettings] = useState<TokenSettings | null>(null)
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({ balance: 0, total_purchased: 0, total_used: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  
  // Calculate token costs
  const dealerTokens = tokenSettings?.listing_dealer_tokens || 20
  const publicTokens = tokenSettings?.listing_normal_tokens || 10
  
  const calculateTokens = () => {
    switch (marketplaceType) {
      case 'dealer_only':
        return dealerTokens
      case 'public_only':
        return publicTokens
      case 'both':
        return dealerTokens + publicTokens
    }
  }
  
  const requiredTokens = calculateTokens()
  const hasEnoughBalance = tokenBalance.balance >= requiredTokens
  const shortfall = Math.max(0, requiredTokens - tokenBalance.balance)
  
  // Load token settings and balance
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      // Load token settings
      const settingsRes = await fetch('/api/admin/token-settings')
      const settingsData = await settingsRes.json()
      if (settingsData.success) {
        setTokenSettings(settingsData.data)
      }
      
      // Load user token balance (mock for demo)
      // In production, get from auth context
      setTokenBalance({ balance: 50, total_purchased: 100, total_used: 50 })
    } catch (error) {
      console.error('Error loading data:', error)
      // Set defaults
      setTokenSettings({
        ai_prediction_tokens: 5,
        listing_normal_tokens: 10,
        listing_normal_duration_days: 30,
        listing_dealer_tokens: 20,
        listing_dealer_duration_days: 7,
        dealer_contact_tokens: 5,
        token_price_base: 1000
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleActivate = async () => {
    if (!hasEnoughBalance) {
      toast({
        title: 'Saldo Token Tidak Cukup',
        description: `Anda membutuhkan ${shortfall} token lagi. Silakan beli token terlebih dahulu.`,
        variant: 'destructive'
      })
      return
    }
    
    if (!agreeToTerms) {
      toast({
        title: 'Syarat & Ketentuan',
        description: 'Mohon centang persetujuan syarat dan ketentuan',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // First, create the listing
      const listingRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction_id: predictionId,
          title: `${vehicleInfo.brand_name || 'Car'} ${vehicleInfo.model_name || 'Model'} ${vehicleInfo.year}`,
          price_cash: predictionResult.predicted_price_recommended,
          status: 'draft'
        })
      })
      
      const listingData = await listingRes.json()
      
      if (!listingData.success) {
        throw new Error(listingData.error || 'Failed to create listing')
      }
      
      // Then activate in marketplace
      const activateRes = await fetch('/api/marketplace-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingData.data.id,
          marketplace_type: marketplaceType,
          user_id: 'demo-user' // In production, get from auth
        })
      })
      
      const activateData = await activateRes.json()
      
      if (!activateData.success) {
        throw new Error(activateData.error || 'Failed to activate listing')
      }
      
      toast({
        title: 'Berhasil!',
        description: `Iklan berhasil diaktifkan di ${marketplaceType === 'both' ? 'kedua marketplace' : marketplaceType === 'dealer_only' ? 'Dealer Marketplace' : 'Public Marketplace'}`,
      })
      
      onListingCreated?.(listingData.data.id)
      
    } catch (error) {
      toast({
        title: 'Gagal Mengaktifkan',
        description: String(error),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-10 h-10" />
              <div>
                <div className="text-sm opacity-80">Saldo Token Anda</div>
                <div className="text-3xl font-bold">{formatNumber(tokenBalance.balance)}</div>
              </div>
            </div>
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
              <Zap className="w-4 h-4 mr-2" />
              Beli Token
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Marketplace Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            Pilih Marketplace
          </CardTitle>
          <CardDescription>
            Pilih di mana iklan Anda akan ditampilkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={marketplaceType} 
            onValueChange={(value) => setMarketplaceType(value as MarketplaceType)}
            className="space-y-4"
          >
            {MARKETPLACE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  marketplaceType === option.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setMarketplaceType(option.id)}
              >
                <RadioGroupItem value={option.id} className="mt-1" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color} text-white`}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.subtitle}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{option.tokens} Token</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{option.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Biaya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {marketplaceType !== 'public_only' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dealer Marketplace ({dealerTokens} token)</span>
                <span className="font-medium">{formatPrice(dealerTokens * (tokenSettings?.token_price_base || 1000))}</span>
              </div>
            )}
            {marketplaceType !== 'dealer_only' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Public Marketplace ({publicTokens} token)</span>
                <span className="font-medium">{formatPrice(publicTokens * (tokenSettings?.token_price_base || 1000))}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total Token</span>
            <span className={hasEnoughBalance ? 'text-emerald-600' : 'text-red-500'}>
              {requiredTokens} Token
            </span>
          </div>
          
          {!hasEnoughBalance && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-red-700">Saldo Tidak Cukup</div>
                <div className="text-sm text-red-600">
                  Anda membutuhkan {shortfall} token lagi ({formatPrice(shortfall * (tokenSettings?.token_price_base || 1000))})
                </div>
              </div>
            </div>
          )}
          
          {hasEnoughBalance && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-medium text-emerald-700">Saldo Mencukupi</div>
                <div className="text-sm text-emerald-600">
                  Sisa saldo setelah aktivasi: {tokenBalance.balance - requiredTokens} token
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Terms & Conditions */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          Saya menyetujui <span className="text-emerald-600 underline">Syarat & Ketentuan</span> dan 
          memahami bahwa token yang digunakan tidak dapat dikembalikan.
        </Label>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          Nanti Saja
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          disabled={!hasEnoughBalance || !agreeToTerms || isSubmitting}
          onClick={handleActivate}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengaktifkan...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Aktifkan Sekarang ({requiredTokens} Token)
            </>
          )}
        </Button>
      </div>
      
      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Info Penting:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Iklan yang sudah diaktifkan tidak dapat dibatalkan</li>
                <li>Setelah masa aktif habis, iklan akan SUSPENDED</li>
                <li>Anda dapat mengaktifkan kembali dengan membayar token</li>
                <li>Chat di Public Marketplace adalah GRATIS</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
