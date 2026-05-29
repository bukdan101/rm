'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useAuth } from '@/hooks/useAuth'
import {
  PlusCircle,
  Car,
  Eye,
  Heart,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Zap,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-finance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Listing {
  id: string
  title: string
  brand: { name: string }
  model: { name: string }
  year: number
  price_cash: number
  status: string
  view_count: number
  favorite_count: number
  inquiry_count: number
  created_at: string
  expired_at: string | null
  images: Array<{ image_url: string; is_primary: boolean }>
  dealer_marketplace_active: boolean
  public_marketplace_active: boolean
  dealer_marketplace_expires_at: string | null
  public_marketplace_expires_at: string | null
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  suspended: 'Suspended',
  sold: 'Terjual',
  draft: 'Draft',
  pending: 'Pending',
  expired: 'Expired',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatShortCurrency(amount: number) {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}Jt`
  }
  return formatCurrency(amount)
}

function ListingCard({ listing, onDelete, onReactivate }: { 
  listing: Listing
  onDelete: (id: string) => void
  onReactivate: (id: string) => void 
}) {
  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url || 
                       listing.images?.[0]?.image_url ||
                       '/placeholder-car.jpg'
  
  const daysLeft = listing.expired_at 
    ? Math.max(0, Math.ceil((new Date(listing.expired_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const dealerDaysLeft = listing.dealer_marketplace_expires_at
    ? Math.max(0, Math.ceil((new Date(listing.dealer_marketplace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const publicDaysLeft = listing.public_marketplace_expires_at
    ? Math.max(0, Math.ceil((new Date(listing.public_marketplace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={primaryImage} 
          alt={listing.title || 'Car listing'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-car.jpg'
          }}
        />
        <Badge className={`absolute top-2 left-2 ${statusColors[listing.status] || statusColors.draft}`}>
          {statusLabels[listing.status] || listing.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/listings/${listing.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Iklan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/listing/${listing.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Lihat Preview
              </Link>
            </DropdownMenuItem>
            {listing.status === 'suspended' && (
              <DropdownMenuItem onClick={() => onReactivate(listing.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reaktifkan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(listing.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-1">
            {listing.brand?.name} {listing.model?.name} {listing.year}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatShortCurrency(listing.price_cash || 0)}
          </p>
          
          {/* Marketplace Badges */}
          <div className="flex flex-wrap gap-1">
            {listing.dealer_marketplace_active && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                <Zap className="h-3 w-3 mr-1" />
                Dealer {dealerDaysLeft}h
              </Badge>
            )}
            {listing.public_marketplace_active && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                <Car className="h-3 w-3 mr-1" />
                Public {publicDaysLeft}h
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.view_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {listing.favorite_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {listing.inquiry_count || 0}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {listing.status === 'suspended' ? (
              <Button className="flex-1" variant="default" onClick={() => onReactivate(listing.id)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reaktifkan (10-20 Token)
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/listing/${listing.id}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyListingsPage() {
  const { user, profile } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/my-listings')
        const data = await res.json()
        if (data.success) {
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true
    if (filter === 'active') return listing.status === 'active'
    if (filter === 'suspended') return listing.status === 'suspended'
    if (filter === 'sold') return listing.status === 'sold'
    if (filter === 'draft') return listing.status === 'draft'
    return true
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/my-listings/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setListings(prev => prev.filter(l => l.id !== deleteId))
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleReactivate = async (id: string) => {
    // TODO: Implement reactivation with token payment
    console.log('Reactivate listing:', id)
  }

  const isVerified = profile?.kyc_status === 'approved' || profile?.role === 'dealer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Iklan Saya</h1>
          <p className="text-muted-foreground">Kelola semua iklan mobil Anda</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="sold">Terjual</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          {isVerified && (
            <Link href="/dashboard/listings/create">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Buat Iklan
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KYC Warning */}
      {!isVerified && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-medium">Verifikasi KYC untuk memasang iklan</p>
              <p className="text-sm text-muted-foreground">Anda belum bisa membuat iklan sebelum verifikasi KYC</p>
            </div>
            <Link href="/dashboard/kyc">
              <Button variant="outline">Verifikasi</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              onDelete={setDeleteId}
              onReactivate={handleReactivate}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Belum ada iklan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all' 
                ? 'Anda belum memiliki iklan. Buat iklan pertama Anda sekarang!'
                : `Tidak ada iklan dengan status "${filterLabels[filter] || filter}"`
              }
            </p>
            {isVerified && (
              <Link href="/dashboard/listings/create">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Buat Iklan Baru
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Iklan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Iklan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const filterLabels: Record<string, string> = {
  all: 'Semua',
  active: 'Aktif',
  suspended: 'Suspended',
  sold: 'Terjual',
  draft: 'Draft',
}
