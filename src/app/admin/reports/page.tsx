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
  BarChart3,
  Download,
  Calendar,
  Users,
  Building2,
  Car,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart,
  FileText,
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
  LineChart as RechartsLine,
  Line,
  Legend,
} from 'recharts'

const userGrowthData = [
  { name: 'Jan', users: 450, dealers: 12, total: 462 },
  { name: 'Feb', users: 520, dealers: 18, total: 538 },
  { name: 'Mar', users: 610, dealers: 24, total: 634 },
  { name: 'Apr', users: 680, dealers: 32, total: 712 },
  { name: 'May', users: 750, dealers: 38, total: 788 },
  { name: 'Jun', users: 840, dealers: 45, total: 885 },
  { name: 'Jul', users: 920, dealers: 52, total: 972 },
]

const listingActivityData = [
  { name: 'Mon', new: 45, sold: 12, expired: 8 },
  { name: 'Tue', new: 52, sold: 15, expired: 10 },
  { name: 'Wed', new: 38, sold: 8, expired: 6 },
  { name: 'Thu', new: 65, sold: 18, expired: 12 },
  { name: 'Fri', new: 58, sold: 14, expired: 9 },
  { name: 'Sat', new: 72, sold: 22, expired: 15 },
  { name: 'Sun', new: 48, sold: 11, expired: 7 },
]

const conversionFunnel = [
  { stage: 'Visitors', count: 15000, percentage: 100 },
  { stage: 'Sign Up', count: 2500, percentage: 16.7 },
  { stage: 'Verify Email', count: 1800, percentage: 12 },
  { stage: 'Complete Profile', count: 1200, percentage: 8 },
  { stage: 'Create Listing', count: 450, percentage: 3 },
  { stage: 'Purchase Token', count: 180, percentage: 1.2 },
]

const topBrands = [
  { brand: 'Toyota', listings: 2840, sold: 456 },
  { brand: 'Honda', listings: 2100, sold: 312 },
  { brand: 'Mitsubishi', listings: 1680, sold: 268 },
  { brand: 'Suzuki', listings: 1420, sold: 198 },
  { brand: 'Daihatsu', listings: 1180, sold: 156 },
]

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('7d')

  const overviewStats = {
    totalUsers: 4210,
    totalDealers: 156,
    totalListings: 8920,
    totalTokensSold: 245000,
    userGrowth: 12.5,
    listingGrowth: 8.3,
    conversionRate: 3.2,
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Sold</CardTitle>
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
                </div>
              </CardContent>
            </Card>

            {/* Listing Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Activity</CardTitle>
                <CardDescription>Daily listing statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                          style={{ width: `${(brand.listings / topBrands[0].listings) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-bold">{formatNumber(brand.listings)}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                    { role: 'User', count: 3850, percentage: 91.4, color: 'bg-rose-500' },
                    { role: 'Seller', count: 280, percentage: 6.7, color: 'bg-amber-500' },
                    { role: 'Dealer', count: 65, percentage: 1.5, color: 'bg-emerald-500' },
                    { role: 'Admin', count: 15, percentage: 0.4, color: 'bg-violet-500' },
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
                    <p className="text-2xl font-bold text-emerald-600">1,245</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-sm text-muted-foreground">Active This Week</p>
                    <p className="text-2xl font-bold text-amber-600">2,890</p>
                  </div>
                  <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                    <p className="text-sm text-muted-foreground">New This Week</p>
                    <p className="text-2xl font-bold text-violet-600">156</p>
                  </div>
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20">
                    <p className="text-sm text-muted-foreground">Churned</p>
                    <p className="text-2xl font-bold text-rose-600">23</p>
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
                  <p className="text-2xl font-bold">7,540</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Sold This Month</p>
                  <p className="text-2xl font-bold">456</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold">690</p>
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
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium">{stage.stage}</div>
                      <div className="flex-1">
                        <div className="h-10 rounded-lg bg-muted overflow-hidden flex items-center">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-end pr-4"
                            style={{ width: `${stage.percentage}%` }}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
