'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice, formatMileage, conditionLabel, conditionColor } from '@/lib/format'
import { Heart, Eye, MapPin, Calendar, Gauge, Settings2 } from 'lucide-react'
import { useState } from 'react'

interface CarListing {
  id: string
  title: string
  slug: string
  brand: { id: string; name: string; slug: string; logo: string; description?: string; totalListings?: number }
  model: { id: string; name: string; slug: string }
  variant?: string
  year: number
  price: number
  originalPrice?: number
  mileage: number
  condition: 'NEW' | 'USED' | 'RECON'
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT'
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'
  bodyType: string
  exteriorColor?: string
  images: string[]
  description: string
  features: string[]
  seller: {
    id: string
    name: string
    avatar: string
    phone: string
    isVerified: boolean
    rating: number
    totalSales: number
    city: string
  }
  city: string
  inspectionScore?: number
  isFeatured: boolean
  isNegotiable?: boolean
  views: number
  createdAt: string
}

interface CarCardProps {
  listing: CarListing
  onClick?: (listing: CarListing) => void
  className?: string
}

export function CarCard({ listing, onClick, className }: CarCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const imageSrc = listing.images[0] || '/placeholder-car.png'

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden gap-0 rounded-xl border p-0 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl',
        className
      )}
      onClick={() => onClick?.(listing)}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageSrc}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Condition Badge */}
        <Badge
          className={cn(
            'absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5',
            conditionColor(listing.condition)
          )}
        >
          {conditionLabel(listing.condition)}
        </Badge>

        {/* Inspection Score */}
        {listing.inspectionScore && (
          <div className="absolute top-2 right-2 flex items-center justify-center size-9 rounded-full bg-background/90 backdrop-blur-sm border text-xs font-bold">
            {listing.inspectionScore}
          </div>
        )}

        {/* Bottom gradient overlay for icons */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className={cn(
              'flex items-center justify-center size-8 rounded-full backdrop-blur-sm transition-colors',
              isLiked
                ? 'bg-red-500/90 text-white'
                : 'bg-background/80 text-foreground hover:bg-background'
            )}
          >
            <Heart className={cn('size-4', isLiked && 'fill-current')} />
          </button>
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-foreground">
            <Eye className="size-3.5" />
            <span>{listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {/* Title & Price */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">
            {listing.title}
          </h3>
          <p className="text-base font-bold text-primary leading-tight">
            {formatPrice(listing.price)}
          </p>
          {listing.originalPrice && listing.originalPrice > listing.price && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(listing.originalPrice)}
            </p>
          )}
        </div>

        {/* City */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="line-clamp-1">{listing.city}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="size-3 shrink-0" />
            <span>{listing.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="size-3 shrink-0" />
            <span className="line-clamp-1">{formatMileage(listing.mileage)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings2 className="size-3 shrink-0" />
            <span className="line-clamp-1">
              {listing.transmission === 'AUTOMATIC' ? 'AT' : listing.transmission === 'MANUAL' ? 'MT' : 'CVT'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
