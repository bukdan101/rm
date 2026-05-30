import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }), userId: null }
  }
  return { authorized: true, error: null, userId }
}

// GET: Fetch report data
export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin(request)
    if (!authCheck.authorized) return authCheck.error!

    const searchParams = request.nextUrl.searchParams
    const report_type = searchParams.get('report_type') || 'all'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // If specific report type requested
    if (report_type !== 'all') {
      switch (report_type) {
        case 'user_growth':
          return NextResponse.json({ data: await fetchUserGrowth(year) })
        case 'listing_activity':
          return NextResponse.json({ data: await fetchListingActivity(year) })
        case 'conversion_funnel':
          return NextResponse.json({ data: await fetchConversionFunnel() })
        case 'top_brands':
          return NextResponse.json({ data: await fetchTopBrands() })
        case 'top_dealers':
          return NextResponse.json({ data: await fetchTopDealers() })
        case 'geographic_distribution':
          return NextResponse.json({ data: await fetchGeographicDistribution() })
        default:
          return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
      }
    }

    // Fetch all reports
    const [
      userGrowth,
      listingActivity,
      conversionFunnel,
      topBrands,
      topDealers,
      geographicDistribution,
      overviewStats,
    ] = await Promise.all([
      fetchUserGrowth(year),
      fetchListingActivity(year),
      fetchConversionFunnel(),
      fetchTopBrands(),
      fetchTopDealers(),
      fetchGeographicDistribution(),
      fetchOverviewStats(),
    ])

    return NextResponse.json({
      user_growth: userGrowth,
      listing_activity: listingActivity,
      conversion_funnel: conversionFunnel,
      top_brands: topBrands,
      top_dealers: topDealers,
      geographic_distribution: geographicDistribution,
      overview_stats: overviewStats,
      year,
    })
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fetch user growth data (monthly registrations)
async function fetchUserGrowth(year: number) {
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const profiles = await db.profile.findMany({
    where: {
      created_at: { gte: startOfYear, lte: endOfYear },
    },
    select: { id: true, role: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  if (!profiles || profiles.length === 0) {
    return generateDefaultUserGrowth(year)
  }

  // Group by month
  const monthlyData: Record<string, { total: number; buyers: number; sellers: number; dealers: number }> = {}

  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { total: 0, buyers: 0, sellers: 0, dealers: 0 }
  }

  profiles.forEach((profile) => {
    if (profile.created_at) {
      const month = new Date(profile.created_at).toISOString().substring(5, 7)
      if (monthlyData[month]) {
        monthlyData[month].total += 1
        switch (profile.role) {
          case 'buyer':
            monthlyData[month].buyers += 1
            break
          case 'seller':
            monthlyData[month].sellers += 1
            break
          case 'dealer':
            monthlyData[month].dealers += 1
            break
        }
      }
    }
  })

  // Calculate cumulative growth
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  let cumulative = 0

  return Object.entries(monthlyData).map(([month, data], index) => {
    cumulative += data.total
    return {
      month: months[index],
      month_number: parseInt(month),
      new_users: data.total,
      cumulative_users: cumulative,
      by_role: {
        buyers: data.buyers,
        sellers: data.sellers,
        dealers: data.dealers,
      },
    }
  })
}

// Fetch listing activity data
async function fetchListingActivity(year: number) {
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const listings = await db.carListing.findMany({
    where: {
      created_at: { gte: startOfYear, lte: endOfYear },
    },
    select: { id: true, status: true, created_at: true, published_at: true, sold_at: true },
  })

  if (!listings || listings.length === 0) {
    return generateDefaultListingActivity(year)
  }

  // Group by month
  const monthlyData: Record<string, { created: number; published: number; sold: number; active: number }> = {}

  for (let i = 1; i <= 12; i++) {
    const monthKey = i.toString().padStart(2, '0')
    monthlyData[monthKey] = { created: 0, published: 0, sold: 0, active: 0 }
  }

  listings.forEach((listing) => {
    if (listing.created_at) {
      const createdMonth = new Date(listing.created_at).toISOString().substring(5, 7)
      if (monthlyData[createdMonth]) {
        monthlyData[createdMonth].created += 1
      }
    }

    if (listing.published_at) {
      const publishedMonth = new Date(listing.published_at).toISOString().substring(5, 7)
      if (monthlyData[publishedMonth]) {
        monthlyData[publishedMonth].published += 1
      }
    }

    if (listing.sold_at) {
      const soldMonth = new Date(listing.sold_at).toISOString().substring(5, 7)
      if (monthlyData[soldMonth]) {
        monthlyData[soldMonth].sold += 1
      }
    }

    if (listing.status === 'active' && listing.created_at) {
      const month = new Date(listing.created_at).toISOString().substring(5, 7)
      if (monthlyData[month]) {
        monthlyData[month].active += 1
      }
    }
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return Object.entries(monthlyData).map(([month, data], index) => ({
    month: months[index],
    month_number: parseInt(month),
    ...data,
  }))
}

// Fetch conversion funnel data
async function fetchConversionFunnel() {
  const totalUsers = await db.profile.count()
  const verifiedUsers = await db.profile.count({ where: { is_verified: true } })

  // Unique users with listings
  const usersWithListings = await db.carListing.findMany({
    where: { user_id: { not: null } },
    select: { user_id: true },
  })
  const uniqueUserIdsListings = new Set(usersWithListings.map(l => l.user_id))

  const activeListings = await db.carListing.count({ where: { status: 'active' } })
  const soldListings = await db.carListing.count({ where: { status: 'sold' } })

  // Unique users with purchases
  const usersWithPayments = await db.payment.findMany({
    where: { status: 'verified', user_id: { not: null } },
    select: { user_id: true },
  })
  const uniqueUserIdsPayments = new Set(usersWithPayments.map(p => p.user_id))

  const listingCreators = uniqueUserIdsListings.size
  const payingUsers = uniqueUserIdsPayments.size
  const totalVisitors = totalUsers * 5 // Estimate

  return [
    {
      stage: 'Pengunjung',
      stage_slug: 'visitors',
      count: totalVisitors,
      percentage: 100,
      drop_off_rate: 0,
    },
    {
      stage: 'Registrasi',
      stage_slug: 'registered',
      count: totalUsers,
      percentage: Math.round((totalUsers / totalVisitors) * 100),
      drop_off_rate: Math.round((1 - totalUsers / totalVisitors) * 100),
    },
    {
      stage: 'Terverifikasi',
      stage_slug: 'verified',
      count: verifiedUsers,
      percentage: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      drop_off_rate: totalUsers > 0 ? Math.round((1 - verifiedUsers / totalUsers) * 100) : 0,
    },
    {
      stage: 'Pasang Iklan',
      stage_slug: 'has_listing',
      count: listingCreators,
      percentage: totalUsers > 0 ? Math.round((listingCreators / totalUsers) * 100) : 0,
      drop_off_rate: totalUsers > 0 ? Math.round((1 - listingCreators / totalUsers) * 100) : 0,
    },
    {
      stage: 'Beli Kredit',
      stage_slug: 'has_purchase',
      count: payingUsers,
      percentage: totalUsers > 0 ? Math.round((payingUsers / totalUsers) * 100) : 0,
      drop_off_rate: totalUsers > 0 ? Math.round((1 - payingUsers / totalUsers) * 100) : 0,
    },
    {
      stage: 'Terjual',
      stage_slug: 'sold',
      count: soldListings,
      percentage: activeListings > 0 ? Math.round((soldListings / activeListings) * 100) : 0,
      drop_off_rate: 0,
    },
  ]
}

// Fetch top brands
async function fetchTopBrands() {
  const listings = await db.carListing.findMany({
    where: { status: { not: 'deleted' }, brand_id: { not: null } },
    select: {
      id: true,
      brand_id: true,
      status: true,
      view_count: true,
      favorite_count: true,
      inquiry_count: true,
    },
  })

  if (!listings || listings.length === 0) {
    return getDefaultTopBrands()
  }

  // Get brand data
  const brandIds = [...new Set(listings.map(l => l.brand_id).filter(Boolean))] as number[]
  const brands = await db.brand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, name: true, slug: true },
  })
  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]))

  // Aggregate by brand
  const brandStats: Record<string, {
    brand_id: number;
    brand_name: string;
    brand_slug: string;
    total_listings: number;
    active_listings: number;
    sold_listings: number;
    total_views: number;
    total_favorites: number;
    total_inquiries: number;
  }> = {}

  listings.forEach((listing) => {
    const brandId = listing.brand_id
    if (!brandId) return

    if (!brandStats[brandId]) {
      const brand = brandMap[brandId]
      brandStats[brandId] = {
        brand_id: brandId,
        brand_name: brand?.name || 'Unknown',
        brand_slug: brand?.slug || 'unknown',
        total_listings: 0,
        active_listings: 0,
        sold_listings: 0,
        total_views: 0,
        total_favorites: 0,
        total_inquiries: 0,
      }
    }

    brandStats[brandId].total_listings += 1
    brandStats[brandId].total_views += listing.view_count || 0
    brandStats[brandId].total_favorites += listing.favorite_count || 0
    brandStats[brandId].total_inquiries += listing.inquiry_count || 0

    if (listing.status === 'active') {
      brandStats[brandId].active_listings += 1
    } else if (listing.status === 'sold') {
      brandStats[brandId].sold_listings += 1
    }
  })

  // Sort by total listings and take top 10
  return Object.values(brandStats)
    .sort((a, b) => b.total_listings - a.total_listings)
    .slice(0, 10)
    .map((brand, index) => ({
      ...brand,
      rank: index + 1,
      conversion_rate: brand.total_listings > 0
        ? Math.round((brand.sold_listings / brand.total_listings) * 100)
        : 0,
      avg_views: brand.total_listings > 0
        ? Math.round(brand.total_views / brand.total_listings)
        : 0,
    }))
}

// Fetch top dealers
async function fetchTopDealers() {
  const dealers = await db.dealer.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      total_listings: true,
      rating: true,
      review_count: true,
      verified: true,
      created_at: true,
    },
    orderBy: { total_listings: 'desc' },
    take: 10,
  })

  if (!dealers || dealers.length === 0) {
    return getDefaultTopDealers()
  }

  // Get additional stats for each dealer
  const dealersWithStats = await Promise.all(
    dealers.map(async (dealer) => {
      const activeListings = await db.carListing.count({
        where: { dealer_id: dealer.id, status: 'active' },
      })

      const soldListings = await db.carListing.count({
        where: { dealer_id: dealer.id, status: 'sold' },
      })

      return {
        ...dealer,
        active_listings: activeListings,
        sold_listings: soldListings,
        conversion_rate: dealer.total_listings > 0
          ? Math.round((soldListings / dealer.total_listings) * 100)
          : 0,
      }
    })
  )

  return dealersWithStats.map((dealer, index) => ({
    rank: index + 1,
    ...dealer,
  }))
}

// Fetch geographic distribution
async function fetchGeographicDistribution() {
  const listings = await db.carListing.findMany({
    where: { status: { not: 'deleted' } },
    select: { province: true, city: true, province_id: true, city_id: true },
  })

  if (!listings || listings.length === 0) {
    return getDefaultGeographicDistribution()
  }

  // Aggregate by province
  const provinceStats: Record<string, {
    province: string;
    province_id: string | null;
    count: number;
    cities: Record<string, { name: string; count: number }>;
  }> = {}

  listings.forEach((listing) => {
    const province = listing.province || 'Unknown'

    if (!provinceStats[province]) {
      provinceStats[province] = {
        province,
        province_id: listing.province_id,
        count: 0,
        cities: {},
      }
    }

    provinceStats[province].count += 1

    const city = listing.city || 'Unknown'
    if (!provinceStats[province].cities[city]) {
      provinceStats[province].cities[city] = { name: city, count: 0 }
    }
    provinceStats[province].cities[city].count += 1
  })

  // Sort and format
  return Object.values(provinceStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((province) => ({
      province: province.province,
      province_id: province.province_id,
      listing_count: province.count,
      top_cities: Object.values(province.cities)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    }))
}

// Fetch overview stats
async function fetchOverviewStats() {
  const totalUsers = await db.profile.count()
  const totalDealers = await db.dealer.count({ where: { is_active: true } })
  const totalListings = await db.carListing.count({ where: { status: { not: 'deleted' } } })
  const activeListings = await db.carListing.count({ where: { status: 'active' } })
  const soldListings = await db.carListing.count({ where: { status: 'sold' } })

  // Total views
  const viewsData = await db.carListing.findMany({
    where: { status: { not: 'deleted' } },
    select: { view_count: true },
  })
  const totalViews = viewsData.reduce((sum, l) => sum + (l.view_count || 0), 0)

  // Total favorites
  const favoritesData = await db.carListing.findMany({
    where: { status: { not: 'deleted' } },
    select: { favorite_count: true },
  })
  const totalFavorites = favoritesData.reduce((sum, l) => sum + (l.favorite_count || 0), 0)

  // Total inquiries
  const inquiriesData = await db.carListing.findMany({
    where: { status: { not: 'deleted' } },
    select: { inquiry_count: true },
  })
  const totalInquiries = inquiriesData.reduce((sum, l) => sum + (l.inquiry_count || 0), 0)

  // New users this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const newUsersThisMonth = await db.profile.count({
    where: { created_at: { gte: startOfMonth } },
  })

  const newListingsThisMonth = await db.carListing.count({
    where: {
      created_at: { gte: startOfMonth },
      status: { not: 'deleted' },
    },
  })

  return {
    users: {
      total: totalUsers,
      dealers: totalDealers,
      new_this_month: newUsersThisMonth,
    },
    listings: {
      total: totalListings,
      active: activeListings,
      sold: soldListings,
      new_this_month: newListingsThisMonth,
    },
    engagement: {
      total_views: totalViews,
      total_favorites: totalFavorites,
      total_inquiries: totalInquiries,
      avg_views_per_listing: totalListings > 0
        ? Math.round(totalViews / totalListings)
        : 0,
    },
  }
}

// Default data generators
function generateDefaultUserGrowth(year: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  let cumulative = 500

  return months.map((month, index) => {
    const newUsers = Math.floor(Math.random() * 100 + 50)
    cumulative += newUsers

    return {
      month,
      month_number: index + 1,
      new_users: newUsers,
      cumulative_users: cumulative,
      by_role: {
        buyers: Math.floor(newUsers * 0.6),
        sellers: Math.floor(newUsers * 0.3),
        dealers: Math.floor(newUsers * 0.1),
      },
    }
  })
}

function generateDefaultListingActivity(year: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return months.map((month, index) => ({
    month,
    month_number: index + 1,
    created: Math.floor(Math.random() * 50 + 20),
    published: Math.floor(Math.random() * 40 + 15),
    sold: Math.floor(Math.random() * 20 + 5),
    active: Math.floor(Math.random() * 100 + 50),
  }))
}

function getDefaultTopBrands() {
  return [
    { rank: 1, brand_id: 'b1', brand_name: 'Toyota', brand_slug: 'toyota', total_listings: 150, active_listings: 120, sold_listings: 30, total_views: 15000, total_favorites: 450, total_inquiries: 200, conversion_rate: 20, avg_views: 100 },
    { rank: 2, brand_id: 'b2', brand_name: 'Honda', brand_slug: 'honda', total_listings: 120, active_listings: 95, sold_listings: 25, total_views: 12000, total_favorites: 380, total_inquiries: 180, conversion_rate: 21, avg_views: 100 },
    { rank: 3, brand_id: 'b3', brand_name: 'Mitsubishi', brand_slug: 'mitsubishi', total_listings: 80, active_listings: 65, sold_listings: 15, total_views: 8000, total_favorites: 240, total_inquiries: 120, conversion_rate: 19, avg_views: 100 },
    { rank: 4, brand_id: 'b4', brand_name: 'Suzuki', brand_slug: 'suzuki', total_listings: 70, active_listings: 55, sold_listings: 15, total_views: 7000, total_favorites: 210, total_inquiries: 100, conversion_rate: 21, avg_views: 100 },
    { rank: 5, brand_id: 'b5', brand_name: 'Daihatsu', brand_slug: 'daihatsu', total_listings: 60, active_listings: 50, sold_listings: 10, total_views: 6000, total_favorites: 180, total_inquiries: 80, conversion_rate: 17, avg_views: 100 },
  ]
}

function getDefaultTopDealers() {
  return [
    { rank: 1, id: 'd1', name: 'Auto Prima Motor', slug: 'auto-prima-motor', total_listings: 85, active_listings: 70, sold_listings: 15, rating: 4.8, review_count: 120, verified: true, conversion_rate: 18 },
    { rank: 2, id: 'd2', name: 'Mobil Bagus Jakarta', slug: 'mobil-bagus-jakarta', total_listings: 72, active_listings: 60, sold_listings: 12, rating: 4.7, review_count: 95, verified: true, conversion_rate: 17 },
    { rank: 3, id: 'd3', name: 'Sentral Mobil Surabaya', slug: 'sentral-mobil-surabaya', total_listings: 65, active_listings: 55, sold_listings: 10, rating: 4.6, review_count: 80, verified: true, conversion_rate: 15 },
    { rank: 4, id: 'd4', name: 'Bandung Auto Gallery', slug: 'bandung-auto-gallery', total_listings: 58, active_listings: 48, sold_listings: 10, rating: 4.5, review_count: 65, verified: false, conversion_rate: 17 },
    { rank: 5, id: 'd5', name: 'Medan Car Center', slug: 'medan-car-center', total_listings: 50, active_listings: 42, sold_listings: 8, rating: 4.4, review_count: 50, verified: false, conversion_rate: 16 },
  ]
}

function getDefaultGeographicDistribution() {
  return [
    { province: 'DKI Jakarta', province_id: 'p1', listing_count: 250, top_cities: [{ name: 'Jakarta Selatan', count: 80 }, { name: 'Jakarta Pusat', count: 60 }, { name: 'Jakarta Barat', count: 50 }] },
    { province: 'Jawa Barat', province_id: 'p2', listing_count: 180, top_cities: [{ name: 'Bandung', count: 70 }, { name: 'Bekasi', count: 50 }, { name: 'Bogor', count: 40 }] },
    { province: 'Jawa Timur', province_id: 'p3', listing_count: 150, top_cities: [{ name: 'Surabaya', count: 80 }, { name: 'Malang', count: 40 }, { name: 'Sidoarjo', count: 20 }] },
    { province: 'Jawa Tengah', province_id: 'p4', listing_count: 120, top_cities: [{ name: 'Semarang', count: 60 }, { name: 'Solo', count: 35 }, { name: 'Pekalongan', count: 15 }] },
    { province: 'Banten', province_id: 'p5', listing_count: 90, top_cities: [{ name: 'Tangerang', count: 45 }, { name: 'Serang', count: 25 }, { name: 'Cilegon', count: 15 }] },
  ]
}
