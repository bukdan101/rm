'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Car,
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Filter,
  Download,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
  Shield,
  XCircle,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

interface Listing {
  id: string
  listing_number: string
  title: string
  status: string
  price_cash: number
  year: number
  mileage: number | null
  city: string | null
  province: string | null
  created_at: string
  user_id: string
  brand_id: number
  model_id: number
  marketplace_type: string | null
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  brands: { name: string } | null
  car_models: { name: string } | null
  profiles: { full_name: string; email: string } | null
  car_images: { image_url: string; is_primary: boolean }[] | null
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Terjual' },
  { value: 'banned', label: 'Dibanned' },
  { value: 'expired', label: 'Kedaluwarsa' },
]

const MARKETPLACE_TYPE_OPTIONS = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'marketplace_umum', label: 'Marketplace Umum' },
  { value: 'dealer_marketplace', label: 'Dealer Marketplace' },
  { value: 'chat_platform', label: 'Chat Platform' },
]

export default function AdminListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [marketplaceFilter, setMarketplaceFilter] = useState('all')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  // Dialogs
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [banReason, setBanReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        admin: 'true', // Flag untuk admin mode - ambil semua listing
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (marketplaceFilter !== 'all') {
        params.append('marketplace_type', marketplaceFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/listings?${params}`)
      const data = await res.json()

      if (data.success) {
        // Transform data to match expected format
        const transformedListings = (data.listings || []).map((listing: any) => ({
          ...listing,
          brands: listing.brands || null,
          car_models: listing.car_models || null,
          profiles: listing.profiles || null,
          car_images: listing.car_images || [],
        }))
        setListings(transformedListings)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchListings()
    }
  }, [user, page, statusFilter, marketplaceFilter])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchListings()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // View listing detail
  const viewDetail = (listing: Listing) => {
    setSelectedListing(listing)
    setDetailDialogOpen(true)
  }

  // Open ban dialog
  const openBanDialog = (listing: Listing) => {
    setSelectedListing(listing)
    setBanReason(listing.ban_reason || '')
    setBanDialogOpen(true)
  }

  // Ban/Unban listing
  const handleBanListing = async (ban: boolean) => {
    if (!selectedListing) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/listings/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedListing.id,
          is_banned: ban,
          ban_reason: ban ? banReason : null,
        })
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        setListings(prev => prev.map(l => 
          l.id === selectedListing.id 
            ? { 
                ...l, 
                is_banned: ban, 
                ban_reason: ban ? banReason : null,
                banned_at: ban ? new Date().toISOString() : null,
                status: ban ? 'banned' : 'active'
              } 
            : l
        ))
        setBanDialogOpen(false)
        setDetailDialogOpen(false)
      } else {
        alert(data.error || 'Gagal mengubah status listing')
      }
    } catch (error) {
      console.error('Error banning listing:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  // Get status badge
  const getStatusBadge = (listing: Listing) => {
    if (listing.is_banned) {
      return <Badge className="bg-red-100 text-red-700">Dibanned</Badge>
    }

    const badges: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-700', label: 'Aktif' },
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
      sold: { color: 'bg-blue-100 text-blue-700', label: 'Terjual' },
      expired: { color: 'bg-gray-100 text-gray-700', label: 'Kedaluwarsa' },
    }

    const badge = badges[listing.status] || badges.pending
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  // Get marketplace type badge
  const getMarketplaceBadge = (type: string | null) => {
    if (!type) return '-'
    
    const badges: Record<string, { color: string; label: string }> = {
      marketplace_umum: { color: 'bg-emerald-100 text-emerald-700', label: 'Marketplace' },
      dealer_marketplace: { color: 'bg-purple-100 text-purple-700', label: 'Dealer' },
      chat_platform: { color: 'bg-blue-100 text-blue-700', label: 'Chat' },
    }

    const badge = badges[type]
    return badge ? <Badge className={badge.color}>{badge.label}</Badge> : '-'
  }

  // Stats
  const stats = {
    total: totalCount,
    active: listings.filter(l => l.status === 'active' && !l.is_banned).length,
    banned: listings.filter(l => l.is_banned).length,
    pending: listings.filter(l => l.status === 'pending').length,
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="h-6 w-6 text-purple-500" />
            Manajemen Listing
          </h1>
          <p className="text-muted-foreground">
            Kelola semua listing mobil di platform
          </p>
        </div>
        <Button variant="outline" onClick={fetchListings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Car className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dibanned</p>
                <p className="text-2xl font-bold">{stats.banned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari judul, nomor listing, atau seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Marketplace Filter */}
            <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipe Marketplace" />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACE_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Tidak ada listing</h3>
              <p className="text-gray-500">
                Tidak ditemukan listing yang sesuai dengan filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow 
                      key={listing.id}
                      className={cn(listing.is_banned && 'bg-red-50')}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                            {listing.car_images?.[0]?.image_url ? (
                              <img 
                                src={listing.car_images[0].image_url} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {listing.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {listing.brands?.name} {listing.car_models?.name} • {listing.year}
                            </p>
                            {listing.is_banned && (
                              <p className="text-xs text-red-600 mt-1">
                                <Ban className="h-3 w-3 inline mr-1" />
                                {listing.ban_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {listing.profiles?.full_name || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {listing.profiles?.email || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-green-600">
                          {formatPrice(listing.price_cash)}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(listing)}
                      </TableCell>
                      <TableCell>
                        {getMarketplaceBadge(listing.marketplace_type)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(listing.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewDetail(listing)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            {listing.is_banned ? (
                              <DropdownMenuItem 
                                onClick={() => handleBanListing(false)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Unban Listing
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => openBanDialog(listing)}
                                className="text-red-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban Listing
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount)} dari {totalCount} listing
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Listing</DialogTitle>
            <DialogDescription>
              Informasi lengkap listing mobil
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              {/* Image & Title */}
              <div className="flex gap-4">
                <div className="w-32 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {selectedListing.car_images?.[0]?.image_url ? (
                    <img 
                      src={selectedListing.car_images[0].image_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedListing.title}</h3>
                  <p className="text-gray-500">
                    {selectedListing.brands?.name} {selectedListing.car_models?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedListing)}
                    {getMarketplaceBadge(selectedListing.marketplace_type)}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Harga</p>
                  <p className="font-bold text-green-600">{formatPrice(selectedListing.price_cash)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Tahun</p>
                  <p className="font-semibold">{selectedListing.year}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Kilometer</p>
                  <p className="font-semibold">{selectedListing.mileage?.toLocaleString() || '-'} km</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="font-semibold">{selectedListing.city || '-'}, {selectedListing.province || ''}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="font-semibold">{selectedListing.profiles?.full_name || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Dibuat</p>
                  <p className="font-semibold">
                    {new Date(selectedListing.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Ban Info */}
              {selectedListing.is_banned && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    Listing Dibanned
                  </div>
                  <p className="text-sm text-red-600">
                    <strong>Alasan:</strong> {selectedListing.ban_reason || 'Tidak ada alasan'}
                  </p>
                  {selectedListing.banned_at && (
                    <p className="text-xs text-red-500 mt-1">
                      Dibanned pada: {new Date(selectedListing.banned_at).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedListing.is_banned ? (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleBanListing(false)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Unban Listing
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openBanDialog(selectedListing)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban Listing
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Ban Listing
            </DialogTitle>
            <DialogDescription>
              Listing akan disembunyikan dari marketplace. Seller akan menerima notifikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Alasan Ban *</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Contoh: Harga tidak wajar, foto tidak sesuai, deskripsi menipu..."
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Alasan akan dikirim ke seller sebagai notifikasi
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setBanDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleBanListing(true)}
                disabled={!banReason.trim() || submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Ban Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
