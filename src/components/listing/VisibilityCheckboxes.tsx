'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Globe, Store, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VisibilityType = 'public' | 'dealer_marketplace' | 'both'

export interface VisibilityCheckboxesProps {
  value: VisibilityType
  onChange: (value: VisibilityType) => void
  disabled?: boolean
  showPrices?: boolean
  publicPrice?: number
  dealerPrice?: number
}

export function VisibilityCheckboxes({
  value,
  onChange,
  disabled = false,
  showPrices = true,
  publicPrice = 3,  // Default from token_settings: marketplace_umum
  dealerPrice = 5   // Default from token_settings: dealer_marketplace
}: VisibilityCheckboxesProps) {
  // Parse current state into checkboxes
  const isPublicSelected = value === 'public' || value === 'both'
  const isDealerSelected = value === 'dealer_marketplace' || value === 'both'

  // Handle checkbox changes
  const handlePublicChange = (checked: boolean) => {
    if (checked && isDealerSelected) {
      onChange('both')
    } else if (checked) {
      onChange('public')
    } else if (isDealerSelected) {
      onChange('dealer_marketplace')
    } else {
      onChange('public') // Default to at least one selected
    }
  }

  const handleDealerChange = (checked: boolean) => {
    if (checked && isPublicSelected) {
      onChange('both')
    } else if (checked) {
      onChange('dealer_marketplace')
    } else if (isPublicSelected) {
      onChange('public')
    } else {
      onChange('dealer_marketplace') // Default to at least one selected
    }
  }

  // Calculate total tokens
  const totalTokens = (isPublicSelected ? publicPrice : 0) + (isDealerSelected ? dealerPrice : 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">📢</span>
          Publikasikan di:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Iklan Umum Option */}
        <div
          className={cn(
            "relative rounded-lg border-2 transition-all cursor-pointer",
            isPublicSelected
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-gray-200 hover:border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && handlePublicChange(!isPublicSelected)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="visibility-public"
                checked={isPublicSelected}
                onCheckedChange={(checked) => handlePublicChange(checked as boolean)}
                disabled={disabled}
                className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="visibility-public"
                    className="font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Iklan Umum
                  </Label>
                  {isPublicSelected && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-500" />
                    Dilihat semua pengunjung
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-500" />
                    WhatsApp ditampilkan
                  </li>
                </ul>
              </div>
              {showPrices && (
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg text-emerald-600">{publicPrice}</p>
                  <p className="text-xs text-muted-foreground">token</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dealer Marketplace Option */}
        <div
          className={cn(
            "relative rounded-lg border-2 transition-all cursor-pointer",
            isDealerSelected
              ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
              : "border-gray-200 hover:border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && handleDealerChange(!isDealerSelected)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="visibility-dealer"
                checked={isDealerSelected}
                onCheckedChange={(checked) => handleDealerChange(checked as boolean)}
                disabled={disabled}
                className="mt-0.5 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="visibility-dealer"
                    className="font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Store className="h-4 w-4 text-purple-600" />
                    Dealer Marketplace
                  </Label>
                  {isDealerSelected && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-purple-500" />
                    Khusus dealer terverifikasi
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-purple-500" />
                    Sistem penawaran harga
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-purple-500" />
                    WhatsApp disembunyikan
                  </li>
                </ul>
              </div>
              {showPrices && (
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg text-purple-600">{dealerPrice}</p>
                  <p className="text-xs text-muted-foreground">token</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ringkasan Pilihan</p>
              <p className="text-xs text-muted-foreground">
                {value === 'both' && 'Tampil di Iklan Umum + Dealer Marketplace'}
                {value === 'public' && 'Hanya tampil di Iklan Umum'}
                {value === 'dealer_marketplace' && 'Hanya tampil di Dealer Marketplace'}
              </p>
            </div>
            {showPrices && (
              <div className="text-right">
                <p className="font-bold text-xl text-primary">{totalTokens}</p>
                <p className="text-xs text-muted-foreground">total token</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to convert visibility to form fields
export function visibilityToFormFields(visibility: VisibilityType) {
  return {
    marketplace_public: visibility === 'public' || visibility === 'both',
    marketplace_dealer: visibility === 'dealer_marketplace' || visibility === 'both'
  }
}

// Helper function to convert form fields to visibility
export function formFieldsToVisibility(marketplacePublic: boolean, marketplaceDealer: boolean): VisibilityType {
  if (marketplacePublic && marketplaceDealer) return 'both'
  if (marketplacePublic) return 'public'
  return 'dealer_marketplace'
}
