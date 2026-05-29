'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Gauge,
  Heart,
  Sparkles,
  Shield,
  ImageOff
} from 'lucide-react'

interface RelatedListing {
  id: string
  slug: string
  title: string
  price_cash: number
  year: number
  mileage: number
  city: string
  province: string
  condition: string
  is_featured: boolean
  view_count: number
  created_at: string
  brand?: { name: string; slug: string }
  model?: { name: string }
  images?: Array<{ image_url: string; is_primary: boolean }>
  inspection?: { overall_grade: string } | null
}

interface RelatedProductsProps {
  categoryId?: string
  brandId?: string
  currentListingId: string
  categoryName?: string
  brandName?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatMileage(km: number) {
  if (km >= 1000) {
    return (km / 1000).toFixed(0) + 'rb km'
  }
  return km + ' km'
}

function ListingCard({ listing }: { listing: RelatedListing }) {
  const [isHovered, setIsHovered] = useState(false)
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || listing.images?.[0]?.image_url

  return (
    <Link href={`/listing/${listing.slug || listing.id}`}>
      <Card
        className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && "scale-110"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlays */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {listing.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-0.5" />
                Premium
              </Badge>
            )}
            {listing.inspection && (
              <Badge className="bg-green-500 text-white border-0 text-xs">
                <Shield className="h-3 w-3 mr-0.5" />
                {listing.inspection.overall_grade}
              </Badge>
            )}
          </div>

          {/* Heart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              // Toggle favorite
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Price Tag */}
          <div className="absolute bottom-2 left-2 right-2">
            <p className={cn(
              "font-bold text-white drop-shadow-lg transition-all duration-300",
              listing.is_featured ? "text-lg" : "text-base"
            )}>
              {formatPrice(listing.price_cash)}
            </p>
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{listing.year}</span>
            <span>•</span>
            <Gauge className="h-3 w-3" />
            <span>{formatMileage(listing.mileage)}</span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{listing.city || listing.province || 'Indonesia'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function RelatedProducts({
  categoryId,
  brandId,
  currentListingId,
  categoryName = 'Mobil Serupa',
  brandName
}: RelatedProductsProps) {
  const [listings, setListings] = useState<RelatedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchRelatedListings()
  }, [categoryId, brandId, currentListingId])

  const fetchRelatedListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (brandId) params.append('brand_id', brandId)
      params.append('limit', '8')
      params.append('exclude', currentListingId)

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.listings) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch related listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('related-products-scroll')
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setScrollPosition(container.scrollLeft)
    }
  }

  // Mock data if no listings fetched
  const mockListings: RelatedListing[] = listings.length === 0 ? [
    {
      id: '1',
      slug: 'toyota-avanza-2023',
      title: 'Toyota Avanza 2023',
      price_cash: 250000000,
      year: 2023,
      mileage: 15000,
      city: 'Jakarta',
      province: 'DKI Jakarta',
      condition: 'bekas',
      is_featured: true,
      view_count: 150,
      created_at: new Date().toISOString(),
      brand: { name: 'Toyota', slug: 'toyota' },
      model: { name: 'Avanza' },
      images: [],
      inspection: null,
    },
    {
      id: '2',
      slug: 'honda-jazz-2022',
      title: 'Honda Jazz RS 2022',
      price_cash: 280000000,
      year: 2022,
      mileage: 25000,
      city: 'Bandung',
      province: 'Jawa Barat',
      condition: 'bekas',
      is_featured: false,
      view_count: 85,
      created_at: new Date().toISOString(),
      brand: { name: 'Honda', slug: 'honda' },
      model: { name: 'Jazz' },
      images: [],
      inspection: { overall_grade: 'A' },
    },
    {
      id: '3',
      slug: 'mitsubishi-xpander-2023',
      title: 'Mitsubishi Xpander 2023',
      price_cash: 320000000,
      year: 2023,
      mileage: 10000,
      city: 'Surabaya',
      province: 'Jawa Timur',
      condition: 'bekas',
      is_featured: true,
      view_count: 200,
      created_at: new Date().toISOString(),
      brand: { name: 'Mitsubishi', slug: 'mitsubishi' },
      model: { name: 'Xpander' },
      images: [],
      inspection: { overall_grade: 'A+' },
    },
  ] : listings

  const displayListings = listings.length > 0 ? listings : mockListings

  if (loading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (displayListings.length === 0) return null

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {categoryName || brandName || 'Mobil Serupa'}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          id="related-products-scroll"
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayListings.map((listing) => (
            <div key={listing.id} className="snap-start shrink-0 w-[200px] sm:w-[240px]">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 text-center">
          <Link href={`/marketplace${brandId ? `?brand=${brandId}` : ''}`}>
            <Button variant="outline" className="gap-2">
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
