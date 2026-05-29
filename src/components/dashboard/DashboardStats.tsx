'use client'

import { useState, useEffect } from 'react'
import { StatsCard, StatsTrend } from '@/components/ui/stats-card'
import { 
  Car, 
  CheckCircle, 
  Eye, 
  Heart, 
  MessageCircle, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ==============================
// TYPES
// ==============================

interface DashboardStatsData {
  total_listings: number
  active_listings: number
  sold_listings: number
  pending_listings: number
  draft_listings: number
  expired_listings: number
  total_views: number
  total_favorites: number
  total_inquiries: number
  estimated_value: number
  conversion_rate: number
  listings_trend?: StatsTrend
  views_trend?: StatsTrend
}

interface DashboardStatsProps {
  dealerId?: string
  userId?: string
  className?: string
  variant?: 'full' | 'compact' | 'minimal'
}

// ==============================
// COMPONENT
// ==============================

export function DashboardStats({ 
  dealerId, 
  userId, 
  className,
  variant = 'full' 
}: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        if (dealerId) params.append('dealer_id', dealerId)
        if (userId) params.append('user_id', userId)

        const response = await fetch(`/api/stats?${params}`)
        const result = await response.json()
        
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dealerId, userId])

  // Full variant - 6 cards in 2 rows
  if (variant === 'full') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* First Row - Main Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Iklan"
            value={stats?.total_listings || 0}
            icon={Car}
            format="number"
            variant="primary"
            trend={stats?.listings_trend}
            isLoading={loading}
            href="/dashboard/listings"
            badge="Semua"
          />
          
          <StatsCard
            title="Iklan Aktif"
            value={stats?.active_listings || 0}
            icon={CheckCircle}
            format="number"
            variant="success"
            isLoading={loading}
            href="/dashboard/listings?status=active"
            description="Sedang ditayangkan"
          />
          
          <StatsCard
            title="Terjual"
            value={stats?.sold_listings || 0}
            icon={TrendingUp}
            format="number"
            variant="info"
            isLoading={loading}
            href="/dashboard/listings?status=sold"
            description="Mobil berhasil dijual"
          />
          
          <StatsCard
            title="Conversion Rate"
            value={stats?.conversion_rate || 0}
            icon={TrendingUp}
            format="percentage"
            variant={stats?.conversion_rate && stats.conversion_rate >= 10 ? 'success' : 'warning'}
            isLoading={loading}
            description="Rasio penjualan"
          />
        </div>

        {/* Second Row - Engagement Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Dilihat"
            value={stats?.total_views || 0}
            icon={Eye}
            format="short"
            variant="default"
            trend={stats?.views_trend}
            isLoading={loading}
            description="Views semua iklan"
          />
          
          <StatsCard
            title="Favorit"
            value={stats?.total_favorites || 0}
            icon={Heart}
            format="number"
            variant="danger"
            isLoading={loading}
            description="Iklan disimpan user"
          />
          
          <StatsCard
            title="Pertanyaan"
            value={stats?.total_inquiries || 0}
            icon={MessageCircle}
            format="number"
            variant="warning"
            isLoading={loading}
            description="Pesan dari pembeli"
          />
          
          <StatsCard
            title="Estimasi Nilai"
            value={stats?.estimated_value || 0}
            icon={DollarSign}
            format="currency"
            variant="success"
            isLoading={loading}
            subtitle={`${stats?.active_listings || 0} iklan aktif`}
          />
        </div>

        {/* Third Row - Status Breakdown (Optional) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="Menunggu Review"
            value={stats?.pending_listings || 0}
            icon={Clock}
            format="number"
            variant="warning"
            isLoading={loading}
            description="Perlu ditinjau"
          />
          
          <StatsCard
            title="Draft"
            value={stats?.draft_listings || 0}
            icon={AlertCircle}
            format="number"
            variant="default"
            isLoading={loading}
            description="Belum dipublikasi"
          />
          
          <StatsCard
            title="Expired"
            value={stats?.expired_listings || 0}
            icon={AlertCircle}
            format="number"
            variant="danger"
            isLoading={loading}
            description="Perlu diperbarui"
          />
        </div>
      </div>
    )
  }

  // Compact variant - 4 cards in 1 row
  if (variant === 'compact') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
        <StatsCard
          title="Total Iklan"
          value={stats?.total_listings || 0}
          icon={Car}
          format="number"
          variant="primary"
          trend={stats?.listings_trend}
          isLoading={loading}
          href="/dashboard/listings"
        />
        
        <StatsCard
          title="Iklan Aktif"
          value={stats?.active_listings || 0}
          icon={CheckCircle}
          format="number"
          variant="success"
          isLoading={loading}
        />
        
        <StatsCard
          title="Total Views"
          value={stats?.total_views || 0}
          icon={Eye}
          format="short"
          variant="default"
          trend={stats?.views_trend}
          isLoading={loading}
        />
        
        <StatsCard
          title="Pertanyaan"
          value={stats?.total_inquiries || 0}
          icon={MessageCircle}
          format="number"
          variant="warning"
          isLoading={loading}
        />
      </div>
    )
  }

  // Minimal variant - 2 cards
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <StatsCard
        title="Iklan Aktif"
        value={stats?.active_listings || 0}
        icon={Car}
        format="number"
        variant="success"
        isLoading={loading}
        description={`${stats?.sold_listings || 0} terjual`}
      />
      
      <StatsCard
        title="Total Dilihat"
        value={stats?.total_views || 0}
        icon={Eye}
        format="short"
        variant="default"
        isLoading={loading}
        description={`${stats?.total_inquiries || 0} pertanyaan`}
      />
    </div>
  )
}

// ==============================
// MINI STATS FOR SIDEBAR/HEADER
// ==============================

export function MiniStats({ dealerId, userId }: { dealerId?: string; userId?: string }) {
  const [stats, setStats] = useState({ active: 0, views: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        if (dealerId) params.append('dealer_id', dealerId)
        if (userId) params.append('user_id', userId)

        const response = await fetch(`/api/stats?${params}`)
        const result = await response.json()
        
        if (result.success) {
          setStats({
            active: result.data.active_listings || 0,
            views: result.data.total_views || 0,
          })
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dealerId, userId])

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Car className="h-4 w-4 text-green-600" />
        <span className="font-medium">{stats.active}</span>
        <span className="text-muted-foreground">aktif</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{stats.views.toLocaleString('id-ID')}</span>
        <span className="text-muted-foreground">views</span>
      </div>
    </div>
  )
}
