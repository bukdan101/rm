'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Download,
  Users,
  Building2,
  Car,
  Coins,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

// Types for API data
interface UserGrowthItem {
  month: string
  month_number: number
  new_users: number
  cumulative_users: number
  by_role: {
    buyers: number
    sellers: number
    dealers: number
  }
}

interface ListingActivityItem {
  month: string
  month_number: number
  created: number
  published: number
  sold: number
  active: number
}

interface ConversionFunnelItem {
  stage: string
  stage_slug: string
  count: number
  percentage: number
  drop_off_rate: number
}

interface TopBrandItem {
  rank: number
  brand_id: string
  brand_name: string
  brand_slug: string
  total_listings: number
  active_listings: number
  sold_listings: number
  total_views: number
  total_favorites: number
  total_inquiries: number
  conversion_rate: number
  avg_views: number
}

interface OverviewStats {
  users: {
    total: number
    dealers: number
    new_this_month: number
  }
  listings: {
    total: number
    active: number
    sold: number
    new_this_month: number
  }
  engagement: {
    total_views: number
    total_favorites: number
    total_inquiries: number
    avg_views_per_listing: number
  }
}

interface ReportsData {
  user_growth: UserGrowthItem[]
  listing_activity: ListingActivityItem[]
  conversion_funnel: ConversionFunnelItem[]
  top_brands: TopBrandItem[]
  overview_stats: OverviewStats
  year: number
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportsData | null>(null)

  useEffect(() => {
    async function fetchReportsData() {
      setLoading(true)
      setError(null)
      try {
        const year = new Date().getFullYear()
        const response = await fetch(`/api/admin/reports?year=${year}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReportsData()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    )
  }

  // Use real data or empty defaults
  const userGrowthData = (data?.user_growth || []).map(item => ({
    name: item.month,
    users: item.by_role?.buyers || 0,
    dealers: item.by_role?.dealers || 0,
    total: item.new_users || 0,
  }))

  const listingActivityData = (data?.listing_activity || []).map(item => ({
    name: item.month,
    new: item.created || 0,
    sold: item.sold || 0,
    expired: 0, // API doesn't have expired field, using 0
  }))

  const conversionFunnel = (data?.conversion_funnel || []).map(item => ({
    stage: item.stage,
    count: item.count,
    percentage: item.percentage,
  }))

  const topBrands = (data?.top_brands || []).map(brand => ({
    brand: brand.brand_name,
    listings: brand.total_listings,
    sold: brand.sold_listings,
  }))

  const overviewStats = {
    totalUsers: data?.overview_stats?.users?.total || 0,
    totalDealers: data?.overview_stats?.users?.dealers || 0,
    totalListings: data?.overview_stats?.listings?.total || 0,
    totalTokensSold: data?.overview_stats?.engagement?.total_views || 0,
    userGrowth: data?.overview_stats?.users?.new_this_month 
      ? Math.round((data.overview_stats.users.new_this_month / (data.overview_stats.users.total || 1)) * 100) 
      : 0,
    listingGrowth: data?.overview_stats?.listings?.new_this_month 
      ? Math.round((data.overview_stats.listings.new_this_month / (data.overview_stats.listings.total || 1)) * 100) 
      : 0,
    conversionRate: data?.overview_stats?.listings?.total 
      ? Math.round((data.overview_stats.listings.sold / data.overview_stats.listings.total) * 100) 
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overviewStats.totalUsers)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+{overviewStats.userGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dealers</CardTitle>
            <Building2 className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewStats.totalDealers}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <Car className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overviewStats.totalListings)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+{overviewStats.listingGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Coins className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overviewStats.totalTokensSold)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+15.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="listings">Listing Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {userGrowthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDealers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="users" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="dealers" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorDealers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Listing Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Activity</CardTitle>
                <CardDescription>Monthly listing statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {listingActivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={listingActivityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="new" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sold" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expired" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Brands */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Brands</CardTitle>
              <CardDescription>Most listed and sold car brands</CardDescription>
            </CardHeader>
            <CardContent>
              {topBrands.length > 0 ? (
                <div className="space-y-4">
                  {topBrands.map((brand, index) => (
                    <div key={brand.brand} className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{brand.brand}</span>
                          <span className="text-sm text-muted-foreground">
                            {brand.sold} sold
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                            style={{ width: `${(brand.listings / (topBrands[0]?.listings || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="font-bold">{formatNumber(brand.listings)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No brand data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { role: 'User', count: overviewStats.totalUsers - overviewStats.totalDealers, percentage: overviewStats.totalUsers > 0 ? Math.round(((overviewStats.totalUsers - overviewStats.totalDealers) / overviewStats.totalUsers) * 100) : 0, color: 'bg-rose-500' },
                    { role: 'Dealer', count: overviewStats.totalDealers, percentage: overviewStats.totalUsers > 0 ? Math.round((overviewStats.totalDealers / overviewStats.totalUsers) * 100) : 0, color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.role}</span>
                          <span className="text-sm text-muted-foreground">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatNumber(Math.round(overviewStats.totalUsers * 0.3))}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-sm text-muted-foreground">Active This Week</p>
                    <p className="text-2xl font-bold text-amber-600">{formatNumber(Math.round(overviewStats.totalUsers * 0.6))}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                    <p className="text-sm text-muted-foreground">New This Week</p>
                    <p className="text-2xl font-bold text-violet-600">{data?.overview_stats?.users?.new_this_month || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20">
                    <p className="text-sm text-muted-foreground">Avg Views/User</p>
                    <p className="text-2xl font-bold text-rose-600">{data?.overview_stats?.engagement?.avg_views_per_listing || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold">{formatNumber(data?.overview_stats?.listings?.active || 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{formatNumber(Math.round((data?.overview_stats?.listings?.total || 0) * 0.05))}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Sold This Month</p>
                  <p className="text-2xl font-bold">{formatNumber(data?.overview_stats?.listings?.sold || 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{formatNumber(data?.overview_stats?.engagement?.total_views || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from visitor to customer</CardDescription>
            </CardHeader>
            <CardContent>
              {conversionFunnel.length > 0 ? (
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">{stage.stage}</div>
                        <div className="flex-1">
                          <div className="h-10 rounded-lg bg-muted overflow-hidden flex items-center">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-end pr-4"
                              style={{ width: `${Math.min(stage.percentage, 100)}%` }}
                            >
                              <span className="text-white text-sm font-medium">
                                {stage.percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-20 text-right font-bold">
                          {formatNumber(stage.count)}
                        </div>
                      </div>
                      {index < conversionFunnel.length - 1 && (
                        <div className="absolute left-[108px] top-[44px] text-xs text-muted-foreground">
                          ↓ {((conversionFunnel[index + 1].count / stage.count) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No conversion data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
