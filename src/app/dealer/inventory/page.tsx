'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Search,
  Filter,
  Grid,
  List,
  Package,
  DollarSign,
} from 'lucide-react'

interface InventoryItem {
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
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}Jt`
  return formatCurrency(amount)
}

function InventoryCard({ item, onAction }: { 
  item: InventoryItem
  onAction: (action: string, id: string) => void 
}) {
  const primaryImage = item.images?.find(img => img.is_primary)?.image_url || 
                       item.images?.[0]?.image_url ||
                       '/placeholder-car.jpg'
  
  const daysLeft = item.expired_at 
    ? Math.max(0, Math.ceil((new Date(item.expired_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const dealerDaysLeft = item.dealer_marketplace_expires_at
    ? Math.max(0, Math.ceil((new Date(item.dealer_marketplace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const publicDaysLeft = item.public_marketplace_expires_at
    ? Math.max(0, Math.ceil((new Date(item.public_marketplace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img 
          src={primaryImage} 
          alt={item.title || 'Car listing'}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-car.jpg'
          }}
        />
        <Badge className={`absolute top-2 left-2 ${statusColors[item.status] || statusColors.draft}`}>
          {statusLabels[item.status] || item.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/listings/${item.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Iklan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/listing/${item.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Lihat Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('boost', item.id)}>
              <Zap className="mr-2 h-4 w-4" />
              Boost Iklan
            </DropdownMenuItem>
            {item.status === 'suspended' && (
              <DropdownMenuItem onClick={() => onAction('reactivate', item.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reaktifkan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onAction('delete', item.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-1">
            {item.brand?.name} {item.model?.name} {item.year}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatShortCurrency(item.price_cash || 0)}
          </p>
          
          {/* Marketplace Badges */}
          <div className="flex flex-wrap gap-1">
            {item.dealer_marketplace_active && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                <Zap className="h-3 w-3 mr-1" />
                Dealer {dealerDaysLeft}h
              </Badge>
            )}
            {item.public_marketplace_active && (
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
              {item.view_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {item.favorite_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {item.inquiry_count || 0}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {item.status === 'suspended' ? (
              <Button className="flex-1" variant="default" onClick={() => onAction('reactivate', item.id)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reaktifkan
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/dashboard/listings/${item.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/listing/${item.id}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => onAction('boost', item.id)}>
                  <Zap className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DealerInventoryPage() {
  const { user, profile } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch('/api/my-listings')
        const data = await res.json()
        if (data.success) {
          setInventory(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  const handleAction = async (action: string, id: string) => {
    console.log(`Action: ${action} on item ${id}`)
    // TODO: Implement actions
  }

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true
    if (filter === 'active') return item.status === 'active'
    if (filter === 'sold') return item.status === 'sold'
    if (filter === 'dealer') return item.dealer_marketplace_active
    if (filter === 'public') return item.public_marketplace_active
    if (filter === 'suspended') return item.status === 'suspended'
    return true
  }).filter(item => 
    searchQuery === '' || 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const stats = {
    total: inventory.length,
    active: inventory.filter(i => i.status === 'active').length,
    sold: inventory.filter(i => i.status === 'sold').length,
    dealer: inventory.filter(i => i.dealer_marketplace_active).length,
    public: inventory.filter(i => i.public_marketplace_active).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-500" />
            Inventori Dealer
          </h1>
          <p className="text-muted-foreground">
            Kelola semua mobil di inventori dealer Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dealer/inventory/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Mobil
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/30">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="text-sm text-muted-foreground">Aktif</p>
        </Card>
        <Card className="p-4 text-center bg-blue-50 dark:bg-blue-950/30">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sold}</p>
          <p className="text-sm text-muted-foreground">Terjual</p>
        </Card>
        <Card className="p-4 text-center bg-purple-50 dark:bg-purple-950/30">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.dealer}</p>
          <p className="text-sm text-muted-foreground">Dealer Market</p>
        </Card>
        <Card className="p-4 text-center bg-pink-50 dark:bg-pink-950/30">
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.public}</p>
          <p className="text-sm text-muted-foreground">Public Market</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari mobil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua ({stats.total})</SelectItem>
            <SelectItem value="active">Aktif ({stats.active})</SelectItem>
            <SelectItem value="sold">Terjual ({stats.sold})</SelectItem>
            <SelectItem value="dealer">Dealer Market ({stats.dealer})</SelectItem>
            <SelectItem value="public">Public Market ({stats.public})</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
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
      ) : filteredInventory.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInventory.map((item) => (
            <InventoryCard 
              key={item.id} 
              item={item}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">
              {searchQuery ? 'Tidak ada hasil' : 'Inventori kosong'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Coba kata kunci lain'
                : 'Tambahkan mobil pertama Anda ke inventori dealer'
              }
            </p>
            {!searchQuery && (
              <Link href="/dealer/inventory/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Mobil
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
