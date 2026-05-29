'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Store,
  Search,
  SlidersHorizontal,
  MapPin,
  Gauge,
  Calendar,
  Fuel,
  Settings2,
  Heart,
  Eye,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { DealerMarketplaceListing } from '@/types/dealer-marketplace'

interface DealerMarketplaceBrowseProps {
  dealerId: string
}

export function DealerMarketplaceBrowse({ dealerId }: DealerMarketplaceBrowseProps) {
  const router = useRouter()
  
  // State
  const [listings, setListings] = useState<DealerMarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [brandId, setBrandId] = useState('')
  const [minPrice, setMinPrice] = useState<number>()
  const [maxPrice, setMaxPrice] = useState<number>()
  const [yearFrom, setYearFrom] = useState<number>()
  const [yearTo, setYearTo] = useState<number>()
  const [hasInspection, setHasInspection] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Brands for filter
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  
  // Offer modal
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<DealerMarketplaceListing | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [financingAvailable, setFinancingAvailable] = useState(false)
  const [pickupService, setPickupService] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Success dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  
  // Fetch listings
  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('dealer_id', dealerId)
      params.set('page', page.toString())
      params.set('limit', '12')
      params.set('sort_by', sortBy)
      
      if (brandId) params.set('brand_id', brandId)
      if (minPrice) params.set('min_price', minPrice.toString())
      if (maxPrice) params.set('max_price', maxPrice.toString())
      if (yearFrom) params.set('year_from', yearFrom.toString())
      if (yearTo) params.set('year_to', yearTo.toString())
      if (hasInspection !== undefined) params.set('has_inspection', hasInspection.toString())
      
      const res = await fetch(`/api/dealer-marketplace/listings?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setListings(data.listings)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch brands
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/brands')
        const data = await res.json()
        if (data.success) {
          setBrands(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }
    fetchBrands()
  }, [])
  
  // Fetch listings when filters change
  useEffect(() => {
    fetchListings()
  }, [page, sortBy, brandId, hasInspection])
  
  // Toggle favorite
  const toggleFavorite = async (listingId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await fetch(`/api/dealer-marketplace/favorites?dealer_id=${dealerId}&listing_id=${listingId}`, {
          method: 'DELETE'
        })
      } else {
        await fetch('/api/dealer-marketplace/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealer_id: dealerId,
            car_listing_id: listingId
          })
        })
      }
      
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, is_favorite: !isFavorite } : l
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }
  
  // Open offer modal
  const openOfferModal = (listing: DealerMarketplaceListing) => {
    setSelectedListing(listing)
    setOfferPrice(listing.price_cash?.toString() || '')
    setOfferMessage('')
    setFinancingAvailable(false)
    setPickupService(false)
    setOfferModalOpen(true)
  }
  
  // Submit offer
  const submitOffer = async () => {
    if (!selectedListing || !offerPrice) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/dealer-marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: dealerId,
          car_listing_id: selectedListing.id,
          user_id: selectedListing.user_id,
          offer_price: parseInt(offerPrice),
          original_price: selectedListing.price_cash,
          message: offerMessage,
          financing_available: financingAvailable,
          pickup_service: pickupService
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setOfferModalOpen(false)
        setSuccessDialogOpen(true)
      } else {
        alert(data.error || 'Gagal mengirim penawaran')
      }
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert('Terjadi kesalahan saat mengirim penawaran')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Clear filters
  const clearFilters = () => {
    setBrandId('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setYearFrom(undefined)
    setYearTo(undefined)
    setHasInspection(undefined)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-500" />
            Dealer Marketplace
          </h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} mobil tersedia dari user` : 'Mencari listing...'}
          </p>
        </div>
      </div>
      
      {/* Search & Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 flex-1">
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Semua Merek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Merek</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={hasInspection === undefined ? '' : hasInspection ? 'true' : 'false'} onValueChange={(v) => {
                if (v === '') setHasInspection(undefined)
                else setHasInspection(v === 'true')
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Inspeksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua</SelectItem>
                  <SelectItem value="true">Dengan Inspeksi</SelectItem>
                  <SelectItem value="false">Tanpa Inspeksi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="price_asc">Harga Terendah</SelectItem>
                  <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
                  <SelectItem value="mileage_asc">KM Terendah</SelectItem>
                  <SelectItem value="mileage_desc">KM Tertinggi</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-purple-50 border-purple-200' : ''}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter Lainnya
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Harga Minimum</Label>
                <Input
                  type="number"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Rp 0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Harga Maksimum</Label>
                <Input
                  type="number"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Rp 1.000.000.000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Tahun Dari</Label>
                <Input
                  type="number"
                  value={yearFrom || ''}
                  onChange={(e) => setYearFrom(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="2000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Tahun Sampai</Label>
                <Input
                  type="number"
                  value={yearTo || ''}
                  onChange={(e) => setYearTo(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="2024"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-4 flex justify-end gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filter
                </Button>
                <Button onClick={fetchListings}>
                  Terapkan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Listings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : listings.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tidak ada listing ditemukan</h3>
            <p className="text-gray-500 mb-4">
              Belum ada mobil yang dipasarkan ke dealer marketplace dengan filter ini
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative aspect-[16/10] bg-gray-100">
                {listing.primary_image_url ? (
                  <img
                    src={listing.primary_image_url}
                    alt={listing.title || 'Car'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Store className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {listing.has_inspection && (
                    <Badge className="bg-green-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Grade {listing.inspection_grade}
                    </Badge>
                  )}
                  {listing.offer_count && listing.offer_count > 0 && (
                    <Badge variant="secondary">
                      {listing.offer_count} penawaran
                    </Badge>
                  )}
                </div>
                
                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(listing.id, listing.is_favorite || false)}
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    listing.is_favorite ? "fill-red-500 text-red-500" : "text-gray-500"
                  )} />
                </Button>
              </div>
              
              {/* Content */}
              <CardContent className="p-4">
                {/* Title & Price */}
                <div className="mb-2">
                  <h3 className="font-semibold line-clamp-1">
                    {listing.title || `${listing.brand_name} ${listing.model_name} ${listing.year}`}
                  </h3>
                  <p className="text-xl font-bold text-green-600">
                    {formatPrice(listing.price_cash)}
                  </p>
                </div>
                
                {/* Specs */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {listing.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    {listing.mileage?.toLocaleString()} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    {listing.fuel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings2 className="h-3 w-3" />
                    {listing.transmission}
                  </span>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin className="h-3 w-3" />
                  {listing.city}, {listing.province}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/listing/${listing.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => openOfferModal(listing)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Buat Penawaran
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-500">
            Halaman {page} dari {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Offer Modal */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Penawaran</DialogTitle>
            <DialogDescription>
              Kirim penawaran Anda untuk mobil ini
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              {/* Listing Summary */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                  {selectedListing.primary_image_url ? (
                    <img src={selectedListing.primary_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{selectedListing.title}</p>
                  <p className="text-xs text-gray-500">{selectedListing.year} • {selectedListing.mileage?.toLocaleString()} km</p>
                  <p className="text-sm font-semibold text-green-600">{formatPrice(selectedListing.price_cash)}</p>
                </div>
              </div>
              
              {/* Offer Price */}
              <div>
                <Label>Harga Penawaran (Rp) *</Label>
                <Input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Masukkan harga penawaran"
                  className="mt-1"
                  required
                />
                {offerPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(parseInt(offerPrice))}
                  </p>
                )}
              </div>
              
              {/* Message */}
              <div>
                <Label>Pesan</Label>
                <Textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Tambahkan pesan untuk penjual..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              {/* Options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="financing"
                    checked={financingAvailable}
                    onCheckedChange={(checked) => setFinancingAvailable(!!checked)}
                  />
                  <Label htmlFor="financing" className="text-sm cursor-pointer">
                    Financing tersedia
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pickup"
                    checked={pickupService}
                    onCheckedChange={(checked) => setPickupService(!!checked)}
                  />
                  <Label htmlFor="pickup" className="text-sm cursor-pointer">
                    Pickup service
                  </Label>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                Penawaran berlaku selama 72 jam. Penjual dapat menerima, menolak, atau melakukan negosiasi.
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOfferModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  onClick={submitOffer}
                  disabled={!offerPrice || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Penawaran
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              Penawaran Terkirim!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Penawaran Anda telah dikirim ke penjual. Anda akan menerima notifikasi jika penjual merespons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessDialogOpen(false)}>
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
