'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CarCard } from './CarCard'
import { CarListing } from '@/types/marketplace'
import { Package, Car, TrendingUp, Filter, Grid, List } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DealerListingsProps {
  listings: CarListing[]
  totalCount: number
  activeCount: number
  soldCount?: number
  title?: string
  showViewToggle?: boolean
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'mileage-low' | 'mileage-high' | 'year-new'
type ViewMode = 'grid' | 'list'

// Empty state component - defined outside
function EmptyState({ message, subMessage }: { message: string; subMessage: string }) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-16 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
          <Car className="h-10 w-10 text-purple-500" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
      </CardContent>
    </Card>
  )
}

// Listing grid component - defined outside
function ListingGrid({ items, viewMode }: { items: CarListing[]; viewMode: ViewMode }) {
  if (items.length === 0) {
    return <EmptyState message="Belum ada mobil" subMessage="Mobil akan muncul di sini setelah ditambahkan" />
  }

  return (
    <div className={cn(
      "gap-6",
      viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "flex flex-col"
    )}>
      {items.map((listing) => (
        <div key={listing.id} className={cn(viewMode === 'list' && 'w-full')}>
          <CarCard listing={listing} highlighted={listing.is_featured} />
        </div>
      ))}
    </div>
  )
}

// Sort function - defined outside
function sortListings(list: CarListing[], sortBy: SortOption): CarListing[] {
  const sorted = [...list]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'price-low':
      return sorted.sort((a, b) => (a.price_cash || 0) - (b.price_cash || 0))
    case 'price-high':
      return sorted.sort((a, b) => (b.price_cash || 0) - (a.price_cash || 0))
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

export function DealerListings({
  listings,
  totalCount,
  activeCount,
  soldCount = 0,
  title = 'Daftar Mobil',
  showViewToggle = true
}: DealerListingsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Use useMemo for filtered lists
  const { activeListings, soldListings, sortedActive, sortedSold, sortedAll } = useMemo(() => {
    const active = listings.filter(l => l.status === 'active')
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
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
          {showViewToggle && (
            <div className="flex items-center border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'grid'
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "hover:bg-gray-100"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'list'
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "hover:bg-gray-100"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="active" className="relative">
            <Car className="w-4 h-4 mr-2" />
            Tersedia
            <Badge variant="success" className="ml-2 h-5 px-1.5">
              {activeCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Terjual
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {soldCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">
            <Package className="w-4 h-4 mr-2" />
            Semua
            <Badge variant="outline" className="ml-2 h-5 px-1.5">
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

export default DealerListings
