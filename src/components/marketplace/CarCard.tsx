'use client'

import { Heart, MapPin, Star, Gauge, Fuel, Settings2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface CarCardData {
  id: string
  slug?: string
  title: string
  price: number
  year: number
  mileage: number
  city: string
  province?: string
  images: string[]
  isFeatured?: boolean
  isNegotiable?: boolean
  condition?: string
  brand?: { id: string; name: string; slug?: string }
  model?: { id: string; name: string; slug?: string }
  transmission?: string
  fuelType?: string
  seller?: {
    id: string
    name: string
    avatar?: string
    isVerified?: boolean
    rating?: number
    totalReviews?: number
  }
}

interface CarCardProps {
  listing: CarCardData
  className?: string
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatMileage(mileage: number): string {
  if (mileage >= 1000) {
    return `${(mileage / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} rb`
  }
  return `${mileage} km`
}

export function CarCard({ listing, className, onFavorite, isFavorited }: CarCardProps) {
  const imageSrc =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : '/placeholder-car.svg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'group overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg hover:border-emerald-200 cursor-pointer py-0 gap-0',
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/11] overflow-hidden bg-muted">
          <img
            src={imageSrc}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Price Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 border-0 px-2.5 py-1 text-sm font-semibold shadow-md">
              {formatPrice(listing.price)}
            </Badge>
          </div>
          {/* Condition Badge */}
          {listing.condition && (
            <div className="absolute top-2 left-2">
              <Badge
                variant={listing.condition === 'Baru' ? 'default' : 'secondary'}
                className="bg-white/90 text-foreground backdrop-blur-sm border-0"
              >
                {listing.condition}
              </Badge>
            </div>
          )}
          {/* Featured Badge */}
          {listing.isFeatured && (
            <div className="absolute top-2 right-12">
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0">
                Pilihan
              </Badge>
            </div>
          )}
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite?.(listing.id)
            }}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white hover:scale-110"
            aria-label="Favorit"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              )}
            />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">
              {listing.city}{listing.province ? `, ${listing.province}` : ''}
            </span>
          </div>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-1.5">
            {listing.transmission && (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Settings2 className="h-3 w-3" />
                {listing.transmission}
              </div>
            )}
            {listing.fuelType && (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Fuel className="h-3 w-3" />
                {listing.fuelType}
              </div>
            )}
            {listing.mileage > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Gauge className="h-3 w-3" />
                {formatMileage(listing.mileage)}
              </div>
            )}
          </div>

          {/* Seller */}
          {listing.seller && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {listing.seller.avatar ? (
                    <img
                      src={listing.seller.avatar}
                      alt={listing.seller.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {listing.seller.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium truncate">{listing.seller.name}</span>
                    {listing.seller.isVerified && (
                      <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              {listing.seller.rating > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {listing.seller.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
