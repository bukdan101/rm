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

// Default categories for cars
const defaultCategories = [
  { id: '1', name: 'Sedan', icon: '🚗', count: 1250, slug: 'sedan' },
  { id: '2', name: 'SUV', icon: '🚙', count: 890, slug: 'suv' },
  { id: '3', name: 'MPV', icon: '🚐', count: 650, slug: 'mpv' },
  { id: '4', name: 'Hatchback', icon: '🚘', count: 420, slug: 'hatchback' },
  { id: '5', name: 'Pickup', icon: '🛻', count: 380, slug: 'pickup' },
  { id: '6', name: 'Van', icon: '🚚', count: 150, slug: 'van' },
  { id: '7', name: 'Coupe', icon: '🏎️', count: 95, slug: 'coupe' },
  { id: '8', name: 'Electric', icon: '⚡', count: 220, slug: 'electric' },
  { id: '9', name: 'Hybrid', icon: '🔋', count: 180, slug: 'hybrid' },
  { id: '10', name: 'LCGC', icon: '🚗', count: 320, slug: 'lcgc' },
]

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

    // If database error, log and return mock data
    if (listingsError) {
      console.log('Database error:', listingsError)
      return getMockData()
    }

    // If no data, return mock data
    if (!listingsData || listingsData.length === 0) {
      console.log('No listings in database, using mock data')
      return getMockData()
    }

    const listings = listingsData as CarListing[]
    console.log(`Loaded ${listings.length} listings from database`)

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
      categories: defaultCategories,
      featuredListings,
      premiumBoostedListings,
      highlightedListingIds,
      latestListings,
      popularListings,
      activeAuctions
    }
  } catch (error) {
    console.error('Error in getLandingData:', error)
    return getMockData()
  }
}

// Mock data for fallback
function getMockData(): LandingData {
  const mockListings: CarListing[] = [
    {
      id: 'mock-1',
      listing_number: 'CL-001',
      brand_id: '1',
      model_id: '1',
      title: 'Toyota Avanza 2022 Veloz',
      description: 'Mobil keluarga terbaru dengan fitur lengkap',
      price_cash: 225000000,
      year: 2022,
      mileage: 15000,
      fuel: 'bensin',
      transmission: 'automatic',
      body_type: 'mpv',
      transaction_type: 'jual',
      condition: 'bekas',
      status: 'active',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      view_count: 245,
      price_negotiable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand: { id: '1', name: 'Toyota', slug: 'toyota', logo_url: null, country: null, is_popular: true, display_order: 0, created_at: '' },
      model: { id: '1', brand_id: '1', name: 'Avanza', slug: 'avanza', body_type: 'mpv', is_popular: true, display_order: 0, created_at: '' },
      images: [{
        id: 'img-1',
        car_listing_id: 'mock-1',
        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
        thumbnail_url: null,
        caption: null,
        is_primary: true,
        display_order: 0,
        created_at: ''
      }]
    }
  ]

  return {
    categories: defaultCategories,
    featuredListings: mockListings,
    premiumBoostedListings: mockListings.slice(0, 4),
    highlightedListingIds: mockListings.slice(0, 4).map(l => l.id),
    latestListings: mockListings,
    popularListings: mockListings,
    activeAuctions: []
  }
}
