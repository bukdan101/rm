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

const monthlyRevenueData = [
  { name: 'Jan', tokens: 45000000, boosts: 12000000, ads: 5000000, total: 62000000 },
  { name: 'Feb', tokens: 52000000, boosts: 15000000, ads: 6000000, total: 73000000 },
  { name: 'Mar', tokens: 48000000, boosts: 14000000, ads: 5500000, total: 67500000 },
  { name: 'Apr', tokens: 61000000, boosts: 18000000, ads: 8000000, total: 87000000 },
  { name: 'May', tokens: 55000000, boosts: 16000000, ads: 7000000, total: 78000000 },
  { name: 'Jun', tokens: 67000000, boosts: 20000000, ads: 9000000, total: 96000000 },
  { name: 'Jul', tokens: 72000000, boosts: 23000000, ads: 11000000, total: 106000000 },
]

const revenueSourceData = [
  { name: 'Token Sales', value: 65, amount: 400000000, color: '#8b5cf6' },
  { name: 'Boost Features', value: 22, amount: 135000000, color: '#06b6d4' },
  { name: 'Banner Ads', value: 10, amount: 61000000, color: '#f59e0b' },
  { name: 'Dealer Subscription', value: 3, amount: 18500000, color: '#10b981' },
]

const tokenPackageRevenue = [
  { name: 'Starter', users: 450, revenue: 22500000 },
  { name: 'Basic', users: 890, revenue: 89000000 },
  { name: 'Standard', users: 320, revenue: 80000000 },
  { name: 'Premium', users: 180, revenue: 90000000 },
  { name: 'Ultimate', users: 85, revenue: 85000000 },
]

const boostFeatureRevenue = [
  { name: 'Highlight', uses: 4500, revenue: 13500000 },
  { name: 'Top Search', uses: 3200, revenue: 16000000 },
  { name: 'Featured', uses: 1200, revenue: 12000000 },
]

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

  const stats = {
    totalRevenue: monthlyRevenueData.reduce((sum, m) => sum + m.total, 0),
    tokenRevenue: monthlyRevenueData.reduce((sum, m) => sum + m.tokens, 0),
    boostRevenue: monthlyRevenueData.reduce((sum, m) => sum + m.boosts, 0),
    adsRevenue: monthlyRevenueData.reduce((sum, m) => sum + m.ads, 0),
    growth: 12.5,
  }

  const lastMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1]

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
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+{stats.growth}%</span>
              <span className="text-xs text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Token Revenue</CardTitle>
            <Coins className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.tokenRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">65% of total revenue</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Boost Revenue</CardTitle>
            <Zap className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.boostRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">22% of total revenue</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ads Revenue</CardTitle>
            <ImageIcon className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.adsRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">10% of total revenue</p>
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
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
                  <XAxis dataKey="name" className="text-xs" />
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
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={revenueSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const item = revenueSourceData.find(d => d.name === name)
                      return [formatCurrency(item?.amount || 0), name]
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {revenueSourceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.name}</p>
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
            Token Package Performance
          </CardTitle>
          <CardDescription>Revenue by token package type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenPackageRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tickFormatter={(v) => `${v / 1000000}M`} />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-6">
            {tokenPackageRevenue.map((pkg) => (
              <div key={pkg.name} className="text-center p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{pkg.name}</p>
                <p className="text-lg font-bold text-violet-600">{pkg.users}</p>
                <p className="text-xs text-muted-foreground">purchases</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boost Feature Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-500" />
            Boost Feature Performance
          </CardTitle>
          <CardDescription>Revenue and usage by boost type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {boostFeatureRevenue.map((boost) => (
              <div key={boost.name} className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 border border-cyan-100 dark:border-cyan-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{boost.name}</h3>
                  <Badge variant="secondary">{boost.uses.toLocaleString()} uses</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(boost.revenue)}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>15% from last month</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
