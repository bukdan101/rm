'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Zap,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
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
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart as RechartsLine,
  Line,
  Legend,
} from 'recharts'

// Types for API response
interface MonthlyRevenue {
  month: string
  month_number: number
  revenue: number
  transaction_count: number
}

interface RevenueBySource {
  source: string
  source_slug: string
  amount: number
  percentage: number
  transaction_count: number
}

interface RevenueByPackage {
  package_id: string
  package_name: string
  total_revenue: number
  transaction_count: number
  total_credits: number
  is_for_dealer: boolean
}

interface RevenueSummary {
  total_revenue: number
  total_credits_sold: number
  pending_payments: number
  this_month_revenue: number
  last_month_revenue: number
  growth_percentage: number
  average_transaction_value: number
}

interface RevenueData {
  monthly_revenue: MonthlyRevenue[]
  revenue_by_source: RevenueBySource[]
  revenue_by_package: RevenueByPackage[]
  summary: RevenueSummary
  year: number
  period: string
}

// Colors for pie chart
const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}M`
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminRevenue() {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RevenueData | null>(null)

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/revenue')
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching revenue data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Revenue Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Analisis pendapatan platform
            </p>
          </div>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-40 mb-2"></div>
                <div className="h-4 bg-muted rounded w-60"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Revenue Dashboard
            </h1>
          </div>
        </div>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No data state
  if (!data) {
    return null
  }

  const { monthly_revenue, revenue_by_source, revenue_by_package, summary } = data

  // Prepare data for pie chart with colors
  const pieChartData = revenue_by_source.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }))

  // Calculate additional stats
  const totalRevenue = summary.total_revenue
  const growth = summary.growth_percentage

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Revenue Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Analisis pendapatan platform
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

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              {growth >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600">+{growth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{growth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kredit Terjual</CardTitle>
            <Coins className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total_credits_sold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total credits purchased</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Bulan Ini</CardTitle>
            <Zap className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary.this_month_revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan lalu: {formatCurrency(summary.last_month_revenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <ImageIcon className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.pending_payments}</div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu verifikasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </div>
              <Tabs defaultValue="area" className="w-auto">
                <TabsList className="grid grid-cols-2 w-[140px] h-8">
                  <TabsTrigger value="area" className="text-xs">Area</TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs">Bar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthly_revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly_revenue}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatCurrency(value)]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Distribution of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="percentage"
                      nameKey="source"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const item = pieChartData.find(d => d.source === name)
                        return [formatCurrency(item?.amount || 0), name]
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No source data available
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieChartData.map((item) => (
                <div key={item.source_slug} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.source}</p>
                    <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Package Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-violet-500" />
            Package Performance
          </CardTitle>
          <CardDescription>Revenue by credit package type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {revenue_by_package.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue_by_package} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tickFormatter={(v) => `${v / 1000000}M`} />
                  <YAxis type="category" dataKey="package_name" className="text-xs" width={80} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="total_revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No package data available
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {revenue_by_package.map((pkg) => (
              <div key={pkg.package_id} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="font-medium">{pkg.package_name}</p>
                  {pkg.is_for_dealer && (
                    <Badge variant="secondary" className="text-xs">Dealer</Badge>
                  )}
                </div>
                <p className="text-lg font-bold text-violet-600">{pkg.transaction_count}</p>
                <p className="text-xs text-muted-foreground">transactions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boost Feature Revenue (from source data) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-500" />
            Revenue Sources Detail
          </CardTitle>
          <CardDescription>Revenue and transaction count by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revenue_by_source.map((source) => (
              <div 
                key={source.source_slug} 
                className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 border border-cyan-100 dark:border-cyan-900"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{source.source}</h3>
                  <Badge variant="secondary">{source.transaction_count.toLocaleString()} transaksi</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(source.amount)}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>{source.percentage.toFixed(1)}% dari total</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
