import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get admin dashboard stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get total dealers count
    const { count: totalDealers } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
    
    // Get total listings count
    const { count: totalListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')
    
    // Get pending KYC count
    const { count: pendingKyc } = await supabase
      .from('kyc_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    // Get pending dealer approval count (dealers that are not verified)
    const { count: pendingDealerApproval } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false)
      .eq('is_active', true)
    
    // Get total revenue from verified payments
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'verified')
    
    const totalRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
    
    // Get token sales count (total credits awarded from verified payments)
    const { data: creditsData } = await supabase
      .from('payments')
      .select('credits_awarded')
      .eq('status', 'verified')
    
    const tokenSales = creditsData?.reduce((sum, payment) => sum + (payment.credits_awarded || 0), 0) || 0
    
    // Get boost revenue (total credits spent on boosts)
    const { data: boostData } = await supabase
      .from('listing_boosts')
      .select('credits_spent')
      .eq('is_active', true)
    
    const boostRevenue = boostData?.reduce((sum, boost) => sum + (boost.credits_spent || 0), 0) || 0
    
    // Get active boosts count
    const { count: activeBoosts } = await supabase
      .from('listing_boosts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Calculate monthly growth (users created this month vs last month)
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Users this month
    const { count: usersThisMonth } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonth.toISOString())
    
    // Users last month
    const { count: usersLastMonth } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())
    
    // Calculate growth percentage
    let monthlyGrowth = 0
    if (usersLastMonth && usersLastMonth > 0) {
      monthlyGrowth = Math.round(((usersThisMonth || 0) - usersLastMonth) / usersLastMonth * 100)
    } else if (usersThisMonth && usersThisMonth > 0) {
      monthlyGrowth = 100 // If no users last month but have users this month
    }
    
    // Get additional useful stats
    // Active listings
    const { count: activeListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Pending listings
    const { count: pendingListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    // Sold listings
    const { count: soldListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold')
    
    // Verified dealers
    const { count: verifiedDealers } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true)
      .eq('is_active', true)
    
    // Approved KYC
    const { count: approvedKyc } = await supabase
      .from('kyc_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    // Pending payments
    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    // Fetch monthly data for charts
    const monthlyData = await fetchMonthlyRevenueData(supabase)
    const userGrowth = await fetchUserGrowthData(supabase)
    const tokenUsage = await fetchTokenUsageData(supabase)

    return NextResponse.json({
      // Primary stats
      totalUsers: totalUsers || 0,
      totalDealers: totalDealers || 0,
      totalListings: totalListings || 0,
      pendingKyc: pendingKyc || 0,
      pendingDealerApproval: pendingDealerApproval || 0,
      totalRevenue,
      tokenSales,
      boostRevenue,
      activeBoosts: activeBoosts || 0,
      monthlyGrowth,
      
      // Chart data
      monthlyData,
      userGrowth,
      tokenUsage,
      
      // Additional stats
      breakdown: {
        users: {
          total: totalUsers || 0,
          thisMonth: usersThisMonth || 0,
          lastMonth: usersLastMonth || 0
        },
        dealers: {
          total: totalDealers || 0,
          verified: verifiedDealers || 0,
          pending: pendingDealerApproval || 0
        },
        listings: {
          total: totalListings || 0,
          active: activeListings || 0,
          pending: pendingListings || 0,
          sold: soldListings || 0
        },
        kyc: {
          pending: pendingKyc || 0,
          approved: approvedKyc || 0
        },
        payments: {
          pending: pendingPayments || 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fetch monthly revenue data for charts
async function fetchMonthlyRevenueData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const year = new Date().getFullYear()
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, created_at, credits_awarded')
    .eq('status', 'verified')
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31`)
    .order('created_at', { ascending: true })
  
  // Initialize monthly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData: Record<string, { revenue: number; tokens: number }> = {}
  
  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { revenue: 0, tokens: 0 }
  }
  
  if (payments && !error) {
    payments.forEach((payment) => {
      if (payment.created_at) {
        const month = payment.created_at.substring(5, 7)
        monthlyData[month].revenue += payment.amount || 0
        monthlyData[month].tokens += payment.credits_awarded || 0
      }
    })
  }
  
  return Object.entries(monthlyData).map(([month, data], index) => ({
    name: months[index],
    revenue: data.revenue,
    tokens: data.tokens
  }))
}

// Fetch user growth data for charts
async function fetchUserGrowthData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const year = new Date().getFullYear()
  
  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role, created_at')
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31`)
  
  // Get dealers
  const { data: dealers } = await supabase
    .from('dealers')
    .select('id, created_at')
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31`)
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData: Record<string, { users: number; dealers: number }> = {}
  
  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { users: 0, dealers: 0 }
  }
  
  if (profiles) {
    profiles.forEach((profile) => {
      if (profile.created_at) {
        const month = profile.created_at.substring(5, 7)
        monthlyData[month].users += 1
      }
    })
  }
  
  if (dealers) {
    dealers.forEach((dealer) => {
      if (dealer.created_at) {
        const month = dealer.created_at.substring(5, 7)
        monthlyData[month].dealers += 1
      }
    })
  }
  
  return Object.entries(monthlyData).map(([month, data], index) => ({
    name: months[index],
    users: data.users,
    dealers: data.dealers
  }))
}

// Fetch token usage data for pie chart
async function fetchTokenUsageData(supabase: Awaited<ReturnType<typeof createClient>>) {
  // Get credit transactions grouped by type
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('type, amount')
    .in('type', ['listing', 'boost', 'prediction', 'dealer_contact'])
  
  const usageStats = {
    listings: 0,
    boosts: 0,
    predictions: 0,
    dealer_contacts: 0
  }
  
  if (transactions) {
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
  }
  
  const total = usageStats.listings + usageStats.boosts + usageStats.predictions + usageStats.dealer_contacts
  
  // If no data, return default distribution
  if (total === 0) {
    return [
      { name: 'Listings', value: 45, color: '#8b5cf6' },
      { name: 'Boosts', value: 30, color: '#06b6d4' },
      { name: 'AI Predict', value: 15, color: '#f59e0b' },
      { name: 'Dealer Contact', value: 10, color: '#10b981' }
    ]
  }
  
  return [
    { name: 'Listings', value: Math.round((usageStats.listings / total) * 100), color: '#8b5cf6' },
    { name: 'Boosts', value: Math.round((usageStats.boosts / total) * 100), color: '#06b6d4' },
    { name: 'AI Predict', value: Math.round((usageStats.predictions / total) * 100), color: '#f59e0b' },
    { name: 'Dealer Contact', value: Math.round((usageStats.dealer_contacts / total) * 100), color: '#10b981' }
  ]
}
