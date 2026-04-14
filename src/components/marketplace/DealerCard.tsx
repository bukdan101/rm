'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Star, ShieldCheck, MapPin, Building2 } from 'lucide-react'

interface Dealer {
  id: string
  name: { id: string; name: string; slug: string; logo: string; description?: string; totalListings?: number }
  address: string
  phone: string
  email?: string
  website?: string
  rating: number
  totalReviews: number
  totalListings: number
  openHours: string
  description?: string
  verified: boolean
  featuredListings: Array<{
    id: string
    title: string
    slug: string
    year: number
    price: number
    mileage: number
    condition: string
    transmission: string
    fuelType: string
    bodyType: string
    exteriorColor?: string
    images: string[]
    brand: { id: string; name: string; slug: string; logo: string }
    model: { id: string; name: string; slug: string }
    seller: { id: string; name: string; avatar: string; phone: string; isVerified: boolean; rating: number; totalSales: number; city: string }
    city: string
    inspectionScore?: number
    isFeatured: boolean
    isNegotiable?: boolean
    views: number
    createdAt: string
    description: string
    features: string[]
    variant?: string
  }>
  createdAt: string
}

interface DealerCardProps {
  dealer: Dealer
  onClick?: (dealer: Dealer) => void
  className?: string
}

function getInitialColor(name: string): string {
  const colors = [
    'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function DealerCard({ dealer, onClick, className }: DealerCardProps) {
  const colorClass = getInitialColor(dealer.name.name)

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden gap-0 p-0 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={() => onClick?.(dealer)}
    >
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Logo / Initial */}
          <div className="shrink-0">
            {dealer.name.logo ? (
              <Image
                src={dealer.name.logo}
                alt={dealer.name.name}
                width={48}
                height={48}
                className="rounded-lg object-cover border bg-muted"
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center size-12 rounded-lg text-lg font-bold',
                  colorClass
                )}
              >
                {dealer.name.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {dealer.name.name}
              </h3>
              {dealer.verified && (
                <ShieldCheck className="size-4 text-primary shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="line-clamp-1">{dealer.address}</span>
            </div>
          </div>
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3.5',
                    i < Math.floor(dealer.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({dealer.totalReviews} ulasan)
            </span>
          </div>

          <Badge variant="secondary" className="text-[10px] gap-1">
            <Building2 className="size-3" />
            {dealer.totalListings} unit
          </Badge>
        </div>

        {/* Button */}
        <Button variant="outline" className="w-full text-sm mt-1">
          Lihat Dealer
        </Button>
      </CardContent>
    </Card>
  )
}
