'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  FileCheck,
  Building2,
  CreditCard,
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  count: number
  link: string
  priority: 'high' | 'medium' | 'low'
  created_at: string
}

interface NotificationStats {
  pendingKyc: number
  pendingDealer: number
  pendingPayments: number
  newUsersToday: number
  newListingsToday: number
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'kyc':
      return <FileCheck className="h-4 w-4 text-violet-500" />
    case 'dealer':
      return <Building2 className="h-4 w-4 text-cyan-500" />
    case 'payment':
      return <CreditCard className="h-4 w-4 text-emerald-500" />
    case 'user':
      return <Users className="h-4 w-4 text-amber-500" />
    case 'listing':
      return <Car className="h-4 w-4 text-rose-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 dark:bg-red-950/20 border-l-2 border-l-red-500'
    case 'medium':
      return 'bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500'
    default:
      return 'bg-muted/50'
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate total important items
  const importantCount = stats ? (stats.pendingKyc || 0) + (stats.pendingDealer || 0) + (stats.pendingPayments || 0) : 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {importantCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0"
            >
              {importantCount > 9 ? '9+' : importantCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifikasi</h4>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  fetchNotifications()
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Update terbaru dari platform
          </p>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-500 opacity-50" />
            <p className="font-medium">Semua sudah ditangani!</p>
            <p className="text-sm">Tidak ada notifikasi pending</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={notification.link}
                  className={`block p-3 hover:bg-muted/50 transition-colors ${getPriorityStyles(notification.priority)}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {notification.count > 0 && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {notification.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {(notification.priority === 'high' || notification.priority === 'medium') && (
                      <AlertCircle className={`h-4 w-4 shrink-0 ${
                        notification.priority === 'high' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                    )}
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {stats && (
          <>
            <Separator />
            <div className="p-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Ringkasan Hari Ini</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-violet-500" />
                  <span>KYC Pending: <strong>{stats.pendingKyc || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Dealer: <strong>{stats.pendingDealer || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Payment: <strong>{stats.pendingPayments || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  <span>User Baru: <strong>{stats.newUsersToday || 0}</strong></span>
                </div>
              </div>
              {(stats.newListingsToday || 0) > 0 && (
                <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs">
                  <Car className="h-3.5 w-3.5 text-rose-500" />
                  <span>Iklan Baru Hari Ini: <strong>{stats.newListingsToday}</strong></span>
                </div>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
