'use client'

import { useState, useEffect, useCallback } from 'react'
import { CarCard } from '@/components/marketplace/CarCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Grid3X3, List } from 'lucide-react'
import { services } from '@/lib/api/services'
import type { CarListingCard, BodyType, FuelType, TransmissionType, VehicleCondition } from '@/types/marketplace'

interface Props {
  initialBrand?: string
  initialBodyType?: string
}

const BODY_TYPES: { value: BodyType; label: string; icon: string }[] = [
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'mpv', label: 'MPV', icon: '🚐' },
  { value: 'sedan', label: 'Sedan', icon: '🚗' },
  { value: 'hatchback', label: 'Hatchback', icon: '🚘' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
  { value: 'van', label: 'Van', icon: '🚚' },
  { value: 'coupe', label: 'Coupe', icon: '🏎️' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'mileage_low', label: 'Kilometer Terendah' },
]

export function MarketplaceBrowser({ initialBrand, initialBodyType }: Props) {
  const [listings, setListings] = useState<CarListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || '')
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | ''>(initialBodyType as BodyType || '')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000000])
  const [selectedCondition, setSelectedCondition] = useState<VehicleCondition | ''>('')
  const [selectedFuel, setSelectedFuel] = useState<FuelType | ''>('')
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | ''>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [brands, setBrands] = useState<{ id: string; name: string; logo_url: string | null }[]>([])

  const limit = 12

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load brands
  useEffect(() => {
    let cancelled = false
    services.listing.getBrands().then(data => {
      if (!cancelled) setBrands(data)
    })
    return () => { cancelled = true }
  }, [])

  // Load listings
  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Record<string, unknown> = {}
      if (debouncedSearch) filters.search = debouncedSearch
      if (selectedBrand) filters.brand_id = selectedBrand
      if (selectedBodyType) filters.body_type = selectedBodyType
      if (selectedCondition) filters.condition = selectedCondition
      if (selectedFuel) filters.fuel = selectedFuel
      if (selectedTransmission) filters.transmission = selectedTransmission
      if (priceRange[0] > 0) filters.price_min = priceRange[0]
      if (priceRange[1] < 2000000000) filters.price_max = priceRange[1]

      const result = await services.listing.getListings(
        filters as any, page, limit
      )
      setListings(result.data)
      setTotalResults(result.pagination?.total || result.data.length)
    } catch (err) {
      console.error('Error fetching listings:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedBrand, selectedBodyType, selectedCondition, selectedFuel, selectedTransmission, priceRange, page])

  useEffect(() => {
    let cancelled = false
    fetchListings().then(() => {
      if (cancelled) return
    })
    return () => { cancelled = true }
  }, [fetchListings])

  const totalPages = Math.ceil(totalResults / limit)
  const activeFiltersCount = [
    selectedBrand, selectedBodyType, selectedCondition, selectedFuel, selectedTransmission,
    priceRange[0] > 0, priceRange[1] < 2000000000,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setSelectedBrand('')
    setSelectedBodyType('')
    setSelectedCondition('')
    setSelectedFuel('')
    setSelectedTransmission('')
    setPriceRange([0, 2000000000])
    setPage(1)
  }

  const priceLabels: Record<string, string> = {
    '0': 'Semua Harga',
    '100000000': '< 100 Juta',
    '200000000': '100 - 200 Juta',
    '300000000': '200 - 300 Juta',
    '500000000': '300 - 500 Juta',
    '750000000': '500 - 750 Juta',
    '1000000000': '750 Jt - 1 M',
    '2000000000': '> 1 Miliar',
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari mobil, brand, atau lokasi..."
            className="pl-10 h-11"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          className="h-11 gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeFiltersCount > 0 && (
            <Badge className="bg-purple-500 text-white ml-1">{activeFiltersCount}</Badge>
          )}
        </Button>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-11">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Filter</h3>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-purple-600 hover:underline">
                Reset semua
              </button>
            )}
          </div>

          {/* Body Type */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Tipe Body</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedBodyType(''); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  !selectedBodyType ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {BODY_TYPES.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => { setSelectedBodyType(selectedBodyType === bt.value ? '' : bt.value); setPage(1) }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedBodyType === bt.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {bt.icon} {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Brand</p>
            <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Brand</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Harga</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(priceLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    const v = parseInt(value)
                    if (v === 0) setPriceRange([0, 2000000000])
                    else if (v === 100000000) setPriceRange([0, 100000000])
                    else if (v === 200000000) setPriceRange([100000000, 200000000])
                    else if (v === 300000000) setPriceRange([200000000, 300000000])
                    else if (v === 500000000) setPriceRange([300000000, 500000000])
                    else if (v === 750000000) setPriceRange([500000000, 750000000])
                    else if (v === 1000000000) setPriceRange([750000000, 1000000000])
                    else setPriceRange([1000000000, 2000000000])
                    setPage(1)
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs border transition ${
                    (priceRange[0] === parseInt(value) || priceRange[1] === parseInt(value) || (parseInt(value) === 0 && priceRange[0] === 0 && priceRange[1] >= 2000000000))
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition, Fuel, Transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Kondisi</p>
              <Select value={selectedCondition} onValueChange={(v) => { setSelectedCondition(v === 'all' ? '' : v as VehicleCondition); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="baru">Baru</SelectItem>
                  <SelectItem value="bekas">Bekas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Bahan Bakar</p>
              <Select value={selectedFuel} onValueChange={(v) => { setSelectedFuel(v === 'all' ? '' : v as FuelType); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="bensin">Bensin</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Transmisi</p>
              <Select value={selectedTransmission} onValueChange={(v) => { setSelectedTransmission(v === 'all' ? '' : v as TransmissionType); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="automatic">Otomatis</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedBodyType && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedBodyType('')}>
              {BODY_TYPES.find(b => b.value === selectedBodyType)?.icon} {selectedBodyType} <X className="w-3 h-3" />
            </Badge>
          )}
          {selectedBrand && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedBrand('')}>
              {brands.find(b => b.id === selectedBrand)?.name || selectedBrand} <X className="w-3 h-3" />
            </Badge>
          )}
          {selectedCondition && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCondition('')}>
              {selectedCondition} <X className="w-3 h-3" />
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-purple-600 hover:underline ml-2">
            Hapus semua
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan <strong>{totalResults}</strong> mobil
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4' 
          : 'space-y-3'
        }>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border bg-white">
              <Skeleton className={viewMode === 'grid' ? 'h-36 w-full' : 'h-32 w-48'} />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-semibold text-gray-600">Tidak ada mobil ditemukan</p>
          <p className="text-sm text-muted-foreground mt-1">Coba ubah filter atau kata kunci pencarian</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Reset Filter
          </Button>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'
            : 'space-y-3'
          }>
            {listings.map(listing => (
              <CarCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
