'use client'

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  walletBalance: number
  creditsBalance: number
  activeListings: number
  totalListings: number
  totalOrders: number
  pendingOrders: number
  unreadMessages: number
  totalViews: number
  totalFavorites: number
  kycStatus: string
}

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  created_at: string
}

interface Listing {
  id: string
  title: string
  price: number
  status: string
  view_count: number
  listing_images?: { image_url: string; is_primary: boolean }[]
}

interface Order {
  id: string
  amount: number
  status: string
  created_at: string
  listing?: {
    title: string
  }
}

interface UseDashboardDataReturn {
  stats: DashboardStats
  transactions: Transaction[]
  listings: Listing[]
  orders: Order[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const defaultStats: DashboardStats = {
  walletBalance: 0,
  creditsBalance: 0,
  activeListings: 0,
  totalListings: 0,
  totalOrders: 0,
  pendingOrders: 0,
  unreadMessages: 0,
  totalViews: 0,
  totalFavorites: 0,
  kycStatus: 'not_submitted',
}

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, transactionsRes, listingsRes, ordersRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/wallet/transactions?limit=5'),
        fetch('/api/my-listings?limit=8'),
        fetch('/api/orders?limit=5'),
      ])

      // Process stats
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats({
          walletBalance: statsData.walletBalance || 0,
          creditsBalance: statsData.tokenBalance || statsData.creditsBalance || 0,
          activeListings: statsData.activeListings || 0,
          totalListings: statsData.totalListings || 0,
          totalOrders: statsData.totalOrders || 0,
          pendingOrders: statsData.pendingOrders || 0,
          unreadMessages: statsData.unreadMessages || 0,
          totalViews: statsData.totalViews || 0,
          totalFavorites: statsData.totalFavorites || 0,
          kycStatus: statsData.kycStatus || 'not_submitted',
        })
      }

      // Process transactions
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.transactions || [])
      }

      // Process listings
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setListings(listingsData.listings || [])
      }

      // Process orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    stats,
    transactions,
    listings,
    orders,
    loading,
    error,
    refresh: fetchData,
  }
}
