'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, MessageCircle, Heart, Coins, TrendingUp, Car } from 'lucide-react'

// Chart gradient colors
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
}

const GRADIENT_COLORS = {
  views: { from: '#3b82f6', to: '#8b5cf6' },
  leads: { from: '#22c55e', to: '#06b6d4' },
  tokens: { from: '#f59e0b', to: '#ef4444' },
}

interface ChartData {
  name: string
  views: number
  leads: number
  tokens: number
}

interface ListingStatusData {
  name: string
  value: number
  color: string
}

interface DashboardChartsProps {
  userId?: string
  dealerId?: string
  className?: string
}

export function DashboardCharts({ userId, dealerId, className }: DashboardChartsProps) {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [statusData, setStatusData] = useState<ListingStatusData[]>([])
  const [tokenUsageData, setTokenUsageData] = useState<{ name: string; amount: number }[]>([])

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (userId) params.append('user_id', userId)
        if (dealerId) params.append('dealer_id', dealerId)
        params.append('period', period)

        const res = await fetch(`/api/dashboard/stats?${params}`)
        if (res.ok) {
          const data = await res.json()
          
          // Generate sample data based on period
          const days = period === '30d' ? 30 : period === '7d' ? 7 : 14
          const generatedData = generateChartData(days)
          setChartData(generatedData)
          
          // Status distribution
          setStatusData([
            { name: 'Aktif', value: data.data?.active_listings || 3, color: COLORS.success },
            { name: 'Terjual', value: data.data?.sold_listings || 2, color: COLORS.primary },
            { name: 'Pending', value: data.data?.pending_listings || 1, color: COLORS.warning },
            { name: 'Draft', value: data.data?.draft_listings || 1, color: COLORS.info },
          ])

          // Token usage
          setTokenUsageData([
            { name: 'Iklan Normal', amount: 30 },
            { name: 'Dealer Marketplace', amount: 20 },
            { name: 'AI Prediction', amount: 15 },
            { name: 'Boost', amount: 10 },
          ])
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
        // Use sample data on error
        setChartData(generateChartData(7))
        setStatusData([
          { name: 'Aktif', value: 3, color: COLORS.success },
          { name: 'Terjual', value: 2, color: COLORS.primary },
          { name: 'Pending', value: 1, color: COLORS.warning },
          { name: 'Draft', value: 1, color: COLORS.info },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [userId, dealerId, period])

  const generateChartData = (days: number): ChartData[] => {
    const data: ChartData[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        name: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        views: Math.floor(Math.random() * 100) + 20,
        leads: Math.floor(Math.random() * 15) + 1,
        tokens: Math.floor(Math.random() * 10),
      })
    }
    return data
  }

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokens">Token Usage</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="14d">14 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Main Chart - Views & Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Views & Leads
              </CardTitle>
              <CardDescription>Tren views dan leads dalam periode yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_COLORS.views.from} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={GRADIENT_COLORS.views.to} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_COLORS.leads.from} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={GRADIENT_COLORS.leads.to} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Views"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke={COLORS.success}
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Secondary Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Token Usage Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="tokens"
                        name="Tokens"
                        stroke={COLORS.warning}
                        strokeWidth={2}
                        dot={{ fill: COLORS.warning, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Listing Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Status Iklan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Token Usage Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Penggunaan Token</CardTitle>
              <CardDescription>Bagaimana token Anda digunakan</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tokenUsageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      name="Token"
                      fill={COLORS.warning}
                      radius={[0, 4, 4, 0]}
                    >
                      {tokenUsageData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#barGradient-${index})`} 
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="barGradient-0" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#ef4444"/>
                      </linearGradient>
                      <linearGradient id="barGradient-1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#8b5cf6"/>
                      </linearGradient>
                      <linearGradient id="barGradient-2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22c55e"/>
                        <stop offset="100%" stopColor="#06b6d4"/>
                      </linearGradient>
                      <linearGradient id="barGradient-3" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ec4899"/>
                        <stop offset="100%" stopColor="#8b5cf6"/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performa Iklan</CardTitle>
              <CardDescription>Views dan engagement per iklan</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="views" 
                      name="Views"
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="leads" 
                      name="Leads"
                      fill={COLORS.success}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Compact chart for quick view
export function QuickChart({ 
  data, 
  type = 'area',
  color = 'primary',
  height = 80 
}: { 
  data: { value: number }[]
  type?: 'area' | 'line' | 'bar'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  height?: number
}) {
  const chartData = data.map((d, i) => ({ name: i.toString(), value: d.value }))
  const colorMap = {
    primary: COLORS.primary,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <Bar dataKey="value" fill={colorMap[color]} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colorMap[color]} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colorMap[color]} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={colorMap[color]} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={colorMap[color]} 
          fillOpacity={1}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
