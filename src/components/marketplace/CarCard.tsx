'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CarListing } from '@/types/marketplace'
import {
  formatPrice,
  formatMileage,
  getConditionLabel,
  getConditionColor,
  getTransactionTypeLabel,
  getFuelLabel,
  getTransmissionLabel,
  timeAgo,
} from '@/lib/utils-marketplace'
import { MapPin, Gauge, Fuel, Settings, Calendar, Shield, CheckCircle, AlertTriangle, Heart, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface CarCardProps {
  listing: CarListing
  highlighted?: boolean
  showWishlist?: boolean
}

export function CarCard({ listing, highlighted = false, showWishlist = true }: CarCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                       listing.images?.[0]?.image_url ||
                       'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop'

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  // Map condition to badge variant
  const getConditionVariant = (condition: string): "success" | "info" | "warning" | "secondary" => {
    const variants: Record<string, "success" | "info" | "warning" | "secondary"> = {
      'new': 'success',
      'like_new': 'info',
      'good': 'secondary',
      'fair': 'warning',
    }
    return variants[condition] || 'secondary'
  }

  // Transaction type styling
  const transactionStyles: Record<string, string> = {
    'sale': 'from-blue-600 via-purple-600 to-purple-700 shadow-[0_4px_14px_0_rgba(147,51,234,0.5)]',
    'credit': 'from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_4px_14px_0_rgba(59,130,246,0.5)]',
    'lease': 'from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_4px_14px_0_rgba(16,185,129,0.5)]',
    'rent': 'from-amber-500 via-orange-500 to-red-500 shadow-[0_4px_14px_0_rgba(245,158,11,0.5)]',
  }

  return (
    <Link href={`/?id=${listing.id}`}>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 h-full group cursor-pointer",
        "border-0 shadow-md",
        // Hover effects with gradient shadow
        "hover:shadow-[0_20px_50px_-12px_rgba(147,51,234,0.3)]",
        "hover:-translate-y-1",
        highlighted && "ring-2 ring-amber-400 ring-offset-2"
      )}>
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
          <Image
            src={primaryImage}
            alt={`${listing.brand?.name} ${listing.model?.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Transaction Type Badge - Top Left */}
          <div className={cn(
            "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white",
            "bg-gradient-to-r",
            transactionStyles[listing.transaction_type] || transactionStyles['sale'],
            "shadow-lg hover:shadow-xl transition-shadow"
          )}>
            {getTransactionTypeLabel(listing.transaction_type)}
          </div>

          {/* Condition Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={getConditionVariant(listing.condition)}
              className="shadow-lg"
            >
              {listing.condition === 'new' && <Sparkles className="w-3 h-3 mr-1" />}
              {getConditionLabel(listing.condition)}
            </Badge>
          </div>

          {/* Wishlist Button - Top Right (on hover) */}
          {showWishlist && (
            <button
              onClick={handleWishlistClick}
              className={cn(
                "absolute top-12 right-3 rounded-full p-2 transition-all duration-300",
                "shadow-lg",
                isWishlisted 
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white opacity-100 shadow-[0_4px_14px_0_rgba(244,63,94,0.5)]" 
                  : "bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110"
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-white")} />
            </button>
          )}

          {/* Year Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {listing.year}
          </div>

          {/* Inspection Badge - Bottom Right */}
          {listing.inspection && (
            <div className={cn(
              "absolute bottom-3 right-3 px-2 py-1 rounded-full flex items-center gap-1.5",
              "backdrop-blur-sm shadow-lg",
              listing.inspection.risk_level === 'low' 
                ? "bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white" 
                : "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
            )}>
              {listing.inspection.risk_level === 'low' ? (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Inspected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Review</span>
                </>
              )}
            </div>
          )}

          {/* Highlighted/Premium Badge */}
          {highlighted && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <Badge 
                variant="premium"
                className="text-[10px]"
              >
                <Zap className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {listing.brand?.name} {listing.model?.name}
          </h3>
          
          {listing.variant?.name && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{listing.variant.name}</p>
          )}

          {/* Price with Gradient Styling */}
          <div className="mb-3">
            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {formatPrice(listing.price_cash)}
            </p>
            {listing.price_credit && (
              <p className="text-xs text-gray-500 mt-0.5">
                Kredit: <span className="font-semibold text-emerald-600">{formatPrice(listing.price_credit)}</span>
              </p>
            )}
          </div>

          {/* Specs Grid with Icons */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
              <Gauge className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">{formatMileage(listing.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
              <Fuel className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">{getFuelLabel(listing.fuel)}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
              <Settings className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-medium">{getTransmissionLabel(listing.transmission)}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">{listing.year}</span>
            </div>
          </div>

          {/* Location */}
          {listing.city && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 p-1.5 rounded-lg bg-gray-50">
              <MapPin className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">{listing.city}{listing.province ? `, ${listing.province}` : ''}</span>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-400 font-medium">
              {timeAgo(listing.created_at)}
            </span>
            {listing.inspection && listing.inspection.passed_points && (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-gray-600">
                  {listing.inspection.passed_points}/{listing.inspection.total_points} passed
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
