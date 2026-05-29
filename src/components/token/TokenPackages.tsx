'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Check, Zap, Crown, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTokenSettings } from '@/hooks/useTokenSettings'

// Token packages (prices are fixed, but display uses token value from DB)
const DEFAULT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 10,
    price: 100000,
    bonus: 0,
    popular: false,
    features: ['Cocok untuk pemula', '2-3 listing mobil']
  },
  {
    id: 'basic',
    name: 'Basic',
    tokens: 50,
    price: 500000,
    bonus: 5,
    popular: false,
    features: ['Hemat 5 token bonus', '10-15 listing mobil', 'Support prioritas']
  },
  {
    id: 'premium',
    name: 'Premium',
    tokens: 100,
    price: 1000000,
    bonus: 15,
    popular: true,
    features: ['Hemat 15 token bonus', '25-30 listing mobil', 'Support prioritas', 'Badge Premium']
  },
  {
    id: 'dealer',
    name: 'Dealer',
    tokens: 500,
    price: 5000000,
    bonus: 100,
    popular: false,
    features: ['Hemat 100 token bonus', 'Unlimited listing', 'Dedicated support', 'Badge Dealer Pro', 'API Access']
  }
]

interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number
  bonus: number
  popular?: boolean
  features: string[]
}

interface TokenPackagesProps {
  onSelectPackage?: (pkg: TokenPackage) => void
  selectedPackageId?: string
  compact?: boolean
}

export function TokenPackages({ onSelectPackage, selectedPackageId, compact = false }: TokenPackagesProps) {
  const [packages, setPackages] = useState<TokenPackage[]>(DEFAULT_PACKAGES)
  const [loading, setLoading] = useState(true)
  const { settings, getRupiahValue, loading: settingsLoading } = useTokenSettings()

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch('/api/credits/packages')
        const data = await res.json()
        if (data.packages && data.packages.length > 0) {
          // Map database packages to our format
          const mappedPackages = data.packages.map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            tokens: pkg.tokens_amount || pkg.tokens,
            price: pkg.price,
            bonus: pkg.bonus_tokens || pkg.bonus || 0,
            popular: pkg.is_popular || false,
            features: pkg.features || []
          }))
          setPackages(mappedPackages)
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
        // Use default packages on error
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [])

  if (loading || settingsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-4">
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0: return Coins
      case 1: return TrendingUp
      case 2: return Star
      case 3: return Crown
      default: return Coins
    }
  }

  return (
    <div className={cn(
      "grid gap-4",
      compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-4"
    )}>
      {packages.map((pkg, index) => {
        const Icon = getPackageIcon(index)
        const isSelected = selectedPackageId === pkg.id
        const totalTokens = pkg.tokens + pkg.bonus
        const savings = pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.tokens) * 100) : 0
        const tokenValue = settings.token_value_rupiah || 10000

        return (
          <Card
            key={pkg.id}
            className={cn(
              "relative overflow-hidden transition-all cursor-pointer hover:shadow-lg",
              pkg.popular && "border-purple-500 ring-2 ring-purple-200",
              isSelected && "border-green-500 ring-2 ring-green-200",
              compact && "hover:scale-105"
            )}
            onClick={() => onSelectPackage?.(pkg)}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs text-center py-1 font-medium">
                <Zap className="w-3 h-3 inline mr-1" />
                Paling Populer
              </div>
            )}

            {/* Bonus Badge */}
            {pkg.bonus > 0 && !pkg.popular && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white text-[10px]">
                  +{pkg.bonus} Bonus
                </Badge>
              </div>
            )}

            <CardContent className={cn("p-4", pkg.popular && "pt-8")}>
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                pkg.popular 
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                  : "bg-amber-100 text-amber-600"
              )}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Package Name */}
              <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
              
              {/* Tokens */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-amber-600">{totalTokens}</span>
                <span className="text-sm text-gray-500">token</span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className="text-lg font-semibold text-gray-900">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </p>
                {pkg.bonus > 0 && (
                  <p className="text-xs text-green-600">
                    Hemat {savings}% dengan bonus
                  </p>
                )}
              </div>

              {/* Price per token */}
              <p className="text-xs text-gray-400 mb-3">
                @ Rp {Math.round(pkg.price / totalTokens).toLocaleString('id-ID')}/token
              </p>

              {/* Features */}
              {!compact && (
                <ul className="space-y-1 mb-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <Check className="w-3 h-3 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Select Button */}
              <Button
                className={cn(
                  "w-full",
                  pkg.popular 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    : "bg-amber-500 hover:bg-amber-600"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPackage?.(pkg)
                }}
              >
                <Coins className="w-4 h-4 mr-1" />
                Pilih {pkg.name}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Token cost breakdown component - uses settings from DB
export function TokenCostBreakdown() {
  const { settings, rawSettings, loading } = useTokenSettings()
  
  // Build costs list from raw settings
  const costs = rawSettings
    .filter(s => s.category !== 'config' && s.is_active)
    .map(s => ({
      name: s.name,
      tokens: s.tokens,
      rupiah: s.tokens * (settings.token_value_rupiah || 10000)
    }))

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Daftar Biaya Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          Daftar Biaya Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {costs.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-gray-700">{item.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold">{item.tokens}</span>
                </div>
                <span className="text-sm text-gray-500 w-24 text-right">
                  Rp {item.rupiah.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          1 Token = Rp {(settings.token_value_rupiah || 10000).toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          * Biaya dapat berubah, dikelola oleh Admin
        </p>
      </CardContent>
    </Card>
  )
}
