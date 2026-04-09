import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

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
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('created_at, role')

    // Fetch listings stats
    const { data: listingsData, error: listingsError } = await supabase
      .from('car_listings')
      .select('created_at, status, price, brand, model')

    // Fetch transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('created_at, amount, type, status')

    // Process analytics data
    const totalUsers = usersData?.length || 0
    const totalDealers = usersData?.filter(u => u.role === 'dealer').length || 0
    const totalRegularUsers = totalUsers - totalDealers

    const totalListings = listingsData?.length || 0
    const activeListings = listingsData?.filter(l => l.status === 'active').length || 0
    const soldListings = listingsData?.filter(l => l.status === 'sold').length || 0
    const pendingListings = listingsData?.filter(l => l.status === 'pending').length || 0

    // Calculate revenue
    const totalRevenue = transactionsData
      ?.filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0

    // Calculate daily data for charts
    const dailyUsers: Record<string, number> = {}
    const dailyListings: Record<string, number> = {}
    const dailyRevenue: Record<string, number> = {}

    usersData?.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      dailyUsers[date] = (dailyUsers[date] || 0) + 1
    })

    listingsData?.forEach(listing => {
      const date = new Date(listing.created_at).toISOString().split('T')[0]
      dailyListings[date] = (dailyListings[date] || 0) + 1
    })

    transactionsData?.forEach(tx => {
      if (tx.status === 'completed') {
        const date = new Date(tx.created_at).toISOString().split('T')[0]
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (Number(tx.amount) || 0)
      }
    })

    // Get top brands
    const brandCounts: Record<string, number> = {}
    listingsData?.forEach(listing => {
      if (listing.brand) {
        brandCounts[listing.brand] = (brandCounts[listing.brand] || 0) + 1
      }
    })
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Calculate growth rate
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const usersLastMonth = usersData?.filter(u => new Date(u.created_at) >= lastMonth).length || 0
    const usersMonthBefore = usersData?.filter(u => {
      const date = new Date(u.created_at)
      return date >= new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000) && date < lastMonth
    }).length || 0
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
