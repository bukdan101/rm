import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      )
    }

    // Get dealer info
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId },
      select: { id: true, name: true, status: true },
    })

    if (!dealer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dealer tidak ditemukan - Silakan daftar sebagai dealer terlebih dahulu',
          isDealer: false,
        },
        { status: 404 }
      )
    }

    // Check if dealer is verified
    if (dealer.status !== 'verified' && dealer.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dealer belum terverifikasi',
          dealerStatus: dealer.status,
        },
        { status: 403 }
      )
    }

    // Get total inventory count
    const totalInventory = await db.carListing.count({
      where: { dealer_id: dealer.id },
    })

    // Get active listings count
    const activeListings = await db.carListing.count({
      where: { dealer_id: dealer.id, status: 'active' },
    })

    // Get pending listings
    const pendingListings = await db.carListing.count({
      where: { dealer_id: dealer.id, status: 'pending' },
    })

    // Get sold this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const soldThisMonth = await db.carListing.count({
      where: {
        dealer_id: dealer.id,
        status: 'sold',
        updated_at: { gte: firstDayOfMonth },
      },
    })

    // Get total views
    const viewsData = await db.carListing.findMany({
      where: { dealer_id: dealer.id },
      select: { view_count: true },
    })
    const totalViews = viewsData.reduce((sum, item) => sum + (item.view_count || 0), 0)

    // Get dealer marketplace listings
    const dealerMarketplaceListings = await db.carListing.count({
      where: { dealer_id: dealer.id, visibility: 'dealer_only' },
    })

    // Get public marketplace listings
    const publicMarketplaceListings = await db.carListing.count({
      where: { dealer_id: dealer.id, visibility: 'public' },
    })

    // Get total inquiries (from conversations)
    const totalInquiries = await db.conversation.count({
      where: { seller_id: userId },
    })

    // Get pending inquiries
    const pendingInquiries = await db.conversation.count({
      where: { seller_id: userId, status: 'pending' },
    })

    // Get dealer offers received
    const totalOffers = await db.dealerOffer.count({
      where: { dealer_id: dealer.id },
    })

    // Calculate monthly revenue from sold cars
    const soldCars = await db.carListing.findMany({
      where: {
        dealer_id: dealer.id,
        status: 'sold',
        updated_at: { gte: firstDayOfMonth },
      },
      select: { price_cash: true },
    })
    const monthlyRevenue = soldCars.reduce((sum, car) => sum + (car.price_cash || 0), 0)

    // Get sales data for last 12 months
    const salesData: number[] = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const monthSales = await db.carListing.count({
        where: {
          dealer_id: dealer.id,
          status: 'sold',
          updated_at: { gte: monthStart, lt: monthEnd },
        },
      })

      salesData.push(monthSales)
    }

    // Get dealer rating
    const reviews = await db.dealerReview.findMany({
      where: { dealer_id: dealer.id },
      select: { rating: true },
    })

    const totalReviews = reviews.length
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        dealerId: dealer.id,
        dealerName: dealer.name,
        totalInventory,
        activeListings,
        pendingListings,
        soldThisMonth,
        totalViews,
        totalInquiries,
        pendingInquiries,
        totalOffers,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        monthlyRevenue,
        dealerMarketplaceListings,
        publicMarketplaceListings,
        salesData,
      },
    })
  } catch (error) {
    console.error('Dealer stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
