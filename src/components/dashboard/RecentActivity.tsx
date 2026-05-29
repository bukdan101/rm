'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Eye, 
  MessageCircle, 
  Heart, 
  Car, 
  Coins, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatRelativeTime } from '@/lib/utils'

interface Activity {
  id: string
  type: 'view' | 'message' | 'favorite' | 'listing' | 'token' | 'sale'
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface RecentActivityProps {
  userId?: string
  dealerId?: string
  limit?: number
  className?: string
}

const activityIcons = {
  view: Eye,
  message: MessageCircle,
  favorite: Heart,
  listing: Car,
  token: Coins,
  sale: TrendingUp,
}

const activityColors = {
  view: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  message: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  favorite: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  listing: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  token: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  sale: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
}

export function RecentActivity({ userId, dealerId, limit = 10, className }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params = new URLSearchParams()
        if (userId) params.append('user_id', userId)
        if (dealerId) params.append('dealer_id', dealerId)
        params.append('limit', limit.toString())

        const res = await fetch(`/api/dashboard/activity?${params}`)
        if (res.ok) {
          const data = await res.json()
          setActivities(data.activities || [])
        } else {
          // Use sample data
          setActivities(generateSampleActivities())
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
        setActivities(generateSampleActivities())
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId, dealerId, limit])

  const generateSampleActivities = (): Activity[] => [
    {
      id: '1',
      type: 'view',
      title: 'Toyota Avanza 2020 dilihat',
      description: '50 views hari ini',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      type: 'message',
      title: 'Pesan baru dari Ahmad',
      description: 'Terima kasih infonya...',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      type: 'favorite',
      title: 'Honda Jazz 2021 disimpan',
      description: 'Ditambahkan ke favorit',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '4',
      type: 'listing',
      title: 'Iklan baru dipublikasi',
      description: 'Suzuki Ertiga 2019',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '5',
      type: 'token',
      title: 'Token ditambahkan',
      description: '+100 token dari pembelian',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '6',
      type: 'sale',
      title: 'Mobil terjual!',
      description: 'Daihatsu Xenia 2018 - Rp 145.000.000',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
        <Link href="/dashboard/activity">
          <Button variant="ghost" size="sm" className="text-primary">
            Lihat Semua
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        {loading ? (
          <div className="space-y-4 px-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 px-6">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type]
                const colorClass = activityColors[activity.type]
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-3 border-b last:border-0 hover:bg-muted/50 -mx-6 px-6 transition-colors"
                  >
                    <div className={cn('flex items-center justify-center h-9 w-9 rounded-full shrink-0', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for sidebar
export function RecentActivityCompact({ className }: { className?: string }) {
  // Use initial state directly instead of useEffect
  const activities: Activity[] = [
    { id: '1', type: 'view', title: 'Toyota Avanza dilihat', timestamp: new Date().toISOString() },
    { id: '2', type: 'message', title: 'Pesan baru dari Ahmad', timestamp: new Date().toISOString() },
    { id: '3', type: 'favorite', title: 'Honda Jazz disimpan', timestamp: new Date().toISOString() },
  ]

  return (
    <div className={cn('space-y-1', className)}>
      {activities.slice(0, 3).map((activity) => {
        const Icon = activityIcons[activity.type]
        const colorClass = activityColors[activity.type]
        
        return (
          <div
            key={activity.id}
            className="flex items-center gap-2 py-1.5 text-sm"
          >
            <div className={cn('flex items-center justify-center h-6 w-6 rounded-full', colorClass)}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="truncate flex-1">{activity.title}</span>
          </div>
        )
      })}
    </div>
  )
}

// Listing status timeline
export function ListingStatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'draft', label: 'Draft', icon: Clock },
    { key: 'pending', label: 'Review', icon: AlertCircle },
    { key: 'active', label: 'Aktif', icon: CheckCircle },
    { key: 'sold', label: 'Terjual', icon: TrendingUp },
  ]

  const currentIndex = steps.findIndex(s => s.key === status)

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors',
                isActive 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'bg-muted border-muted-foreground/30 text-muted-foreground',
                isCurrent && 'ring-2 ring-primary ring-offset-2'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn(
                'text-xs mt-1',
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-12 h-0.5 mx-2',
                index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
