import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: errorResponse('Unauthorized', 401) }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: errorResponse('Admin access required', 403) }
  }
  return { authorized: true, userId }
}

// GET: Get admin dashboard stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    // Get total users count
    const totalUsers = await db.profile.count()

    // Get total dealers count
    const totalDealers = await db.dealer.count()

    // Get total listings count (not deleted)
    const totalListings = await db.carListing.count({
      where: { status: { not: 'deleted' } },
    })

    // Get pending KYC count
    const pendingKyc = await db.kycVerification.count({
      where: { status: 'pending' },
    })

    // Get pending dealer approval count
    const pendingDealerApproval = await db.dealer.count({
      where: { verified: false, is_active: true },
    })

    // Get total revenue from paid payments
    const paidPayments = await db.payment.findMany({
      where: { status: 'paid' },
      select: { amount: true },
    })
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Get token sales count (total credits awarded from paid payments)
    const creditsPayments = await db.payment.findMany({
      where: { status: 'paid' },
      select: { credits_awarded: true },
    })
    const tokenSales = creditsPayments.reduce((sum, p) => sum + (p.credits_awarded || 0), 0)

    // Get boost revenue from credit_transactions
    const boostTransactions = await db.creditTransaction.findMany({
      where: { type: 'boost' },
      select: { amount: true },
    })
    const boostRevenue = boostTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0)

    // Calculate monthly growth
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const usersThisMonth = await db.profile.count({
      where: { created_at: { gte: startOfThisMonth } },
    })

    const usersLastMonth = await db.profile.count({
      where: {
        created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    })

    let monthlyGrowth = 0
    if (usersLastMonth > 0) {
      monthlyGrowth = Math.round((usersThisMonth - usersLastMonth) / usersLastMonth * 100)
    } else if (usersThisMonth > 0) {
      monthlyGrowth = 100
    }

    // Additional stats
    const activeListings = await db.carListing.count({ where: { status: 'active' } })
    const pendingListings = await db.carListing.count({ where: { status: 'pending' } })
    const soldListings = await db.carListing.count({ where: { status: 'sold' } })
    const verifiedDealers = await db.dealer.count({ where: { verified: true, is_active: true } })
    const approvedKyc = await db.kycVerification.count({ where: { status: 'approved' } })
    const pendingPayments = await db.payment.count({ where: { status: 'pending' } })

    // Fetch chart data
    const monthlyData = await fetchMonthlyRevenueData()
    const userGrowth = await fetchUserGrowthData()
    const tokenUsage = await fetchTokenUsageData()

    return NextResponse.json({
      totalUsers,
      totalDealers,
      totalListings,
      pendingKyc,
      pendingDealerApproval,
      totalRevenue,
      tokenSales,
      boostRevenue,
      monthlyGrowth,
      monthlyData,
      userGrowth,
      tokenUsage,
      breakdown: {
        users: {
          total: totalUsers,
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
        },
        dealers: {
          total: totalDealers,
          verified: verifiedDealers,
          pending: pendingDealerApproval,
        },
        listings: {
          total: totalListings,
          active: activeListings,
          pending: pendingListings,
          sold: soldListings,
        },
        kyc: {
          pending: pendingKyc,
          approved: approvedKyc,
        },
        payments: {
          pending: pendingPayments,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return errorResponse('Internal server error', 500)
  }
}

// Fetch monthly revenue data for charts
async function fetchMonthlyRevenueData() {
  const year = new Date().getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const payments = await db.payment.findMany({
    where: {
      status: 'paid',
      created_at: { gte: startOfYear, lte: endOfYear },
    },
    select: { amount: true, credits_awarded: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData: Record<string, { revenue: number; tokens: number }> = {}

  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { revenue: 0, tokens: 0 }
  }

  payments.forEach((payment) => {
    if (payment.created_at) {
      const month = new Date(payment.created_at).toISOString().substring(5, 7)
      monthlyData[month].revenue += payment.amount || 0
      monthlyData[month].tokens += payment.credits_awarded || 0
    }
  })

  return Object.entries(monthlyData).map(([month, data], index) => ({
    name: months[index],
    revenue: data.revenue,
    tokens: data.tokens,
  }))
}

// Fetch user growth data for charts
async function fetchUserGrowthData() {
  const year = new Date().getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const profiles = await db.profile.findMany({
    where: {
      created_at: { gte: startOfYear, lte: endOfYear },
    },
    select: { id: true, role: true, created_at: true },
  })

  const dealers = await db.dealer.findMany({
    where: {
      created_at: { gte: startOfYear, lte: endOfYear },
    },
    select: { id: true, created_at: true },
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData: Record<string, { users: number; dealers: number }> = {}

  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { users: 0, dealers: 0 }
  }

  profiles.forEach((profile) => {
    if (profile.created_at) {
      const month = new Date(profile.created_at).toISOString().substring(5, 7)
      monthlyData[month].users += 1
    }
  })

  dealers.forEach((dealer) => {
    if (dealer.created_at) {
      const month = new Date(dealer.created_at).toISOString().substring(5, 7)
      monthlyData[month].dealers += 1
    }
  })

  return Object.entries(monthlyData).map(([month, data], index) => ({
    name: months[index],
    users: data.users,
    dealers: data.dealers,
  }))
}

// Fetch token usage data for pie chart
async function fetchTokenUsageData() {
  const transactions = await db.creditTransaction.findMany({
    where: {
      type: { in: ['listing', 'boost', 'prediction', 'dealer_contact'] },
    },
    select: { type: true, amount: true },
  })

  const usageStats = {
    listings: 0,
    boosts: 0,
    predictions: 0,
    dealer_contacts: 0,
  }

  transactions.forEach((tx) => {
    const amount = Math.abs(tx.amount || 0)
    switch (tx.type) {
      case 'listing':
        usageStats.listings += amount
        break
      case 'boost':
        usageStats.boosts += amount
        break
      case 'prediction':
        usageStats.predictions += amount
        break
      case 'dealer_contact':
        usageStats.dealer_contacts += amount
        break
    }
  })

  const total = usageStats.listings + usageStats.boosts + usageStats.predictions + usageStats.dealer_contacts

  if (total === 0) {
    return [
      { name: 'Listings', value: 45, color: '#8b5cf6' },
      { name: 'Boosts', value: 30, color: '#06b6d4' },
      { name: 'AI Predict', value: 15, color: '#f59e0b' },
      { name: 'Dealer Contact', value: 10, color: '#10b981' },
    ]
  }

  return [
    { name: 'Listings', value: Math.round((usageStats.listings / total) * 100), color: '#8b5cf6' },
    { name: 'Boosts', value: Math.round((usageStats.boosts / total) * 100), color: '#06b6d4' },
    { name: 'AI Predict', value: Math.round((usageStats.predictions / total) * 100), color: '#f59e0b' },
    { name: 'Dealer Contact', value: Math.round((usageStats.dealer_contacts / total) * 100), color: '#10b981' },
  ]
}
