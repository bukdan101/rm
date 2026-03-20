'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CarListing } from '@/types/marketplace'
import { formatPrice, formatMileage, getFuelLabel, getTransmissionLabel } from '@/lib/utils-marketplace'
import { MapPin, Gauge, Fuel, Settings, Shield, Heart, Zap, Star, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumListingsSectionProps {
  listings?: CarListing[]
  highlightedIds?: string[]
}

export function PremiumListingsSection({ listings = [], highlightedIds = [] }: PremiumListingsSectionProps) {
  if (!listings || listings.length === 0) {
    return null
  }

  return (
    <section className="py-4 bg-gradient-to-b from-amber-50/50 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Premium Listings</h2>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">
              Boosted
            </Badge>
          </div>
          <Link 
            href="/marketplace?premium=true"
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Scroll on Mobile */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4">
          {listings.slice(0, 4).map((listing) => {
            const isHighlighted = highlightedIds.includes(listing.id)
            const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                                 listing.images?.[0]?.image_url ||
                                 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop'
            
            return (
              <Link 
                key={listing.id} 
                href={`/?id=${listing.id}`}
                className="shrink-0 w-[280px] lg:w-auto"
              >
                <Card className={cn(
                  "overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full",
                  "ring-2 ring-amber-300 bg-gradient-to-b from-white to-amber-50/30"
                )}>
                  {/* Image */}
                  <div className="relative h-40 bg-gray-100">
                    <Image
                      src={primaryImage}
                      alt={`${listing.brand?.name} ${listing.model?.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 280px, 25vw"
                    />
                    
                    {/* Premium Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs shadow-lg">
                        <Zap className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>

                    {/* Inspection Badge */}
                    {listing.inspection && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span className="text-[10px] font-medium text-green-700">Inspected</span>
                      </div>
                    )}

                    {/* Heart */}
                    <button className="absolute bottom-2 right-2">
                      <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                        <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </div>
                    </button>
                  </div>

                  <CardContent className="p-3">
                    {/* Title */}
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">
                      {listing.brand?.name} {listing.model?.name}
                    </h3>

                    {/* Price */}
                    <p className="text-lg font-bold text-purple-600 mb-2">
                      {formatPrice(listing.price_cash)}
                    </p>

                    {/* Specs */}
                    <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-0.5">
                        <Gauge className="w-3 h-3" />
                        {formatMileage(listing.mileage)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Fuel className="w-3 h-3" />
                        {getFuelLabel(listing.fuel)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Settings className="w-3 h-3" />
                        {getTransmissionLabel(listing.transmission)}
                      </span>
                    </div>

                    {/* Location */}
                    {listing.city && (
                      <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.city}</span>
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
