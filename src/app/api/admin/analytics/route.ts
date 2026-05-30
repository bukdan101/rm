import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }
  return { authorized: true, userId }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch user stats
    const usersData = await db.profile.findMany({
      select: { created_at: true, role: true },
    })

    // Fetch listings stats
    const listingsData = await db.carListing.findMany({
      select: { created_at: true, status: true, price_cash: true, brand_id: true },
    })

    // Fetch transactions
    const transactionsData = await db.transaction.findMany({
      select: { created_at: true, amount: true, type: true, status: true },
    })

    // Process analytics data
    const totalUsers = usersData.length
    const totalDealers = usersData.filter(u => u.role === 'dealer').length
    const totalRegularUsers = totalUsers - totalDealers

    const totalListings = listingsData.length
    const activeListings = listingsData.filter(l => l.status === 'active').length
    const soldListings = listingsData.filter(l => l.status === 'sold').length
    const pendingListings = listingsData.filter(l => l.status === 'pending').length

    // Calculate revenue
    const totalRevenue = transactionsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate daily data for charts
    const dailyUsers: Record<string, number> = {}
    const dailyListings: Record<string, number> = {}
    const dailyRevenue: Record<string, number> = {}

    usersData.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      dailyUsers[date] = (dailyUsers[date] || 0) + 1
    })

    listingsData.forEach(listing => {
      const date = new Date(listing.created_at).toISOString().split('T')[0]
      dailyListings[date] = (dailyListings[date] || 0) + 1
    })

    transactionsData.forEach(tx => {
      if (tx.status === 'completed') {
        const date = new Date(tx.created_at).toISOString().split('T')[0]
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (tx.amount || 0)
      }
    })

    // Get top brands via brand_id
    const brandCounts: Record<string, number> = {}
    const brandIds = [...new Set(listingsData.map(l => l.brand_id).filter(Boolean))] as number[]
    const brands = await db.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    })
    const brandMap = Object.fromEntries(brands.map(b => [b.id, b.name]))

    listingsData.forEach(listing => {
      if (listing.brand_id) {
        const brandName = brandMap[listing.brand_id] || 'Unknown'
        brandCounts[brandName] = (brandCounts[brandName] || 0) + 1
      }
    })
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Calculate growth rate
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const usersLastMonth = usersData.filter(u => new Date(u.created_at) >= lastMonth).length
    const usersMonthBefore = usersData.filter(u => {
      const date = new Date(u.created_at)
      return date >= new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000) && date < lastMonth
    }).length
    const userGrowthRate = usersMonthBefore > 0
      ? ((usersLastMonth - usersMonthBefore) / usersMonthBefore * 100).toFixed(1)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDealers,
          totalRegularUsers,
          totalListings,
          activeListings,
          soldListings,
          pendingListings,
          totalRevenue,
          userGrowthRate,
        },
        charts: {
          dailyUsers: Object.entries(dailyUsers)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30),
          dailyListings: Object.entries(dailyListings)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30),
          dailyRevenue: Object.entries(dailyRevenue)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30),
        },
        topBrands,
        period,
      },
    })
  } catch (error) {
    console.error('Error in admin analytics API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
