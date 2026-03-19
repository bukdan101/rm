'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageCircle,
  Store,
  ChatBubble,
  CheckCircle,
  Coins,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTokenSettings } from '@/hooks/useTokenSettings'

// Marketplace types according to workflow
export type MarketplaceType = 'marketplace_umum' | 'dealer_marketplace' | 'chat_platform'

export interface MarketplaceOption {
  id: MarketplaceType
  name: string
  description: string
  tokenCost: number
  rupiahValue: number
  icon: React.ElementType
  features: string[]
  duration: string
  badge?: string
  badgeColor?: string
  color: string
  bgColor: string
}

interface MarketplaceSelectionProps {
  value: MarketplaceType
  onChange: (value: MarketplaceType) => void
  userBalance: number
  userRole?: string
  disabled?: boolean
  showTokenWarning?: boolean
  onBuyTokens?: () => void
}

// Icon mapping
const MARKETPLACE_ICONS: Record<MarketplaceType, React.ElementType> = {
  marketplace_umum: MessageCircle,
  dealer_marketplace: Store,
  chat_platform: ChatBubble
}

// Feature definitions
const MARKETPLACE_FEATURES: Record<MarketplaceType, string[]> = {
  marketplace_umum: [
    'Nomor WhatsApp tampil di listing',
    'Negosiasi langsung via WhatsApp',
    'Tampil di marketplace publik',
    'Dilihat semua pembeli'
  ],
  dealer_marketplace: [
    'Inspeksi 160 titik WAJIB',
    'Bidding dari dealer terverifikasi',
    'Escrow untuk keamanan',
    'Transaksi terdokumentasi'
  ],
  chat_platform: [
    'Chat in-app terdokumentasi',
    'Privasi nomor HP terjaga',
    'Escrow opsional (1.5% fee)',
    'Mediasi jika ada sengketa'
  ]
}

// Duration definitions
const MARKETPLACE_DURATION: Record<MarketplaceType, string> = {
  marketplace_umum: '30 hari',
  dealer_marketplace: '7 hari bidding',
  chat_platform: '30 hari'
}

// Badge definitions
const MARKETPLACE_BADGES: Record<MarketplaceType, { text: string; color: string } | null> = {
  marketplace_umum: null,
  dealer_marketplace: { text: 'Premium', color: 'bg-amber-500' },
  chat_platform: { text: 'Recommended', color: 'bg-purple-500' }
}

// Helper to build options from settings
function buildOptions(getTokenCost: (key: string) => number, getRupiahValue: (tokens: number) => number): MarketplaceOption[] {
  const marketplaceKeys: MarketplaceType[] = ['marketplace_umum', 'dealer_marketplace', 'chat_platform']
  
  return marketplaceKeys.map(key => {
    const tokenCost = getTokenCost(key)
    const badge = MARKETPLACE_BADGES[key]
    
    return {
      id: key,
      name: key === 'marketplace_umum' 
        ? 'Marketplace Umum' 
        : key === 'dealer_marketplace' 
          ? 'Dealer Marketplace' 
          : 'Chat Platform',
      description: key === 'marketplace_umum' 
        ? 'Jual via WhatsApp - Kontak langsung dengan pembeli'
        : key === 'dealer_marketplace'
          ? 'Sistem Bidding - Jual ke dealer terverifikasi'
          : 'Tawar via Chat - Terdokumentasi dengan escrow opsional',
      tokenCost,
      rupiahValue: getRupiahValue(tokenCost),
      icon: MARKETPLACE_ICONS[key],
      features: MARKETPLACE_FEATURES[key],
      duration: MARKETPLACE_DURATION[key],
      badge: badge?.text,
      badgeColor: badge?.color,
      color: key === 'marketplace_umum' 
        ? 'text-green-600' 
        : key === 'dealer_marketplace' 
          ? 'text-amber-600' 
          : 'text-purple-600',
      bgColor: key === 'marketplace_umum' 
        ? 'bg-green-50 border-green-200' 
        : key === 'dealer_marketplace' 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-purple-50 border-purple-200'
    }
  })
}

export function MarketplaceSelection({
  value,
  onChange,
  userBalance,
  userRole = 'buyer',
  disabled = false,
  showTokenWarning = true,
  onBuyTokens
}: MarketplaceSelectionProps) {
  const { settings, getTokenCost, getRupiahValue, loading: settingsLoading } = useTokenSettings()
  
  // Memoized options derived from settings
  const options = buildOptions(getTokenCost, getRupiahValue)

  const selectedOption = options.find(opt => opt.id === value)
  const hasEnoughBalance = userBalance >= (selectedOption?.tokenCost || 0)

  if (settingsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
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

  return (
    <div className="space-y-4">
      {/* Token Balance Warning */}
      {showTokenWarning && !hasEnoughBalance && selectedOption && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Token Tidak Mencukupi</p>
                <p className="text-sm text-amber-700 mt-1">
                  Anda memerlukan <strong>{selectedOption.tokenCost} token</strong> (Rp {selectedOption.rupiahValue.toLocaleString('id-ID')}), 
                  tapi saldo Anda hanya <strong>{userBalance} token</strong>.
                </p>
                {onBuyTokens && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={onBuyTokens}
                  >
                    <Coins className="w-4 h-4 mr-1" />
                    Beli Token
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Cards */}
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as MarketplaceType)}
        disabled={disabled}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.id
          const canAfford = userBalance >= option.tokenCost

          return (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={cn(
                "cursor-pointer",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all h-full",
                  isSelected && "border-2 border-purple-500 ring-2 ring-purple-200",
                  !canAfford && !disabled && "opacity-60",
                  disabled && "opacity-50"
                )}
              >
                {/* Badge */}
                {option.badge && (
                  <div className={cn(
                    "absolute top-2 right-2",
                    option.badgeColor || "bg-gray-500"
                  )}>
                    <Badge className="text-white text-[10px]">
                      {option.badge}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="sr-only"
                    disabled={disabled || !canAfford}
                  />

                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? cn(option.bgColor, option.color) : "bg-gray-100 text-gray-500"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{option.name}</h4>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Token Cost */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b">
                    <div>
                      <span className="text-xs text-gray-500">Biaya</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className={cn(
                          "font-bold",
                          canAfford ? "text-gray-900" : "text-red-500"
                        )}>
                          {option.tokenCost} Token
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Nilai</span>
                      <p className="text-xs font-medium text-gray-700">
                        Rp {option.rupiahValue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Durasi: {option.duration}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1">
                    {option.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Label>
          )
        })}
      </RadioGroup>

      {/* Selected Summary */}
      {selectedOption && (
        <Card className="bg-gray-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Biaya</p>
                <p className="text-xs text-gray-500">
                  {selectedOption.name} - {selectedOption.duration}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-lg">{selectedOption.tokenCost}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Rp {selectedOption.rupiahValue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs">
              <span className="text-gray-500">Saldo Anda:</span>
              <span className={cn(
                "font-medium",
                userBalance >= selectedOption.tokenCost ? "text-green-600" : "text-red-600"
              )}>
                {userBalance} token (Rp {getRupiahValue(userBalance).toLocaleString('id-ID')})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Compact version for inline use
export function MarketplaceSelectionCompact({
  value,
  onChange,
  userBalance,
  disabled = false
}: {
  value: MarketplaceType
  onChange: (value: MarketplaceType) => void
  userBalance: number
  disabled?: boolean
}) {
  const { getTokenCost } = useTokenSettings()
  
  const options: { id: MarketplaceType; name: string }[] = [
    { id: 'marketplace_umum', name: 'Marketplace Umum' },
    { id: 'dealer_marketplace', name: 'Dealer Marketplace' },
    { id: 'chat_platform', name: 'Chat Platform' }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option.id
        const tokenCost = getTokenCost(option.id)
        const canAfford = userBalance >= tokenCost

        return (
          <Button
            key={option.id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "relative",
              isSelected && "bg-gradient-to-r from-purple-500 to-blue-500",
              !canAfford && "opacity-50"
            )}
            onClick={() => onChange(option.id)}
            disabled={disabled || !canAfford}
          >
            <Coins className="w-3 h-3 mr-1" />
            {option.name} ({tokenCost})
          </Button>
        )
      })}
    </div>
  )
}

// Token cost constants for backward compatibility (use hook instead)
export const TOKEN_COSTS = {
  MARKETPLACE_UMUM: 3,
  DEALER_MARKETPLACE: 5,
  CHAT_PLATFORM: 4,
  INSPECTION_160: 10,
  FEATURED: 5,
  EXTEND_LISTING: 2,
  EXTEND_DEALER: 2
} as const
