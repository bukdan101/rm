'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CarCard } from './CarCard'
import { 
  Package, Car, TrendingUp, Filter, Grid, List, 
  ChevronLeft, ChevronRight, Eye, Heart, MapPin
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface UserListing {
  id: string
  title: string
  slug?: string | null
  price: number | null
  priceType?: string
  condition?: string
  city: string
  province?: string
  imageUrl: string
  viewCount?: number
  favoriteCount?: number
  isFeatured?: boolean
  createdAt: string
  category?: string
  status: string
  year?: number
  mileage?: number
  brand?: string
  model?: string
}

interface UserListingsProps {
  listings: UserListing[]
  activeCount: number
  totalCount: number
  showPagination?: boolean
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'mileage-low' | 'mileage-high' | 'year-new'
type ViewMode = 'grid' | 'list'

// Empty state component
function EmptyState({ message, subMessage }: { message: string; subMessage: string }) {
  return (
    <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardContent className="py-16 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
          <Car className="h-10 w-10 text-blue-500" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
      </CardContent>
    </Card>
  )
}

// Listing card component
function ListingItem({ listing, viewMode }: { listing: UserListing; viewMode: ViewMode }) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Hubungi'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <Link href={`/mobil/${listing.slug || listing.id}`} className="flex">
          {/* Image */}
          <div className="w-48 h-36 relative flex-shrink-0">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Featured
              </Badge>
            )}
            {listing.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge className="bg-gray-800 text-white">Terjual</Badge>
              </div>
            )}
          </div>
          
          {/* Content */}
          <CardContent className="flex-1 p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {listing.category || `${listing.brand || ''} ${listing.model || ''}`}
                    </p>
                  </div>
                  {listing.condition && (
                    <Badge variant={listing.condition === 'baru' ? 'default' : 'secondary'}>
                      {listing.condition === 'baru' ? 'Baru' : 'Bekas'}
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {formatPrice(listing.price)}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {listing.year && <span>Tahun {listing.year}</span>}
                  {listing.mileage && <span>{listing.mileage.toLocaleString()} km</span>}
                  {listing.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.city}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {listing.viewCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {listing.favoriteCount || 0}
                </span>
                <span className="ml-auto text-xs">
                  {new Date(listing.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <Link href={`/mobil/${listing.slug || listing.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              Featured
            </Badge>
          )}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-gray-800 text-white text-lg px-4 py-1">Terjual</Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                {listing.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {listing.category || `${listing.brand || ''} ${listing.model || ''}`}
              </p>
            </div>
          </div>
          
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
            {formatPrice(listing.price)}
          </p>
          
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            {listing.year && (
              <Badge variant="outline" className="text-xs">
                {listing.year}
              </Badge>
            )}
            {listing.mileage !== undefined && listing.mileage !== null && (
              <Badge variant="outline" className="text-xs">
                {listing.mileage.toLocaleString()} km
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.viewCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {listing.favoriteCount || 0}
              </span>
            </div>
            {listing.city && (
              <span className="flex items-center gap-1 truncate max-w-[100px]">
                <MapPin className="w-3 h-3" />
                {listing.city}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Listings grid component
function ListingGrid({ items, viewMode }: { items: UserListing[]; viewMode: ViewMode }) {
  if (items.length === 0) {
    return <EmptyState message="Belum ada mobil" subMessage="Mobil akan muncul di sini setelah ditambahkan" />
  }

  return (
    <div className={cn(
      "gap-4",
      viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "flex flex-col"
    )}>
      {items.map((listing) => (
        <ListingItem key={listing.id} listing={listing} viewMode={viewMode} />
      ))}
    </div>
  )
}

// Sort function
function sortListings(list: UserListing[], sortBy: SortOption): UserListing[] {
  const sorted = [...list]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'mileage-low':
      return sorted.sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
    case 'mileage-high':
      return sorted.sort((a, b) => (b.mileage || 0) - (a.mileage || 0))
    case 'year-new':
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
    default:
      return sorted
  }
}

export function UserListings({
  listings,
  activeCount,
  totalCount,
  showPagination = false
}: UserListingsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filter and sort listings
  const { activeListings, soldListings, sortedActive, sortedSold, sortedAll } = useMemo(() => {
    const active = listings.filter(l => l.status === 'active' || l.status === 'available')
    const sold = listings.filter(l => l.status === 'sold')

    return {
      activeListings: active,
      soldListings: sold,
      sortedActive: sortListings(active, sortBy),
      sortedSold: sortListings(sold, sortBy),
      sortedAll: sortListings(listings, sortBy)
    }
  }, [listings, sortBy])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Daftar Mobil
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} total mobil • {activeCount} tersedia
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="price-low">Harga Terendah</SelectItem>
              <SelectItem value="price-high">Harga Tertinggi</SelectItem>
              <SelectItem value="mileage-low">KM Terendah</SelectItem>
              <SelectItem value="mileage-high">KM Tertinggi</SelectItem>
              <SelectItem value="year-new">Tahun Terbaru</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="active" className="relative">
            <Car className="w-4 h-4 mr-2" />
            Tersedia
            <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {activeCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Terjual
            <Badge variant="secondary" className="ml-2">
              {soldListings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">
            <Package className="w-4 h-4 mr-2" />
            Semua
            <Badge variant="outline" className="ml-2">
              {totalCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <ListingGrid items={sortedActive} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="sold" className="mt-6">
          <ListingGrid items={sortedSold} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <ListingGrid items={sortedAll} viewMode={viewMode} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserListings
