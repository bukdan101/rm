'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Car,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  PieChart,
  LineChart,
  Activity,
} from 'lucide-react'

function StatCard({ title, value, change, changeType, icon: Icon, color }: {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${changeType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {changeType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {change}
              </div>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SimpleLineChart({ data, color = 'purple' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (v / max) * 80
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'purple' ? '#9333ea' : '#10b981'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color === 'purple' ? '#9333ea' : '#10b981'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color === 'purple' ? '#9333ea' : '#10b981'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SimpleBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer"
          style={{ height: `${(value / max) * 100}%` }}
          title={`${value}`}
        />
      ))}
    </div>
  )
}

export default function DealerStatsPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            Statistik & Analytics
          </h1>
          <p className="text-muted-foreground">
            Analisis performa penjualan dealer Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Minggu</TabsTrigger>
              <TabsTrigger value="month">Bulan</TabsTrigger>
              <TabsTrigger value="year">Tahun</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value="12.4K"
          change="+18%"
          changeType="up"
          icon={Eye}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Inquiries"
          value="156"
          change="+12%"
          changeType="up"
          icon={MessageSquare}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Mobil Terjual"
          value="8"
          change="+25%"
          changeType="up"
          icon={ShoppingCart}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Revenue"
          value="Rp 1.25M"
          change="+15%"
          changeType="up"
          icon={DollarSign}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Views & Traffic</CardTitle>
                <CardDescription>Tren pengunjung dalam periode ini</CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={[320, 450, 380, 520, 480, 610, 750]} color="purple" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Penjualan Bulanan</CardTitle>
                <CardDescription>Jumlah mobil terjual per bulan</CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +25%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={[3, 5, 4, 8, 6, 9, 7, 10, 8, 12, 9, 8]} />
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
      </div>

      {/* Top Performing Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Mobil dengan Performa Terbaik
          </CardTitle>
          <CardDescription>Berdasarkan views dan inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Toyota Alphard 2.5 G 2021', views: 2450, inquiries: 18, status: 'active' },
              { name: 'Honda Civic RS 2022', views: 1890, inquiries: 15, status: 'sold' },
              { name: 'BMW X5 xDrive 2020', views: 1560, inquiries: 12, status: 'active' },
              { name: 'Mercedes-Benz E300 2021', views: 1340, inquiries: 10, status: 'active' },
              { name: 'Toyota Fortuner VRZ 2022', views: 1120, inquiries: 8, status: 'sold' },
            ].map((car, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{car.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {car.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {car.inquiries}
                    </span>
                  </div>
                </div>
                <Badge className={car.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }>
                  {car.status === 'active' ? 'Aktif' : 'Terjual'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sumber Traffic</CardTitle>
            <CardDescription>Dari mana pembaca menemukan iklan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { source: 'Public Marketplace', percentage: 45, color: 'bg-blue-500' },
                { source: 'Dealer Marketplace', percentage: 30, color: 'bg-purple-500' },
                { source: 'Pencarian Google', percentage: 15, color: 'bg-emerald-500' },
                { source: 'Social Media', percentage: 10, color: 'bg-pink-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.source}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Rasio views menjadi inquiry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${12.5 * 2 * Math.PI * 56 / 100} ${2 * Math.PI * 56}`}
                    className="text-purple-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">12.5%</span>
                  <span className="text-xs text-muted-foreground">Conversion</span>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>156 inquiries dari 1,245 total views</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
