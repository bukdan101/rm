'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  MessageCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  amount: number
  status: string
  createdAt: string
  isBuyer: boolean
  listing?: {
    id: string
    title: string
    slug: string
    price: number
    image?: string
  }
  buyer?: {
    id: string
    name: string
    email: string
  }
  seller?: {
    id: string
    name: string
    email: string
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle },
    processing: { label: 'Diproses', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: Truck },
    completed: { label: 'Selesai', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600 border-red-200', icon: XCircle },
    refunded: { label: 'Dikembalikan', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: Package },
  }
  return configs[status] || configs.pending
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all')

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const res = await fetch('/api/orders?limit=20')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'buyer') return order.isBuyer
    return !order.isBuyer
  })

  const orderCounts = {
    all: orders.length,
    buyer: orders.filter(o => o.isBuyer).length,
    seller: orders.filter(o => !o.isBuyer).length,
  }

  return (
    <DashboardLayout title="Pesanan" description="Kelola semua pesanan Anda">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dibatalkan</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semua Pesanan</CardTitle>
              <CardDescription>Daftar transaksi jual beli Anda</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Semua ({orderCounts.all})</TabsTrigger>
                <TabsTrigger value="buyer">Pembeli ({orderCounts.buyer})</TabsTrigger>
                <TabsTrigger value="seller">Penjual ({orderCounts.seller})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada pesanan</p>
              <p className="text-sm mt-1">Pesanan Anda akan muncul di sini</p>
              <Button className="mt-4" onClick={() => router.push('/')}>
                Jelajahi Mobil
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    {/* Image */}
                    <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {order.listing?.image ? (
                        <img
                          src={order.listing.image}
                          alt={order.listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {order.listing?.title || 'Produk'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderNumber} • {order.isBuyer ? 'Anda sebagai Pembeli' : 'Anda sebagai Penjual'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale }) : ''}
                      </p>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatCurrency(order.amount)}</p>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/orders/${order.id}`)
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        router.push('/dashboard/messages')
                      }}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
