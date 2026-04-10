/**
 * AutoMarket Service Layer
 *
 * Typed service modules for each microservice.
 * Uses the API gateway client for all requests.
 * Includes demo data fallback when services are unavailable.
 */

import type {
  CarListing, CarListingCard, Brand, CarModel, CarColor, CarImage,
  Dealer, CarReview, CarInspection, Conversation, Message,
  Profile, ListingFilters, PaginatedResponse,
  Order, Payment, Banner, BodyType, FuelType, TransmissionType,
} from '@/types/marketplace'
import { api, SERVICES, type ServiceName, checkService } from './client'

// ============================================================
// DEMO DATA - Used when microservices are unavailable
// ============================================================

const DEMO_BRANDS: Brand[] = [
  { id: 'b1', name: 'Toyota', slug: 'toyota', logo_url: '/brands/toyota.png', country: 'Japan', is_popular: true, display_order: 1, created_at: new Date().toISOString() },
  { id: 'b2', name: 'Honda', slug: 'honda', logo_url: '/brands/honda.png', country: 'Japan', is_popular: true, display_order: 2, created_at: new Date().toISOString() },
  { id: 'b3', name: 'Daihatsu', slug: 'daihatsu', logo_url: '/brands/daihatsu.png', country: 'Japan', is_popular: true, display_order: 3, created_at: new Date().toISOString() },
  { id: 'b4', name: 'Suzuki', slug: 'suzuki', logo_url: '/brands/suzuki.png', country: 'Japan', is_popular: true, display_order: 4, created_at: new Date().toISOString() },
  { id: 'b5', name: 'Mitsubishi', slug: 'mitsubishi', logo_url: '/brands/mitsubishi.png', country: 'Japan', is_popular: true, display_order: 5, created_at: new Date().toISOString() },
  { id: 'b6', name: 'BMW', slug: 'bmw', logo_url: '/brands/bmw.png', country: 'Germany', is_popular: false, display_order: 6, created_at: new Date().toISOString() },
  { id: 'b7', name: 'Mercedes-Benz', slug: 'mercedes-benz', logo_url: '/brands/mercedes-benz.png', country: 'Germany', is_popular: false, display_order: 7, created_at: new Date().toISOString() },
  { id: 'b8', name: 'Hyundai', slug: 'hyundai', logo_url: '/brands/hyundai.png', country: 'Korea', is_popular: true, display_order: 8, created_at: new Date().toISOString() },
  { id: 'b9', name: 'Mazda', slug: 'mazda', logo_url: '/brands/mazda.png', country: 'Japan', is_popular: false, display_order: 9, created_at: new Date().toISOString() },
  { id: 'b10', name: 'Nissan', slug: 'nissan', logo_url: '/brands/nissan.png', country: 'Japan', is_popular: true, display_order: 10, created_at: new Date().toISOString() },
  { id: 'b11', name: 'Kia', slug: 'kia', logo_url: '/brands/kia.png', country: 'Korea', is_popular: true, display_order: 11, created_at: new Date().toISOString() },
  { id: 'b12', name: 'Volkswagen', slug: 'volkswagen', logo_url: '/brands/volkswagen.png', country: 'Germany', is_popular: false, display_order: 12, created_at: new Date().toISOString() },
]

const DEMO_COLORS: CarColor[] = [
  { id: 'c1', name: 'Hitam', hex_code: '#000000', is_metallic: false, is_popular: true, created_at: new Date().toISOString() },
  { id: 'c2', name: 'Putih', hex_code: '#FFFFFF', is_metallic: false, is_popular: true, created_at: new Date().toISOString() },
  { id: 'c3', name: 'Silver', hex_code: '#C0C0C0', is_metallic: true, is_popular: true, created_at: new Date().toISOString() },
  { id: 'c4', name: 'Abu-abu', hex_code: '#808080', is_metallic: false, is_popular: true, created_at: new Date().toISOString() },
  { id: 'c5', name: 'Merah', hex_code: '#FF0000', is_metallic: false, is_popular: true, created_at: new Date().toISOString() },
  { id: 'c6', name: 'Biru', hex_code: '#0000FF', is_metallic: false, is_popular: false, created_at: new Date().toISOString() },
]

const sampleImages: string[] = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
]

const listingTemplates = [
  { title: 'Toyota Avanza 1.5 G AT 2023', brand: 'Toyota', model: 'Avanza', body_type: 'mpv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 215000000, mileage: 25000, year: 2023, city: 'Jakarta Selatan', province: 'DKI Jakarta', dealer_id: null },
  { title: 'Honda HR-V 1.5 SE CVT 2024', brand: 'Honda', model: 'HR-V', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 385000000, mileage: 12000, year: 2024, city: 'Bandung', province: 'Jawa Barat', dealer_id: 'd1' },
  { title: 'Mitsubishi Xpander Cross 2024', brand: 'Mitsubishi', model: 'Xpander', body_type: 'mpv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 295000000, mileage: 18000, year: 2024, city: 'Surabaya', province: 'Jawa Timur', dealer_id: 'd1' },
  { title: 'Toyota Rush 1.5 GR Sport 2023', brand: 'Toyota', model: 'Rush', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 278000000, mileage: 32000, year: 2023, city: 'Medan', province: 'Sumatera Utara', dealer_id: null },
  { title: 'Suzuki Ertiga GX AT 2024', brand: 'Suzuki', model: 'Ertiga', body_type: 'mpv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 235000000, mileage: 8000, year: 2024, city: 'Semarang', province: 'Jawa Tengah', dealer_id: 'd2' },
  { title: 'Daihatsu Rocky 1.0 R Turbo 2024', brand: 'Daihatsu', model: 'Rocky', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'baru' as const, price_cash: 262000000, mileage: 0, year: 2024, city: 'Jakarta Utara', province: 'DKI Jakarta', dealer_id: 'd2' },
  { title: 'Honda Brio RS CVT 2023', brand: 'Honda', model: 'Brio', body_type: 'hatchback' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 195000000, mileage: 15000, year: 2023, city: 'Tangerang', province: 'Banten', dealer_id: null },
  { title: 'Toyota Innova Zenix 2.0 V 2024', brand: 'Toyota', model: 'Innova', body_type: 'mpv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 395000000, mileage: 5000, year: 2024, city: 'Bekasi', province: 'Jawa Barat', dealer_id: 'd3' },
  { title: 'Hyundai Creta Active 2024', brand: 'Hyundai', model: 'Creta', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 305000000, mileage: 10000, year: 2024, city: 'Depok', province: 'Jawa Barat', dealer_id: 'd3' },
  { title: 'BMW 320i M Sport 2022', brand: 'BMW', model: '320i', body_type: 'sedan' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 725000000, mileage: 20000, year: 2022, city: 'Jakarta Pusat', province: 'DKI Jakarta', dealer_id: 'd4' },
  { title: 'Mazda CX-5 Kuro Edition 2024', brand: 'Mazda', model: 'CX-5', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 545000000, mileage: 7000, year: 2024, city: 'Yogyakarta', province: 'DI Yogyakarta', dealer_id: 'd4' },
  { title: 'Kia Seltos EX 2024', brand: 'Kia', model: 'Seltos', body_type: 'suv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 315000000, mileage: 9000, year: 2024, city: 'Makassar', province: 'Sulawesi Selatan', dealer_id: null },
  { title: 'Nissan Livina VL 2023', brand: 'Nissan', model: 'Livina', body_type: 'mpv' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 258000000, mileage: 22000, year: 2023, city: 'Palembang', province: 'Sumatera Selatan', dealer_id: null },
  { title: 'Mercedes-Benz C200 AMG 2023', brand: 'Mercedes-Benz', model: 'C200', body_type: 'sedan' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 825000000, mileage: 15000, year: 2023, city: 'Jakarta Barat', province: 'DKI Jakarta', dealer_id: 'd5' },
  { title: 'Toyota Fortuner 2.4 VRZ 2024', brand: 'Toyota', model: 'Fortuner', body_type: 'suv' as BodyType, fuel: 'diesel' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'bekas' as const, price_cash: 535000000, mileage: 11000, year: 2024, city: 'Balikpapan', province: 'Kalimantan Timur', dealer_id: 'd5' },
  { title: 'Honda City 1.5 RS 2024', brand: 'Honda', model: 'City', body_type: 'sedan' as BodyType, fuel: 'bensin' as FuelType, transmission: 'automatic' as TransmissionType, condition: 'baru' as const, price_cash: 385000000, mileage: 0, year: 2024, city: 'Denpasar', province: 'Bali', dealer_id: null },
]

function generateDemoListings(filters?: ListingFilters): CarListingCard[] {
  let listings = listingTemplates.map((t, i) => ({
    id: `demo-${i + 1}`,
    listing_number: `AM-${String(20240000 + i + 1)}`,
    user_id: t.dealer_id ? null : `user-${(i % 5) + 1}`,
    dealer_id: t.dealer_id,
    brand_id: DEMO_BRANDS.find(b => b.name === t.brand)?.id || 'b1',
    model_id: `m-${i + 1}`,
    variant_id: null,
    title: t.title,
    description: `${t.brand} ${t.model} tahun ${t.year}. Kondisi ${t.condition === 'baru' ? 'Baru' : 'Bekas'}, ${t.mileage.toLocaleString()} km. Lokasi: ${t.city}, ${t.province}. Tersedia untuk ${t.transaction_type === 'jual' ? 'jual' : 'jual & rental'}.`,
    year: t.year,
    exterior_color_id: DEMO_COLORS[i % DEMO_COLORS.length].id,
    fuel: t.fuel,
    transmission: t.transmission,
    body_type: t.body_type,
    mileage: t.mileage,
    transaction_type: 'jual' as const,
    condition: t.condition,
    price_cash: t.price_cash,
    price_credit: Math.round(t.price_cash * 1.15),
    price_negotiable: true,
    city: t.city,
    province: t.province,
    view_count: Math.floor(Math.random() * 500) + 50,
    favorite_count: Math.floor(Math.random() * 30) + 1,
    inquiry_count: Math.floor(Math.random() * 10),
    share_count: Math.floor(Math.random() * 5),
    status: 'active' as const,
    published_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    brand: DEMO_BRANDS.find(b => b.name === t.brand),
    model: { id: `m-${i + 1}`, brand_id: DEMO_BRANDS.find(b => b.name === t.brand)?.id || null, name: t.model, slug: t.model.toLowerCase(), body_type: t.body_type, is_popular: false, display_order: i, created_at: new Date().toISOString() },
    exterior_color: DEMO_COLORS[i % DEMO_COLORS.length],
    images: [
      { id: `img-${i}-0`, car_listing_id: `demo-${i + 1}`, image_url: sampleImages[i % sampleImages.length], thumbnail_url: sampleImages[i % sampleImages.length], caption: null, is_primary: true, display_order: 0, created_at: new Date().toISOString() },
    ],
    inspection: Math.random() > 0.3 ? {
      risk_level: (['low', 'low', 'medium'] as const)[Math.floor(Math.random() * 3)],
      overall_grade: (['A+', 'A', 'B+', 'B'] as const)[Math.floor(Math.random() * 4)],
      inspection_score: Math.floor(Math.random() * 20) + 80,
      passed_points: Math.floor(Math.random() * 10) + 145,
      total_points: 160,
    } : undefined,
  }))

  // Apply filters
  if (filters) {
    if (filters.brand_id) listings = listings.filter(l => l.brand_id === filters.brand_id)
    if (filters.body_type) listings = listings.filter(l => l.body_type === filters.body_type)
    if (filters.fuel) listings = listings.filter(l => l.fuel === filters.fuel)
    if (filters.transmission) listings = listings.filter(l => l.transmission === filters.transmission)
    if (filters.condition) listings = listings.filter(l => l.condition === filters.condition)
    if (filters.city) listings = listings.filter(l => l.city?.toLowerCase().includes(filters.city!.toLowerCase()))
    if (filters.year_min) listings = listings.filter(l => l.year! >= filters.year_min!)
    if (filters.year_max) listings = listings.filter(l => l.year! <= filters.year_max!)
    if (filters.price_min) listings = listings.filter(l => (l.price_cash || 0) >= filters.price_min!)
    if (filters.price_max) listings = listings.filter(l => (l.price_cash || 0) <= filters.price_max!)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      listings = listings.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.brand?.name.toLowerCase().includes(q) ||
        l.model?.name.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q)
      )
    }
  }

  return listings
}

const DEMO_DEALERS: Dealer[] = [
  { id: 'd1', owner_id: null, name: 'Auto Prima Motor', slug: 'auto-prima-motor', description: 'Dealer mobil terpercaya sejak 2015. Menyediakan mobil berkualitas dengan garansi mesin 1 tahun.', logo_url: null, cover_url: null, phone: '+62 812-3456-7890', email: 'info@autoprima.co.id', website: 'https://autoprima.co.id', address: 'Jl. Gatot Subroto No. 123', city_id: null, province_id: null, postal_code: '12950', rating: 4.8, review_count: 156, total_listings: 45, verified: true, is_active: true, subscription_tier: 'premium', subscription_ends_at: '2025-12-31T00:00:00Z', created_at: '2023-01-15T00:00:00Z', updated_at: new Date().toISOString() },
  { id: 'd2', owner_id: null, name: 'Sentral Mobil Surabaya', slug: 'sentral-mobil-surabaya', description: 'Pusat penjualan mobil bekas berkualitas di Surabaya. Inspeksi menyeluruh sebelum unit dipasarkan.', logo_url: null, cover_url: null, phone: '+62 813-9876-5432', email: 'sales@sentralmobil.co.id', website: null, address: 'Jl. Ahmad Yani No. 456', city_id: null, province_id: null, postal_code: '60235', rating: 4.6, review_count: 89, total_listings: 32, verified: true, is_active: true, subscription_tier: 'premium', subscription_ends_at: '2025-06-30T00:00:00Z', created_at: '2023-03-20T00:00:00Z', updated_at: new Date().toISOString() },
  { id: 'd3', owner_id: null, name: 'Bandung Auto Gallery', slug: 'bandung-auto-gallery', description: 'Gallery mobil premium di Bandung. Spesialis SUV dan sedan mewah.', logo_url: null, cover_url: null, phone: '+62 821-1122-3344', email: 'info@bag.co.id', website: 'https://bandungauto.co.id', address: 'Jl. Soekarno-Hatta No. 789', city_id: null, province_id: null, postal_code: '40266', rating: 4.9, review_count: 67, total_listings: 28, verified: true, is_active: true, subscription_tier: 'premium', subscription_ends_at: '2025-09-30T00:00:00Z', created_at: '2023-06-10T00:00:00Z', updated_at: new Date().toISOString() },
  { id: 'd4', owner_id: null, name: 'Medan Car Center', slug: 'medan-car-center', description: 'Dealer mobil terbesar di Sumatera Utara. Pilihan terlengkap dan harga bersaing.', logo_url: null, cover_url: null, phone: '+62 811-5566-7788', email: 'sales@mcc.co.id', website: null, address: 'Jl. Gatot Subroto No. 321, Medan', city_id: null, province_id: null, postal_code: '20112', rating: 4.5, review_count: 112, total_listings: 55, verified: true, is_active: true, subscription_tier: 'standard', subscription_ends_at: '2025-03-31T00:00:00Z', created_at: '2022-11-05T00:00:00Z', updated_at: new Date().toISOString() },
  { id: 'd5', owner_id: null, name: 'Mobil Bagus Jakarta', slug: 'mobil-bagus-jakarta', description: 'Dealer mobil bekas pilihan dengan jaminan return 7 hari jika tidak sesuai.', logo_url: null, cover_url: null, phone: '+62 815-9988-7766', email: 'info@mobilbagus.co.id', website: 'https://mobilbagus.co.id', address: 'Jl. Raya Bogor KM 28', city_id: null, province_id: null, postal_code: '13750', rating: 4.7, review_count: 203, total_listings: 68, verified: true, is_active: true, subscription_tier: 'premium', subscription_ends_at: '2025-12-31T00:00:00Z', created_at: '2022-08-15T00:00:00Z', updated_at: new Date().toISOString() },
]

// ============================================================
// HELPER: Try microservice first, fallback to demo
// ============================================================

async function withFallback<T>(
  service: ServiceName,
  apiCall: () => Promise<ApiResponse<T>>,
  fallback: () => T,
): Promise<T> {
  try {
    const isAvailable = await checkService(service)
    if (isAvailable) {
      const result = await apiCall()
      if (result.success && result.data !== undefined) {
        return result.data
      }
    }
  } catch {
    // Service unavailable, use fallback
  }
  return fallback()
}

// ============================================================
// LISTING SERVICE
// ============================================================

export const listingService = {
  async getListings(filters?: ListingFilters, page = 1, limit = 20): Promise<PaginatedResponse<CarListingCard>> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) }
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params[k] = String(v) })
    }

    try {
      const available = await checkService('LISTING')
      if (available) {
        const result = await api.get<CarListingCard[]>('api/listings', params)
        if (result.success && result.data) {
          return {
            success: true,
            data: result.data,
            pagination: result.pagination || { page, limit, total: result.data.length, totalPages: 1 },
          }
        }
      }
    } catch { /* fallback */ }

    // Demo fallback
    const data = generateDemoListings(filters)
    const start = (page - 1) * limit
    const paged = data.slice(start, start + limit)
    return {
      success: true,
      data: paged,
      pagination: { page, limit, total: data.length, totalPages: Math.ceil(data.length / limit) },
    }
  },

  async getListing(id: string): Promise<CarListing | null> {
    try {
      const available = await checkService('LISTING')
      if (available) {
        const result = await api.get<CarListing>(`api/listings/${id}`)
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }

    // Demo fallback
    const listings = generateDemoListings()
    return listings.find(l => l.id === id) as CarListing || null
  },

  async getBrands(): Promise<Brand[]> {
    try {
      const available = await checkService('LISTING')
      if (available) {
        const result = await api.get<Brand[]>('api/brands')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return DEMO_BRANDS
  },

  async getModelsByBrand(brandId: string): Promise<CarModel[]> {
    try {
      const available = await checkService('LISTING')
      if (available) {
        const result = await api.get<CarModel[]>(`api/brands/${brandId}/models`)
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async getColors(): Promise<CarColor[]> {
    try {
      const available = await checkService('LISTING')
      if (available) {
        const result = await api.get<CarColor[]>('api/colors')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return DEMO_COLORS
  },

  async getFeaturedListings(): Promise<CarListingCard[]> {
    return (await this.getListings({})).data.slice(0, 6)
  },

  async getLatestListings(): Promise<CarListingCard[]> {
    const listings = generateDemoListings()
    return listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
  },

  async getPopularListings(): Promise<CarListingCard[]> {
    const listings = generateDemoListings()
    return listings.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10)
  },
}

// ============================================================
// USER SERVICE
// ============================================================

export const userService = {
  async getProfile(): Promise<Profile | null> {
    try {
      const available = await checkService('USER')
      if (available) {
        const result = await api.get<Profile>('api/auth/me')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return null
  },

  async googleLogin(token: string): Promise<{ jwt: string; profile: Profile } | null> {
    try {
      const result = await api.post<{ jwt: string; profile: Profile }>('api/auth/google/callback', { token })
      if (result.success && result.data) return result.data
    } catch { /* fallback */ }
    return null
  },

  async refreshToken(refreshToken: string): Promise<{ jwt: string } | null> {
    try {
      const result = await api.post<{ jwt: string }>('api/auth/refresh', { refresh_token: refreshToken })
      if (result.success && result.data) return result.data
    } catch { /* fallback */ }
    return null
  },

  async getTokenBalance(): Promise<number> {
    try {
      const available = await checkService('USER')
      if (available) {
        const result = await api.get<{ balance: number }>('api/tokens/balance')
        if (result.success && result.data) return result.data.balance
      }
    } catch { /* fallback */ }
    return 0
  },
}

// ============================================================
// INTERACTION SERVICE
// ============================================================

export const interactionService = {
  async getFavorites(): Promise<CarListingCard[]> {
    try {
      const available = await checkService('INTERACTION')
      if (available) {
        const result = await api.get<CarListingCard[]>('api/favorites')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async addFavorite(listingId: string): Promise<boolean> {
    try {
      const result = await api.post('api/favorites', { listing_id: listingId })
      return result.success
    } catch { return false }
  },

  async removeFavorite(favoriteId: string): Promise<boolean> {
    try {
      const result = await api.delete(`api/favorites/${favoriteId}`)
      return result.success
    } catch { return false }
  },

  async getReviews(listingId: string): Promise<CarReview[]> {
    try {
      const available = await checkService('INTERACTION')
      if (available) {
        const result = await api.get<CarReview[]>(`api/listings/${listingId}/reviews`)
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async getTrending(): Promise<CarListingCard[]> {
    try {
      const available = await checkService('INTERACTION')
      if (available) {
        const result = await api.get<CarListingCard[]>('api/trending')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return generateDemoListings().slice(0, 6)
  },
}

// ============================================================
// TRANSACTION SERVICE
// ============================================================

export const transactionService = {
  async getOrders(): Promise<Order[]> {
    try {
      const available = await checkService('TRANSACTION')
      if (available) {
        const result = await api.get<Order[]>('api/orders')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async createOrder(listingId: string, price: number): Promise<Order | null> {
    try {
      const result = await api.post<Order>('api/orders', { listing_id: listingId, agreed_price: price })
      if (result.success && result.data) return result.data
    } catch { /* fallback */ }
    return null
  },

  async getTokenPackages() {
    try {
      const available = await checkService('TRANSACTION')
      if (available) {
        const result = await api.get('api/token-packages')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },
}

// ============================================================
// BUSINESS SERVICE
// ============================================================

export const businessService = {
  async getDealers(): Promise<Dealer[]> {
    try {
      const available = await checkService('BUSINESS')
      if (available) {
        const result = await api.get<Dealer[]>('api/dealers')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return DEMO_DEALERS
  },

  async getDealer(slugOrId: string): Promise<Dealer | null> {
    try {
      const available = await checkService('BUSINESS')
      if (available) {
        const result = await api.get<Dealer>(`api/dealers/${slugOrId}`)
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return DEMO_DEALERS.find(d => d.slug === slugOrId || d.id === slugOrId) || null
  },

  async getBanners(): Promise<Banner[]> {
    try {
      const available = await checkService('BUSINESS')
      if (available) {
        const result = await api.get<Banner[]>('api/banners')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },
}

// ============================================================
// SYSTEM SERVICE
// ============================================================

export const systemService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const available = await checkService('SYSTEM')
      if (available) {
        const result = await api.get<Conversation[]>('api/conversations')
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const available = await checkService('SYSTEM')
      if (available) {
        const result = await api.get<Message[]>(`api/conversations/${conversationId}/messages`)
        if (result.success && result.data) return result.data
      }
    } catch { /* fallback */ }
    return []
  },

  async getNotifications(): Promise<{ id: string; title: string; message: string; read: boolean; created_at: string }[]> {
    try {
      const available = await checkService('SYSTEM')
      if (available) {
        const result = await api.get('api/notifications')
        if (result.success && result.data) return result.data as any[]
      }
    } catch { /* fallback */ }
    return []
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const available = await checkService('SYSTEM')
      if (available) {
        const result = await api.get<{ count: number }>('api/notifications/unread-count')
        if (result.success && result.data) return result.data.count
      }
    } catch { /* fallback */ }
    return 0
  },
}

// ============================================================
// UNIFIED EXPORT
// ============================================================

export const services = {
  listing: listingService,
  user: userService,
  interaction: interactionService,
  transaction: transactionService,
  business: businessService,
  system: systemService,
}

// Service info for UI display
export const SERVICE_INFO = [
  { name: 'User Service', key: 'USER' as ServiceName, port: SERVICES.USER, description: 'Auth, Profile, KYC, Tokens', endpoints: 15 },
  { name: 'Listing Service', key: 'LISTING' as ServiceName, port: SERVICES.LISTING, description: 'CRUD Listings, Brands, Inspections', endpoints: 18 },
  { name: 'Interaction Service', key: 'INTERACTION' as ServiceName, port: SERVICES.INTERACTION, description: 'Reviews, Favorites, Recommendations', endpoints: 14 },
  { name: 'Transaction Service', key: 'TRANSACTION' as ServiceName, port: SERVICES.TRANSACTION, description: 'Orders, Payments, Rentals, Coupons', endpoints: 22 },
  { name: 'Business Service', key: 'BUSINESS' as ServiceName, port: SERVICES.BUSINESS, description: 'Dealers, Offers, Banners, Support', endpoints: 28 },
  { name: 'System Service', key: 'SYSTEM' as ServiceName, port: SERVICES.SYSTEM, description: 'Chat WebSocket, Notifications, Analytics', endpoints: 18 },
]

export const TOTAL_ENDPOINTS = SERVICE_INFO.reduce((sum, s) => sum + s.endpoints, 0)
