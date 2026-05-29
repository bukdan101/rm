'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Coins, AlertTriangle, Shield } from 'lucide-react'
import Link from 'next/link'
import { 
  VisibilityCheckboxes, 
  VisibilityType 
} from '@/components/listing/VisibilityCheckboxes'

interface ListingStepMarketplaceProps {
  marketplaceType: MarketplaceType
  onMarketplaceChange: (type: MarketplaceType) => void
  userBalance: number
  userRole?: string
  kycStatus?: string
}

// Legacy type alias for backward compatibility
export type MarketplaceType = VisibilityType

// Token costs (can be fetched from admin settings later)
const PUBLIC_TOKEN_COST = 10
const DEALER_TOKEN_COST = 15

export function ListingStepMarketplace({
  marketplaceType,
  onMarketplaceChange,
  userBalance,
  userRole = 'buyer',
  kycStatus = 'not_submitted'
}: ListingStepMarketplaceProps) {
  const needsKyc = kycStatus !== 'approved'
  
  // Calculate total tokens
  const isPublicSelected = marketplaceType === 'public' || marketplaceType === 'both'
  const isDealerSelected = marketplaceType === 'dealer_marketplace' || marketplaceType === 'both'
  const requiredTokens = (isPublicSelected ? PUBLIC_TOKEN_COST : 0) + (isDealerSelected ? DEALER_TOKEN_COST : 0)
  const hasEnoughBalance = userBalance >= requiredTokens

  return (
    <div className="space-y-4">
      {/* KYC Warning */}
      {needsKyc && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Verifikasi KYC Diperlukan</p>
                <p className="text-sm text-amber-700 mt-1">
                  Anda perlu menyelesaikan verifikasi KYC sebelum dapat mempublikasikan iklan.
                </p>
                <Link href="/dashboard/kyc">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Verifikasi Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visibility Checkboxes */}
      <VisibilityCheckboxes
        value={marketplaceType}
        onChange={onMarketplaceChange}
        publicPrice={PUBLIC_TOKEN_COST}
        dealerPrice={DEALER_TOKEN_COST}
      />

      {/* Token Info */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">Saldo Token Anda</p>
              <p className="text-sm text-gray-500">
                {userBalance} token tersedia
              </p>
            </div>
            <Link href="/credits">
              <Button variant="outline" size="sm">
                Beli Token
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Insufficient Balance Warning */}
      {!hasEnoughBalance && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Saldo Tidak Mencukupi</p>
                <p className="text-sm text-red-700 mt-1">
                  Anda memerlukan {requiredTokens} token untuk opsi ini, 
                  tapi saldo Anda hanya {userBalance} token.
                </p>
                <Link href="/credits">
                  <Button
                    size="sm"
                    className="mt-2 bg-red-600 hover:bg-red-700"
                  >
                    <Coins className="w-4 h-4 mr-1" />
                    Beli Token
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What Happens Next */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <h4 className="font-medium text-blue-800 mb-2">Selanjutnya...</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Review data iklan Anda</li>
            <li>2. Konfirmasi dan publikasikan</li>
            <li>3. Token akan dipotong sesuai pilihan marketplace</li>
            <li>4. Iklan aktif selama 30 hari (Iklan Umum) atau 7 hari (Dealer Marketplace)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
