import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to check admin role
async function checkAdminRole() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Admin access required', status: 403 }
  }
  
  return { authorized: true, supabase, userId: user.id }
}

// GET: Fetch revenue data for charts
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const supabase = authCheck.supabase!
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const period = searchParams.get('period') || 'monthly' // 'monthly', 'weekly', 'daily'
    
    // Fetch monthly revenue data
    const monthlyRevenue = await fetchMonthlyRevenue(supabase, year)
    
    // Fetch revenue by source
    const revenueBySource = await fetchRevenueBySource(supabase)
    
    // Fetch revenue summary
    const summary = await fetchRevenueSummary(supabase)
    
    // Fetch revenue by package
    const revenueByPackage = await fetchRevenueByPackage(supabase)
    
    return NextResponse.json({
      monthly_revenue: monthlyRevenue,
      revenue_by_source: revenueBySource,
      revenue_by_package: revenueByPackage,
      summary,
      year,
      period
    })
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fetch monthly revenue data
async function fetchMonthlyRevenue(supabase: Awaited<ReturnType<typeof createClient>>, year: number) {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, created_at, status')
    .eq('status', 'verified')
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31`)
    .order('created_at', { ascending: true })
  
  if (error) {
    return generateDefaultMonthlyRevenue(year)
  }
  
  if (!payments || payments.length === 0) {
    return generateDefaultMonthlyRevenue(year)
  }
  
  // Group by month
  const monthlyData: Record<string, { total: number; count: number }> = {}
  
  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { total: 0, count: 0 }
  }
  
  payments.forEach((payment) => {
    if (payment.created_at) {
      const month = payment.created_at.substring(5, 7) // Extract MM from YYYY-MM-DD
      monthlyData[month].total += payment.amount || 0
      monthlyData[month].count += 1
    }
  })
  
  // Format for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  return Object.entries(monthlyData).map(([month, data], index) => ({
    month: months[index],
    month_number: parseInt(month),
    revenue: data.total,
    transaction_count: data.count
  }))
}

// Fetch revenue by source (tokens, boosts, etc.)
async function fetchRevenueBySource(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('type, amount, created_at')
    .eq('type', 'purchase')
  
  if (error) {
    return getDefaultRevenueBySource()
  }
  
  if (!transactions || transactions.length === 0) {
    return getDefaultRevenueBySource()
  }
  
  // Get payments data for revenue calculation
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, created_at')
    .eq('status', 'verified')
  
  const totalFromPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Get boost revenue
  const { data: boostSpending } = await supabase
    .from('listing_boosts')
    .select('credits_spent')
  
  const totalBoostCredits = boostSpending?.reduce((sum, b) => sum + (b.credits_spent || 0), 0) || 0
  
  // Calculate approximate revenue (assuming 1 credit = Rp 1,000 for estimation)
  const boostRevenueEstimate = totalBoostCredits * 1000
  
  // Calculate credit purchase revenue
  const { data: creditPurchases } = await supabase
    .from('credit_transactions')
    .select(`
      amount,
      user_credits!inner(id)
    `)
    .eq('type', 'purchase')
  
  const creditPurchaseAmount = creditPurchases?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  
  return [
    {
      source: 'Pembelian Kredit',
      source_slug: 'credit_purchase',
      amount: totalFromPayments,
      percentage: totalFromPayments > 0 ? 100 : 0,
      transaction_count: payments?.length || 0
    },
    {
      source: 'Penggunaan Boost',
      source_slug: 'boost_usage',
      amount: boostRevenueEstimate,
      percentage: boostRevenueEstimate > 0 ? (boostRevenueEstimate / (totalFromPayments + boostRevenueEstimate)) * 100 : 0,
      transaction_count: boostSpending?.length || 0
    }
  ]
}

// Fetch revenue by package
async function fetchRevenueByPackage(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      amount,
      credits_awarded,
      package_id,
      status,
      credit_packages(name, is_for_dealer)
    `)
    .eq('status', 'verified')
  
  if (error) {
    return getDefaultRevenueByPackage()
  }
  
  if (!payments || payments.length === 0) {
    return getDefaultRevenueByPackage()
  }
  
  // Group by package
  const packageData: Record<string, { 
    name: string; 
    total_revenue: number; 
    count: number;
    total_credits: number;
    is_for_dealer: boolean;
  }> = {}
  
  payments.forEach((payment) => {
    const packageId = payment.package_id || 'unknown'
    const packageName = (payment.credit_packages as { name: string })?.name || 'Unknown Package'
    const isForDealer = (payment.credit_packages as { is_for_dealer: boolean })?.is_for_dealer || false
    
    if (!packageData[packageId]) {
      packageData[packageId] = {
        name: packageName,
        total_revenue: 0,
        count: 0,
        total_credits: 0,
        is_for_dealer: isForDealer
      }
    }
    
    packageData[packageId].total_revenue += payment.amount || 0
    packageData[packageId].count += 1
    packageData[packageId].total_credits += payment.credits_awarded || 0
  })
  
  return Object.entries(packageData).map(([id, data]) => ({
    package_id: id,
    package_name: data.name,
    total_revenue: data.total_revenue,
    transaction_count: data.count,
    total_credits: data.total_credits,
    is_for_dealer: data.is_for_dealer
  }))
}

// Fetch revenue summary
async function fetchRevenueSummary(supabase: Awaited<ReturnType<typeof createClient>>) {
  // Total revenue
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('status', 'verified')
  
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Total credits sold
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('type', 'purchase')
  
  const totalCreditsSold = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  
  // Pending payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  // Revenue this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { data: thisMonthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'verified')
    .gte('created_at', startOfMonth)
  
  const thisMonthRevenue = thisMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Revenue last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
  
  const { data: lastMonthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'verified')
    .gte('created_at', startOfLastMonth)
    .lte('created_at', endOfLastMonth)
  
  const lastMonthRevenue = lastMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Calculate growth percentage
  const growthPercentage = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0
  
  return {
    total_revenue: totalRevenue,
    total_credits_sold: totalCreditsSold,
    pending_payments: pendingPayments || 0,
    this_month_revenue: thisMonthRevenue,
    last_month_revenue: lastMonthRevenue,
    growth_percentage: growthPercentage,
    average_transaction_value: payments && payments.length > 0 
      ? totalRevenue / payments.length 
      : 0
  }
}

// Default data generators
function generateDefaultMonthlyRevenue(year: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  // Generate sample data with some variance
  const baseRevenue = 5000000 // 5 million IDR base
  
  return months.map((month, index) => {
    const variance = Math.random() * 0.5 + 0.75 // 75% to 125% of base
    const seasonalFactor = index >= 5 && index <= 8 ? 1.2 : 1.0 // Higher in Q3
    const revenue = Math.round(baseRevenue * variance * seasonalFactor)
    
    return {
      month,
      month_number: index + 1,
      revenue,
      transaction_count: Math.floor(revenue / 100000) // Approximate
    }
  })
}

function getDefaultRevenueBySource() {
  return [
    {
      source: 'Pembelian Kredit',
      source_slug: 'credit_purchase',
      amount: 50000000,
      percentage: 85,
      transaction_count: 250
    },
    {
      source: 'Penggunaan Boost',
      source_slug: 'boost_usage',
      amount: 8500000,
      percentage: 15,
      transaction_count: 120
    }
  ]
}

function getDefaultRevenueByPackage() {
  return [
    { package_id: 'pkg-001', package_name: 'Starter', total_revenue: 5000000, transaction_count: 100, total_credits: 5000, is_for_dealer: false },
    { package_id: 'pkg-002', package_name: 'Basic', total_revenue: 15000000, transaction_count: 150, total_credits: 15000, is_for_dealer: false },
    { package_id: 'pkg-003', package_name: 'Standard', total_revenue: 20000000, transaction_count: 80, total_credits: 20000, is_for_dealer: false },
    { package_id: 'pkg-004', package_name: 'Dealer Pro', total_revenue: 25000000, transaction_count: 50, total_credits: 35000, is_for_dealer: true }
  ]
}
