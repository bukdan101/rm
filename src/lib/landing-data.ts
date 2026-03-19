import { supabase } from './supabase'
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
    const { data: listingsData, error } = await supabase
      .from('car_listings')
      .select('body_type')
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching categories:', error)
      return null
    }

    if (!listingsData || listingsData.length === 0) {
      return fallbackCategories
    }

    // Count by body_type
    const bodyTypeCounts: Record<string, number> = {}
    listingsData.forEach((listing: { body_type: string }) => {
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
    // Fetch listings with relations from database using correct foreign key syntax
    const { data: listingsData, error: listingsError } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands!car_listings_brand_id_fkey(id, name, slug, logo_url, country, is_popular, display_order, created_at),
        model:car_models!car_listings_model_id_fkey(id, brand_id, name, slug, body_type, is_popular, display_order, created_at),
        images:car_images(id, car_listing_id, image_url, thumbnail_url, caption, is_primary, display_order, created_at)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    // If database error, throw to trigger fallback
    if (listingsError) {
      console.error('Database error:', listingsError)
      throw listingsError
    }

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
        activeAuctions: []
      }
    }

    const listings = listingsData as CarListing[]
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
      activeAuctions
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
    activeAuctions: []
  }
}

// Get featured listings only
export async function getFeaturedaListings(): Promise<CarListing[]> {
  try {
    const { data, error } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands!car_listings_brand_id_fkey(id, name, slug, logo_url, country, is_popular, display_order, created_at),
        model:car_models!car_listings_model_id_fkey(id, brand_id, name, slug, body_type, is_popular, display_order, created_at),
        images:car_images(id, car_listing_id, image_url, thumbnail_url, caption, is_primary, display_order, created_at)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(10)

    if (error) throw error
    return (data as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching featured listings:', error)
    return []
  }
}

// Get popular listings only
export async function getPopularListings(): Promise<CarListing[]> {
  try {
    const { data, error } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands!car_listings_brand_id_fkey(id, name, slug, logo_url, country, is_popular, display_order, created_at),
        model:car_models!car_listings_model_id_fkey(id, brand_id, name, slug, body_type, is_popular, display_order, created_at),
        images:car_images(id, car_listing_id, image_url, thumbnail_url, caption, is_primary, display_order, created_at)
      `)
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(10)

    if (error) throw error
    return (data as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching popular listings:', error)
    return []
  }
}

// Get listings by body type
export async function getListingsByBodyType(bodyType: string): Promise<CarListing[]> {
  try {
    const { data, error } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands!car_listings_brand_id_fkey(id, name, slug, logo_url, country, is_popular, display_order, created_at),
        model:car_models!car_listings_model_id_fkey(id, brand_id, name, slug, body_type, is_popular, display_order, created_at),
        images:car_images(id, car_listing_id, image_url, thumbnail_url, caption, is_primary, display_order, created_at)
      `)
      .eq('status', 'active')
      .eq('body_type', bodyType)
      .limit(20)

    if (error) throw error
    return (data as CarListing[]) || []
  } catch (error) {
    console.error('Error fetching listings by body type:', error)
    return []
  }
}
