'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
}

export interface UseNotificationsOptions {
  pollingInterval?: number // in milliseconds, default 30000 (30 seconds)
  enabled?: boolean
}

export interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { pollingInterval = 30000, enabled = true } = options
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/notifications?user_id=${user.id}&limit=20`)
      const data = await res.json()

      if (data.success && mountedRef.current) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      if (mountedRef.current) {
        setError('Gagal memuat notifikasi')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
          action: 'read'
        })
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          action: 'read_all'
        })
      })

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [user])

  // Initial fetch and polling setup
  useEffect(() => {
    mountedRef.current = true

    if (user && enabled) {
      fetchNotifications()

      // Setup polling
      pollingRef.current = setInterval(fetchNotifications, pollingInterval)
    }

    return () => {
      mountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user, enabled, pollingInterval, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}

// Hook for active offers count with polling
export interface UseActiveOffersOptions {
  pollingInterval?: number
  enabled?: boolean
}

export interface UseActiveOffersReturn {
  activeCount: number
  newCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useActiveOffers(options: UseActiveOffersOptions = {}): UseActiveOffersReturn {
  const { pollingInterval = 30000, enabled = true } = options
  const { user } = useAuth()
  const [activeCount, setActiveCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchCount = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/dealer-marketplace/offers/count?user_id=${user.id}`)
      const data = await res.json()

      if (data.success && mountedRef.current) {
        setActiveCount(data.active_count || 0)
        setNewCount(data.new_count || 0)
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching offers count:', err)
      if (mountedRef.current) {
        setError('Gagal memuat jumlah penawaran')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    mountedRef.current = true

    if (user && enabled) {
      fetchCount()
      pollingRef.current = setInterval(fetchCount, pollingInterval)
    }

    return () => {
      mountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user, enabled, pollingInterval, fetchCount])

  return {
    activeCount,
    newCount,
    loading,
    error,
    refetch: fetchCount
  }
}
