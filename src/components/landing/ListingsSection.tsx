'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CarListing } from '@/types/marketplace'
import { formatPrice, formatMileage, getFuelLabel, getTransmissionLabel } from '@/lib/utils-marketplace'
import { MapPin, Gauge, Fuel, Settings, Shield, Heart, Zap, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ListingsSectionProps {
  title?: string
  listings?: CarListing[]
  filterParam?: string
  showViewAll?: boolean
  highlightedIds?: string[]
  icon?: React.ReactNode
  badge?: string
}

export function ListingsSection({
  title = 'Listing Terbaru',
  listings = [],
  filterParam = '',
  showViewAll = true,
  highlightedIds = [],
  icon,
  badge
}: ListingsSectionProps) {
  
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlistIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  if (!listings || listings.length === 0) {
    return null
  }

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || showViewAll) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {badge && (
                <Badge variant="warning" className="text-[10px]">
                  {badge}
                </Badge>
              )}
            </div>
            {showViewAll && (
              <Link 
                href={`/marketplace${filterParam ? `?${filterParam}` : ''}`}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {listings.map((listing) => {
            const isHighlighted = highlightedIds.includes(listing.id)
            const isWishlisted = wishlistIds.includes(listing.id)
            const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                                 listing.images?.[0]?.image_url ||
                                 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop'
            
            return (
              <Link key={listing.id} href={`/?id=${listing.id}`}>
                <Card className={cn(
                  "overflow-hidden transition-all duration-300 group cursor-pointer h-full border-0 shadow-md",
                  // Hover effects
                  "hover:shadow-[0_20px_50px_-12px_rgba(147,51,234,0.25)]",
                  "hover:-translate-y-1",
                  isHighlighted && "ring-2 ring-amber-400 ring-offset-2"
                )}>
                  {/* Image Container */}
                  <div className="relative h-28 sm:h-36 bg-gray-100 overflow-hidden">
                    <Image
                      src={primaryImage}
                      alt={`${listing.brand?.name} ${listing.model?.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Year Badge - Bottom Left */}
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                      {listing.year}
                    </div>

                    {/* Inspection Badge - Bottom Right */}
                    {listing.inspection && (
                      <div className={cn(
                        "absolute bottom-2 right-2 p-1.5 rounded-full",
                        "bg-gradient-to-r from-emerald-500 to-green-500",
                        "shadow-[0_4px_14px_0_rgba(16,185,129,0.5)]"
                      )}>
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => toggleWishlist(e, listing.id)}
                      className={cn(
                        "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isWishlisted 
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_4px_14px_0_rgba(244,63,94,0.5)] scale-100" 
                          : "bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500 hover:scale-110"
                      )}
                    >
                      <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-white")} />
                    </button>

                    {/* Premium/Highlighted Badge */}
                    {isHighlighted && (
                      <div className="absolute top-2 left-2">
                        <Badge 
                          variant="premium"
                          className="text-[10px] px-2"
                        >
                          <Zap className="w-2.5 h-2.5 mr-0.5" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-2.5 sm:p-3">
                    {/* Title */}
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {listing.brand?.name} {listing.model?.name}
                    </h3>

                    {/* Price with Gradient */}
                    <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1.5">
                      {formatPrice(listing.price_cash)}
                    </p>

                    {/* Specs with Icons */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mb-1.5">
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/50 transition-colors">
                        <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500" />
                        <span className="font-medium">{formatMileage(listing.mileage)}</span>
                      </span>
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Fuel className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                        <span className="font-medium">{getFuelLabel(listing.fuel)}</span>
                      </span>
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/50 transition-colors">
                        <Settings className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500" />
                        <span className="font-medium">{getTransmissionLabel(listing.transmission)}</span>
                      </span>
                    </div>

                    {/* Location */}
                    {listing.city && (
                      <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-2.5 h-2.5 text-purple-400" />
                        <span className="line-clamp-1 font-medium">{listing.city}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
