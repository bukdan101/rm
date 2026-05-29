'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenWidget } from '@/components/dashboard/TokenWidget'
import { useAuth } from '@/hooks/useAuth'
import {
  Car,
  PlusCircle,
  Sparkles,
  MessageSquare,
  Heart,
  Eye,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Star,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Shield,
} from 'lucide-react'

function SimpleBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const barWidth = 100 / data.length
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm transition-all hover:opacity-80"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, trendValue, color, href, subtitle }: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendValue?: string
  color: string
  href?: string
  subtitle?: string
}) {
  const content = (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
      {href && (
        <div className="px-4 pb-3">
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Lihat detail <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        </div>
      )}
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

interface DealerStats {
  totalInventory: number
  activeListings: number
  soldThisMonth: number
  totalViews: number
  totalInquiries: number
  avgRating: number
  totalReviews: number
  monthlyRevenue: number
  dealerMarketplaceListings: number
  publicMarketplaceListings: number
  pendingInquiries: number
  salesData: number[]
}

export default function DealerDashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DealerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dealer/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching dealer stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-500" />
            Dealer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Kelola inventori dan pantau performa penjualan dealer Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dealer/inventory">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Mobil
            </Button>
          </Link>
          <Link href="/dealer/marketplace">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Zap className="h-4 w-4 mr-2" />
              Dealer Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Dealer Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Auto Prima Jakarta</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {stats?.avgRating || 4.8} Rating
                  </Badge>
                  <Badge variant="secondary">
                    {stats?.totalReviews || 156} Ulasan
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Shield className="h-3 w-3 mr-1" />
                    Terverifikasi
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{stats?.totalInventory || 24}</p>
                <p>Total Mobil</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{stats?.soldThisMonth || 8}</p>
                <p>Terjual Bulan Ini</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{stats?.totalViews || 12450}</p>
                <p>Total Views</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Widget */}
      <TokenWidget />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventori"
          value={stats?.totalInventory || 0}
          icon={Car}
          color="from-purple-500 to-purple-600"
          href="/dealer/inventory"
          trend="up"
          trendValue="+3 minggu ini"
        />
        <StatCard
          title="Terjual Bulan Ini"
          value={stats?.soldThisMonth || 0}
          icon={ShoppingCart}
          color="from-emerald-500 to-emerald-600"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Total Views"
          value={((stats?.totalViews || 0) / 1000).toFixed(1) + 'K'}
          icon={Eye}
          color="from-blue-500 to-blue-600"
          href="/dealer/stats"
        />
        <StatCard
          title="Pesan Masuk"
          value={stats?.pendingInquiries || 0}
          icon={MessageSquare}
          color="from-orange-500 to-orange-600"
          href="/dashboard/messages"
        />
      </div>

      {/* Marketplace Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dealer Marketplace Card */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Dealer Marketplace</CardTitle>
                  <CardDescription>Network penjual dealer</CardDescription>
                </div>
              </div>
              <Link href="/dealer/marketplace">
                <Button variant="outline" size="sm">
                  Kelola
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.dealerMarketplaceListings || 12}</p>
                <p className="text-sm text-muted-foreground">Iklan Aktif</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-pink-50 dark:bg-pink-950/30">
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">20 Token</p>
                <p className="text-sm text-muted-foreground">Per Iklan / 7 hari</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Keuntungan:</strong> Akses dealer network, penawaran dari dealer, harga lebih kompetitif
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Public Marketplace Card */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Public Marketplace</CardTitle>
                  <CardDescription>Semua pembeli</CardDescription>
                </div>
              </div>
              <Link href="/dealer/inventory">
                <Button variant="outline" size="sm">
                  Kelola
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.publicMarketplaceListings || 18}</p>
                <p className="text-sm text-muted-foreground">Iklan Aktif</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10 Token</p>
                <p className="text-sm text-muted-foreground">Per Iklan / 30 hari</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Keuntungan:</strong> Chat GRATIS, tampil di pencarian publik, dashboard statistik
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Penjualan Bulanan</CardTitle>
              <CardDescription>Jumlah mobil terjual per bulan</CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% YoY
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={stats?.salesData || [3, 5, 4, 8, 6, 9, 7, 10, 8, 12, 9, 8]} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>Mei</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Agu</span>
            <span>Sep</span>
            <span>Okt</span>
            <span>Nov</span>
            <span>Des</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dealer/inventory" className="block">
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Mobil Baru
              </Button>
            </Link>
            <Link href="/dealer/marketplace" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Pasang di Dealer Marketplace (20 Token)
              </Button>
            </Link>
            <Link href="/dashboard/tokens" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Beli Token
              </Button>
            </Link>
            <Link href="/dealer/stats" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Lihat Statistik Lengkap
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pertanyaan Terbaru</CardTitle>
              <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {['A', 'B', 'R', 'S'][i - 1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{['Ahmad', 'Budi', 'Rina', 'Sari'][i - 1]}</p>
                      <span className="text-xs text-muted-foreground">{['2 jam lalu', '5 jam lalu', '1 hari lalu', '2 hari lalu'][i - 1]}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {['Tanya Toyota Alphard 2021', 'Harga bisa nego?', 'Mau test drive', 'Masih tersedia?'][i - 1]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {['Toyota Alphard 2.5 G', 'Honda Civic 2022', 'BMW X5 2020', 'Mercedes E300'][i - 1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Usage Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-lg">💡 Info Token Dealer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Dealer Marketplace</p>
                <p className="text-sm text-muted-foreground">20 Token / 7 hari</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Public Marketplace</p>
                <p className="text-sm text-muted-foreground">10 Token / 30 hari</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">AI Prediction</p>
                <p className="text-sm text-muted-foreground">5 Token</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Kontak Penjual (Dealer)</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">5 Token</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
