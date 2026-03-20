import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Silakan login terlebih dahulu' 
      }, { status: 401 })
    }

    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, name, status')
      .eq('owner_id', user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dealer tidak ditemukan - Silakan daftar sebagai dealer terlebih dahulu',
        isDealer: false
      }, { status: 404 })
    }

    // Check if dealer is verified
    if (dealer.status !== 'verified' && dealer.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Dealer belum terverifikasi',
        dealerStatus: dealer.status
      }, { status: 403 })
    }

    // Get total inventory count
    const { count: totalInventory } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)

    // Get active listings count
    const { count: activeListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .eq('status', 'active')

    // Get pending listings
    const { count: pendingListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .eq('status', 'pending')

    // Get sold this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)
    
    const { count: soldThisMonth } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .eq('status', 'sold')
      .gte('updated_at', firstDayOfMonth.toISOString())

    // Get total views
    const { data: viewsData } = await supabase
      .from('car_listings')
      .select('view_count')
      .eq('dealer_id', dealer.id)

    const totalViews = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0

    // Get dealer marketplace listings
    const { count: dealerMarketplaceListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .eq('visibility', 'dealer_only')

    // Get public marketplace listings
    const { count: publicMarketplaceListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .eq('visibility', 'public')

    // Get total inquiries (from conversations)
    const { count: totalInquiries } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)

    // Get pending inquiries
    const { count: pendingInquiries } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .eq('status', 'pending')

    // Get dealer offers received
    const { count: totalOffers } = await supabase
      .from('dealer_offers')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)

    // Calculate monthly revenue from sold cars
    const { data: soldCars } = await supabase
      .from('car_listings')
      .select('price_cash')
      .eq('dealer_id', dealer.id)
      .eq('status', 'sold')
      .gte('updated_at', firstDayOfMonth.toISOString())

    const monthlyRevenue = soldCars?.reduce((sum, car) => sum + (car.price_cash || 0), 0) || 0

    // Get sales data for last 12 months
    const salesData: number[] = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      
      const { count: monthSales } = await supabase
        .from('car_listings')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', dealer.id)
        .eq('status', 'sold')
        .gte('updated_at', monthStart.toISOString())
        .lt('updated_at', monthEnd.toISOString())
      
      salesData.push(monthSales || 0)
    }

    // Get dealer rating
    const { data: reviews } = await supabase
      .from('dealer_reviews')
      .select('rating')
      .eq('dealer_id', dealer.id)

    const totalReviews = reviews?.length || 0
    const avgRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        dealerId: dealer.id,
        dealerName: dealer.name,
        totalInventory: totalInventory || 0,
        activeListings: activeListings || 0,
        pendingListings: pendingListings || 0,
        soldThisMonth: soldThisMonth || 0,
        totalViews,
        totalInquiries: totalInquiries || 0,
        pendingInquiries: pendingInquiries || 0,
        totalOffers: totalOffers || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        monthlyRevenue,
        dealerMarketplaceListings: dealerMarketplaceListings || 0,
        publicMarketplaceListings: publicMarketplaceListings || 0,
        salesData,
      },
    })
  } catch (error) {
    console.error('Dealer stats error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    }, { status: 500 })
  }
}
