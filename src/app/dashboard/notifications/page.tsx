'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Coins,
  MessageCircle,
  Trash2,
  Check,
  Loader2,
  Settings,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  data?: any
}

const getNotificationConfig = (type: string) => {
  const configs: Record<string, { icon: any; color: string; bgColor: string }> = {
    info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
    success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/20' },
    error: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20' },
    order: { icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
    payment: { icon: Coins, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20' },
    message: { icon: MessageCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/20' },
  }
  return configs[type] || configs.info
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [markingRead, setMarkingRead] = useState(false)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true)
        const res = await fetch('/api/notifications?limit=50')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    return !n.isRead
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllRead = async () => {
    try {
      setMarkingRead(true)
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast({
          title: 'Berhasil',
          description: 'Semua notifikasi ditandai sudah dibaca',
        })
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setMarkingRead(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleClickNotification = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <DashboardLayout title="Notifikasi" description="Semua pemberitahuan untuk Anda">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Notifikasi</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Belum Dibaca</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sudah Dibaca</p>
                <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semua Notifikasi</CardTitle>
              <CardDescription>Daftar pemberitahuan terbaru</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                >
                  {markingRead ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Tandai Semua Dibaca
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Semua ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Belum Dibaca ({unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">
                {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Tidak ada notifikasi'}
              </p>
              <p className="text-sm mt-1">Notifikasi baru akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const config = getNotificationConfig(notification.type)
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleClickNotification(notification)}
                  >
                    <div className={`p-2 rounded-full ${config.bgColor} shrink-0`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.isRead && (
                          <Badge variant="default" className="shrink-0 bg-blue-600 text-xs">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.createdAt ? format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale }) : ''}
                      </p>
                    </div>
                    {notification.actionUrl && (
                      <Button variant="ghost" size="sm" className="shrink-0">
                        Lihat
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
