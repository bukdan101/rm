import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabase = getSupabaseAdmin()

export async function GET() {
  try {
    // Get counts for different notification types
    const [
      kycResult,
      dealerResult,
      paymentResult,
      userResult,
      listingResult,
    ] = await Promise.all([
      // Pending KYC
      supabase.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Pending dealer approvals
      supabase.from('dealers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Pending payments
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // New users today
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
      
      // New listings today
      supabase.from('car_listings').select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    ])

    const pendingKyc = kycResult.count || 0
    const pendingDealer = dealerResult.count || 0
    const pendingPayments = paymentResult.count || 0
    const newUsersToday = userResult.count || 0
    const newListingsToday = listingResult.count || 0

    // Build notifications array based on actual data
    const notifications = []

    // KYC notifications - HIGH priority
    if (pendingKyc > 0) {
      notifications.push({
        id: 'kyc-pending',
        type: 'kyc',
        title: 'KYC Pending',
        message: `${pendingKyc} verifikasi KYC menunggu review`,
        count: pendingKyc,
        link: '/admin/kyc',
        priority: 'high',
        created_at: new Date().toISOString(),
      })
    }

    // Dealer approval notifications - MEDIUM priority
    if (pendingDealer > 0) {
      notifications.push({
        id: 'dealer-pending',
        type: 'dealer',
        title: 'Dealer Approval',
        message: `${pendingDealer} dealer menunggu approval`,
        count: pendingDealer,
        link: '/admin/dealers',
        priority: 'medium',
        created_at: new Date().toISOString(),
      })
    }

    // Payment notifications - HIGH priority
    if (pendingPayments > 0) {
      notifications.push({
        id: 'payment-pending',
        type: 'payment',
        title: 'Payment Verification',
        message: `${pendingPayments} pembayaran menunggu verifikasi`,
        count: pendingPayments,
        link: '/admin/payments',
        priority: 'high',
        created_at: new Date().toISOString(),
      })
    }

    // New users notification - LOW priority
    if (newUsersToday > 0) {
      notifications.push({
        id: 'new-users',
        type: 'user',
        title: 'New Users',
        message: `${newUsersToday} user baru mendaftar hari ini`,
        count: newUsersToday,
        link: '/admin/users',
        priority: 'low',
        created_at: new Date().toISOString(),
      })
    }

    // New listings notification - LOW priority
    if (newListingsToday > 0) {
      notifications.push({
        id: 'new-listings',
        type: 'listing',
        title: 'New Listings',
        message: `${newListingsToday} iklan baru hari ini`,
        count: newListingsToday,
        link: '/admin/listings',
        priority: 'low',
        created_at: new Date().toISOString(),
      })
    }

    // Unread count = high + medium priority items
    const unreadCount = notifications.filter(n => n.priority === 'high' || n.priority === 'medium').length

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      stats: {
        pendingKyc,
        pendingDealer,
        pendingPayments,
        newUsersToday,
        newListingsToday,
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({
      success: false,
      notifications: [],
      unreadCount: 0,
      stats: {
        pendingKyc: 0,
        pendingDealer: 0,
        pendingPayments: 0,
        newUsersToday: 0,
        newListingsToday: 0,
      }
    }, { status: 500 })
  }
}
