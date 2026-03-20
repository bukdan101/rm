'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import { 
  Store, 
  ChevronRight,
  MapPin,
  Eye,
  Heart,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

interface RelatedListing {
  id: string
  title: string
  price_cash: number
  year: number
  mileage: number
  city: string
  province: string
  view_count: number
  favorite_count: number
  condition: string
  images: Array<{ image_url: string; is_primary: boolean }>
  brand?: { name: string }
}

interface RelatedProductsProps {
  categoryId: string
  currentListingId: string
  categoryName: string
}

// Mock data for demo
const mockRelatedListings: RelatedListing[] = [
  {
    id: 'rel1',
    title: 'Toyota Avanza 2022 G M/T',
    price_cash: 215000000,
    year: 2022,
    mileage: 25000,
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    view_count: 245,
    favorite_count: 12,
    condition: 'like_new',
    images: [{ image_url: '/placeholder-car.jpg', is_primary: true }],
    brand: { name: 'Toyota' }
  },
  {
    id: 'rel2',
    title: 'Honda Mobilio 2021 E CVT',
    price_cash: 195000000,
    year: 2021,
    mileage: 35000,
    city: 'Bandung',
    province: 'Jawa Barat',
    view_count: 189,
    favorite_count: 8,
    condition: 'good',
    images: [{ image_url: '/placeholder-car.jpg', is_primary: true }],
    brand: { name: 'Honda' }
  },
  {
    id: 'rel3',
    title: 'Suzuki Ertiga 2022 GX M/T',
    price_cash: 225000000,
    year: 2022,
    mileage: 18000,
    city: 'Surabaya',
    province: 'Jawa Timur',
    view_count: 312,
    favorite_count: 15,
    condition: 'new',
    images: [{ image_url: '/placeholder-car.jpg', is_primary: true }],
    brand: { name: 'Suzuki' }
  },
  {
    id: 'rel4',
    title: 'Mitsubishi Xpander 2021 Exceed',
    price_cash: 265000000,
    year: 2021,
    mileage: 42000,
    city: 'Tangerang',
    province: 'Banten',
    view_count: 156,
    favorite_count: 7,
    condition: 'good',
    images: [{ image_url: '/placeholder-car.jpg', is_primary: true }],
    brand: { name: 'Mitsubishi' }
  },
  {
    id: 'rel5',
    title: 'Daihatsu Xenia 2022 R Deluxe',
    price_cash: 185000000,
    year: 2022,
    mileage: 22000,
    city: 'Bekasi',
    province: 'Jawa Barat',
    view_count: 198,
    favorite_count: 9,
    condition: 'like_new',
    images: [{ image_url: '/placeholder-car.jpg', is_primary: true }],
    brand: { name: 'Daihatsu' }
  }
]

export function RelatedProducts({ categoryId, currentListingId, categoryName }: RelatedProductsProps) {
  const [listings, setListings] = useState<RelatedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // In real implementation, fetch from API with categoryId
      setListings(mockRelatedListings)
      setLoading(false)
    }

    fetchRelated()
  }, [categoryId, currentListingId])

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('related-products-scroll')
    if (container) {
      const scrollAmount = 320
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[280px] shrink-0">
                <Skeleton className="aspect-[16/10] rounded-lg mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (listings.length === 0) {
    return null
  }

  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-500',
    like_new: 'bg-blue-500',
    good: 'bg-amber-500',
    fair: 'bg-gray-500'
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Iklan Serupa di {categoryName}
          </CardTitle>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          id="related-products-scroll"
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="w-[280px] shrink-0 snap-start group"
            >
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted mb-3">
                <Image
                  src={listing.images?.[0]?.image_url || '/placeholder-car.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Condition Badge */}
                <Badge 
                  className={cn(
                    "absolute top-2 left-2 text-white border-0",
                    conditionColors[listing.condition] || 'bg-gray-500'
                  )}
                >
                  {listing.condition === 'new' ? 'Baru' : 
                   listing.condition === 'like_new' ? 'Spt. Baru' : 
                   listing.condition === 'good' ? 'Bagus' : 'Cukup'}
                </Badge>
                
                {/* Stats Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    <Eye className="h-3 w-3" />
                    {listing.view_count}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    <Heart className="h-3 w-3" />
                    {listing.favorite_count}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1.5">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(listing.price_cash, { compact: true })}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{listing.city}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{listing.year}</span>
                  <span>•</span>
                  <span>{listing.mileage?.toLocaleString()} km</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t">
          <Link 
            href={`/marketplace?category=${categoryId}`}
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
          >
            Lihat semua di {categoryName}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
