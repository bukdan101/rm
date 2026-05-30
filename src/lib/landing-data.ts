import { db } from './db'
import { CarListing } from '@/types/marketplace'

export interface LandingData {
  categories: Array<{
    id: string
    name: string
    icon: string
    count: number
    slug: string
  }>
  featuredListings: CarListing[]
  premiumBoostedListings: CarListing[]
  highlightedListingIds: string[]
  latestListings: CarListing[]
  popularListings: CarListing[]
  activeAuctions: any[]
}

// Body type icons mapping
const bodyTypeIcons: Record<string, string> = {
  'sedan': '🚗',
  'suv': '🚙',
  'mpv': '🚐',
  'hatchback': '🚘',
  'pickup': '🛻',
  'van': '🚚',
  'coupe': '🏎️',
  'electric': '⚡',
  'hybrid': '🔋',
  'lcgc': '🚗',
}

// Default categories for fallback (only used when database is unavailable)
const fallbackCategories = [
  { id: '1', name: 'Sedan', icon: '🚗', count: 0, slug: 'sedan' },
  { id: '2', name: 'SUV', icon: '🚙', count: 0, slug: 'suv' },
  { id: '3', name: 'MPV', icon: '🚐', count: 0, slug: 'mpv' },
  { id: '4', name: 'Hatchback', icon: '🚘', count: 0, slug: 'hatchback' },
  { id: '5', name: 'Pickup', icon: '🛻', count: 0, slug: 'pickup' },
  { id: '6', name: 'Van', icon: '🚚', count: 0, slug: 'van' },
]

// Fetch categories with counts from database
async function getCategoriesFromDB() {
  try {
    // Get count of listings by body_type
    const listingsData = await db.carListing.findMany({
      where: { status: 'active' },
      select: { body_type: true },
    })

    if (!listingsData || listingsData.length === 0) {
      return fallbackCategories
    }

    // Count by body_type
    const bodyTypeCounts: Record<string, number> = {}
    listingsData.forEach((listing) => {
      const bodyType = listing.body_type || 'sedan'
      bodyTypeCounts[bodyType] = (bodyTypeCounts[bodyType] || 0) + 1
    })

    // Convert to categories array
    const categories = Object.entries(bodyTypeCounts).map(([bodyType, count], index) => ({
      id: String(index + 1),
      name: bodyType.charAt(0).toUpperCase() + bodyType.slice(1),
      icon: bodyTypeIcons[bodyType] || '🚗',
      count,
      slug: bodyType.toLowerCase(),
    }))

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count)

    return categories.length > 0 ? categories : fallbackCategories
  } catch (error) {
    console.error('Error in getCategoriesFromDB:', error)
    return fallbackCategories
  }
}

export async function getLandingData(): Promise<LandingData> {
  try {
    // Fetch listings with relations from database
    const listingsData = await db.carListing.findMany({
      where: { status: 'active' },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true, country: true, is_popular: true, display_order: true, created_at: true } },
        model: { select: { id: true, brand_id: true, name: true, slug: true, body_type: true, is_popular: true, display_order: true, created_at: true } },
        images: {
          select: { id: true, car_listing_id: true, image_url: true, thumbnail_url: true, caption: true, is_primary: true, display_order: true, created_at: true },
          orderBy: { display_order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    // If no data, return empty state with categories
    if (!listingsData || listingsData.length === 0) {
      console.log('No listings in database, returning empty state')
      const categories = await getCategoriesFromDB()
      return {
        categories: categories || fallbackCategories,
        featuredListings: [],
        premiumBoostedListings: [],
        highlightedListingIds: [],
        latestListings: [],
        popularListings: [],
        activeAuctions: [],
      }
    }

    const listings = listingsData as unknown as CarListing[]
    console.log(`Loaded ${listings.length} listings from database`)

    // Get categories from database
    const categories = await getCategoriesFromDB()

    // Get featured listings (with higher prices as featured)
    const featuredListings = [...listings]
      .sort((a, b) => (b.price_cash || 0) - (a.price_cash || 0))
      .slice(0, 10)

    // Get premium/boosted listings
    const premiumBoostedListings = listings.slice(0, 4)

    // Highlighted IDs (premium listings)
    const highlightedListingIds = premiumBoostedListings.map(l => l.id)

    // Latest listings
    const latestListings = listings.slice(0, 10)

    // Popular listings (by view count)
    const popularListings = [...listings]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10)

    // Active auctions (placeholder - auction system not implemented)
    const activeAuctions: any[] = []

    return {
      categories: categories || fallbackCategories,
      featuredListings,
      premiumBoostedListings,
      highlightedListingIds,
      latestListings,
      popularListings,
      activeAuctions,
    }
  } catch (error) {
    console.error('Error in getLandingData:', error)
    return getEmptyState()
  }
}

// Empty state for error cases
function getEmptyState(): LandingData {
  return {
    categories: fallbackCategories,
    featuredListings: [],
    premiumBoostedListings: [],
    highlightedListingIds: [],
    latestListings: [],
    popularListings: [],
    activeAuctions: [],
  }
}

// Get featured listings only
export async function getFeaturedaListings(): Promise<CarListing[]> {
  try {
    const data = await db.carListing.findMany({
      where: {
        status: 'active',
        featured_until: { gte: new Date() },
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true, country: true, is_popular: true, display_order: true, created_at: true } },
        model: { select: { id: true, brand_id: true, name: true, slug: true, body_type: true, is_popular: true, display_order: true, created_at: true } },
        images: {
          select: { id: true, car_listing_id: true, image_url: true, thumbnail_url: true, caption: true, is_primary: true, display_order: true, created_at: true },
          orderBy: { display_order: 'asc' },
        },
      },
      take: 10,
    })

    return (data as unknown as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching featured listings:', error)
    return []
  }
}

// Get popular listings only
export async function getPopularListings(): Promise<CarListing[]> {
  try {
    const data = await db.carListing.findMany({
      where: { status: 'active' },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true, country: true, is_popular: true, display_order: true, created_at: true } },
        model: { select: { id: true, brand_id: true, name: true, slug: true, body_type: true, is_popular: true, display_order: true, created_at: true } },
        images: {
          select: { id: true, car_listing_id: true, image_url: true, thumbnail_url: true, caption: true, is_primary: true, display_order: true, created_at: true },
          orderBy: { display_order: 'asc' },
        },
      },
      orderBy: { view_count: 'desc' },
      take: 10,
    })

    return (data as unknown as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching popular listings:', error)
    return []
  }
}

// Get listings by body type
export async function getListingsByBodyType(bodyType: string): Promise<CarListing[]> {
  try {
    const data = await db.carListing.findMany({
      where: { status: 'active', body_type: bodyType },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true, country: true, is_popular: true, display_order: true, created_at: true } },
        model: { select: { id: true, brand_id: true, name: true, slug: true, body_type: true, is_popular: true, display_order: true, created_at: true } },
        images: {
          select: { id: true, car_listing_id: true, image_url: true, thumbnail_url: true, caption: true, is_primary: true, display_order: true, created_at: true },
          orderBy: { display_order: 'asc' },
        },
      },
      take: 20,
    })

    return (data as unknown as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching listings by body type:', error)
    return []
  }
}
