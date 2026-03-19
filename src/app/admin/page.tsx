'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Building2,
  Car,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  FileCheck,
  CreditCard,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data for charts
const revenueData = [
  { name: 'Jan', revenue: 45000000, tokens: 1200 },
  { name: 'Feb', revenue: 52000000, tokens: 1450 },
  { name: 'Mar', revenue: 48000000, tokens: 1300 },
  { name: 'Apr', revenue: 61000000, tokens: 1700 },
  { name: 'May', revenue: 55000000, tokens: 1500 },
  { name: 'Jun', revenue: 67000000, tokens: 1900 },
  { name: 'Jul', revenue: 72000000, tokens: 2100 },
]

const userGrowthData = [
  { name: 'Jan', users: 450, dealers: 12 },
  { name: 'Feb', users: 520, dealers: 18 },
  { name: 'Mar', users: 610, dealers: 24 },
  { name: 'Apr', users: 680, dealers: 32 },
  { name: 'May', users: 750, dealers: 38 },
  { name: 'Jun', users: 840, dealers: 45 },
  { name: 'Jul', users: 920, dealers: 52 },
]

const tokenUsageData = [
  { name: 'Listings', value: 45, color: '#8b5cf6' },
  { name: 'Boosts', value: 30, color: '#06b6d4' },
  { name: 'AI Predict', value: 15, color: '#f59e0b' },
  { name: 'Dealer Contact', value: 10, color: '#10b981' },
]

interface DashboardStats {
  totalUsers: number
  totalDealers: number
  totalListings: number
  pendingKyc: number
  pendingDealerApproval: number
  totalRevenue: number
  tokenSales: number
  boostRevenue: number
  activeBoosts: number
  monthlyGrowth: number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats({
          totalUsers: 12580,
          totalDealers: 156,
          totalListings: 8920,
          pendingKyc: 23,
          pendingDealerApproval: 8,
          totalRevenue: 450000000,
          tokenSales: 320000000,
          boostRevenue: 95000000,
          activeBoosts: 234,
          monthlyGrowth: 12.5,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with AutoMarket today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <Clock className="h-3.5 w-3.5" />
            Last updated: Just now
          </Badge>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="relative overflow-hidden border-l-4 border-l-violet-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-transparent dark:from-violet-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatNumber(stats?.totalUsers || 0)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">+12.5%</span>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Dealers */}
        <Card className="relative overflow-hidden border-l-4 border-l-cyan-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-transparent dark:from-cyan-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dealers
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {stats?.totalDealers}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {stats?.pendingDealerApproval} pending
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Listings */}
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Car className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatNumber(stats?.totalListings || 0)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">+8.2%</span>
                  <span className="text-xs text-muted-foreground">from last week</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent dark:from-amber-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">+{stats?.monthlyGrowth}%</span>
                  <span className="text-xs text-muted-foreground">growth</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Token Sales */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Token Sales</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.tokenSales || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boost Revenue */}
        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Boost Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.boostRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Boosts */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Boosts</p>
                <p className="text-xl font-bold">{stats?.activeBoosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending KYC */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending KYC</p>
                <p className="text-xl font-bold">{stats?.pendingKyc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue and token sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={formatNumber} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              User Growth
            </CardTitle>
            <CardDescription>New users and dealers registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dealers" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Token Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Token Usage
            </CardTitle>
            <CardDescription>Distribution of token usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tokenUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {tokenUsageData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <FileCheck className="h-4 w-4 text-violet-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Review KYC</p>
                <p className="text-xs text-muted-foreground">{stats?.pendingKyc} pending reviews</p>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Dealer Approval</p>
                <p className="text-xs text-muted-foreground">{stats?.pendingDealerApproval} pending</p>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Verify Payments</p>
                <p className="text-xs text-muted-foreground">5 unverified payments</p>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'user', text: 'New user registered', time: '2 min ago', icon: Users, color: 'violet' },
                { type: 'dealer', text: 'Dealer registration pending', time: '15 min ago', icon: Building2, color: 'cyan' },
                { type: 'payment', text: 'Payment verified Rp 500.000', time: '1 hour ago', icon: CreditCard, color: 'emerald' },
                { type: 'boost', text: '45 new boosts activated', time: '2 hours ago', icon: Zap, color: 'amber' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/30 flex items-center justify-center shrink-0`}>
                    <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
