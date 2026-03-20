'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Users, Car, DollarSign, TrendingUp, TrendingDown, Activity,
  Loader2, RefreshCw, BarChart3
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalDealers: number
    totalRegularUsers: number
    totalListings: number
    activeListings: number
    soldListings: number
    pendingListings: number
    totalRevenue: number
    userGrowthRate: string
  }
  charts: {
    dailyUsers: Array<{ date: string; count: number }>
    dailyListings: Array<{ date: string; count: number }>
    dailyRevenue: Array<{ date: string; amount: number }>
  }
  topBrands: Array<{ name: string; count: number }>
  period: string
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data analitik',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    toast({
      title: 'Refreshed',
      description: 'Data analitik berhasil diperbarui',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-gray-400">Memuat analitik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Analitik
          </h1>
          <p className="text-gray-400 mt-1">Statistik dan analisis platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              <SelectItem value="90d">90 Hari Terakhir</SelectItem>
              <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatNumber(data?.overview.totalUsers || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data?.overview.totalDealers || 0)} dealers
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-600/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Listings</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatNumber(data?.overview.totalListings || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data?.overview.activeListings || 0)} aktif
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-600/20">
                <Car className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(data?.overview.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-600/20">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">User Growth</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {data?.overview.userGrowthRate || 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-600/20">
                {Number(data?.overview.userGrowthRate || 0) >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Users Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Pertumbuhan User</CardTitle>
            <CardDescription className="text-gray-400">User baru per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {data?.charts.dailyUsers.slice(-14).map((item, i) => {
                const maxCount = Math.max(...(data?.charts.dailyUsers.slice(-14).map(d => d.count) || [1]))
                const height = (item.count / maxCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 -rotate-45 origin-left">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Listings Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Listing Baru</CardTitle>
            <CardDescription className="text-gray-400">Listing per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {data?.charts.dailyListings.slice(-14).map((item, i) => {
                const maxCount = Math.max(...(data?.charts.dailyListings.slice(-14).map(d => d.count) || [1]))
                const height = (item.count / maxCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-600 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 -rotate-45 origin-left">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Brands */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Brand Terpopuler</CardTitle>
          <CardDescription className="text-gray-400">Brand dengan listing terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data?.topBrands.map((brand, i) => (
              <div key={brand.name} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-white font-medium">{brand.name}</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{formatNumber(brand.count)}</p>
                <p className="text-xs text-gray-500">listings</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
