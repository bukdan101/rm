import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch all categories (brands, body types, transmissions, fuel types)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'brands', 'body_types', 'transmissions', 'fuel_types', or 'all'

    // If specific type is requested
    if (type && type !== 'all') {
      return await fetchSingleCategoryType(type)
    }

    // Fetch all category types
    const [brandsResult, bodyTypesResult, transmissionsResult, fuelTypesResult] = await Promise.all([
      fetchBrands(),
      fetchBodyTypes(),
      fetchTransmissions(),
      fetchFuelTypes()
    ])

    return NextResponse.json({
      brands: brandsResult,
      body_types: bodyTypesResult,
      transmissions: transmissionsResult,
      fuel_types: fuelTypesResult
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to fetch single category type
async function fetchSingleCategoryType(type: string) {
  switch (type) {
    case 'brands':
      return NextResponse.json({ data: await fetchBrands() })
    case 'body_types':
      return NextResponse.json({ data: await fetchBodyTypes() })
    case 'transmissions':
      return NextResponse.json({ data: await fetchTransmissions() })
    case 'fuel_types':
      return NextResponse.json({ data: await fetchFuelTypes() })
    default:
      return NextResponse.json({ error: 'Invalid category type' }, { status: 400 })
  }
}

// Fetch brands with listing count using db.brand
async function fetchBrands() {
  const brands = await db.brand.findMany({
    orderBy: { display_order: 'asc' },
  })

  if (!brands || brands.length === 0) {
    return getDefaultBrands()
  }

  // Get listing count for each brand
  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => {
      const count = await db.carListing.count({
        where: { brand_id: brand.id, status: { not: 'deleted' } },
      })

      return {
        ...brand,
        listing_count: count
      }
    })
  )

  return brandsWithCount
}

// Fetch body types with listing count
async function fetchBodyTypes() {
  const listings = await db.carListing.findMany({
    where: { body_type: { not: null }, status: { not: 'deleted' } },
    select: { body_type: true },
  })

  // Count by body type
  const bodyTypeCounts: Record<string, number> = {}
  listings.forEach((listing) => {
    if (listing.body_type) {
      bodyTypeCounts[listing.body_type] = (bodyTypeCounts[listing.body_type] || 0) + 1
    }
  })

  const bodyTypes = [
    { name: 'Sedan', slug: 'sedan', icon: 'car', listing_count: bodyTypeCounts['sedan'] || 0 },
    { name: 'SUV', slug: 'suv', icon: 'truck', listing_count: bodyTypeCounts['suv'] || 0 },
    { name: 'MPV', slug: 'mpv', icon: 'users', listing_count: bodyTypeCounts['mpv'] || 0 },
    { name: 'Hatchback', slug: 'hatchback', icon: 'car', listing_count: bodyTypeCounts['hatchback'] || 0 },
    { name: 'Pickup', slug: 'pickup', icon: 'truck', listing_count: bodyTypeCounts['pickup'] || 0 },
    { name: 'Van', slug: 'van', icon: 'box', listing_count: bodyTypeCounts['van'] || 0 },
    { name: 'Coupe', slug: 'coupe', icon: 'car', listing_count: bodyTypeCounts['coupe'] || 0 },
    { name: 'Convertible', slug: 'convertible', icon: 'wind', listing_count: bodyTypeCounts['convertible'] || 0 },
    { name: 'Wagon', slug: 'wagon', icon: 'car', listing_count: bodyTypeCounts['wagon'] || 0 }
  ]

  return bodyTypes
}

// Fetch transmissions with listing count
async function fetchTransmissions() {
  const listings = await db.carListing.findMany({
    where: { transmission: { not: null }, status: { not: 'deleted' } },
    select: { transmission: true },
  })

  const transmissionCounts: Record<string, number> = {}
  listings.forEach((listing) => {
    if (listing.transmission) {
      transmissionCounts[listing.transmission] = (transmissionCounts[listing.transmission] || 0) + 1
    }
  })

  const transmissions = [
    { name: 'Automatic', slug: 'automatic', label: 'Otomatis (AT)', listing_count: transmissionCounts['automatic'] || 0 },
    { name: 'Manual', slug: 'manual', label: 'Manual (MT)', listing_count: transmissionCounts['manual'] || 0 }
  ]

  return transmissions
}

// Fetch fuel types with listing count
async function fetchFuelTypes() {
  const listings = await db.carListing.findMany({
    where: { fuel: { not: null }, status: { not: 'deleted' } },
    select: { fuel: true },
  })

  const fuelCounts: Record<string, number> = {}
  listings.forEach((listing) => {
    if (listing.fuel) {
      fuelCounts[listing.fuel] = (fuelCounts[listing.fuel] || 0) + 1
    }
  })

  const fuelTypes = [
    { name: 'Bensin', slug: 'bensin', label: 'Bensin (Petrol)', listing_count: fuelCounts['bensin'] || 0 },
    { name: 'Diesel', slug: 'diesel', label: 'Diesel', listing_count: fuelCounts['diesel'] || 0 },
    { name: 'Electric', slug: 'electric', label: 'Listrik (EV)', listing_count: fuelCounts['electric'] || 0 },
    { name: 'Hybrid', slug: 'hybrid', label: 'Hybrid', listing_count: fuelCounts['hybrid'] || 0 },
    { name: 'Petrol Hybrid', slug: 'petrol_hybrid', label: 'Petrol Hybrid', listing_count: fuelCounts['petrol_hybrid'] || 0 }
  ]

  return fuelTypes
}

// POST: Create new category (brand)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { category_type, ...data } = body

    if (!category_type) {
      return NextResponse.json({ error: 'Category type is required' }, { status: 400 })
    }

    switch (category_type) {
      case 'brand': {
        const { name, slug, logo_url, country, is_popular, display_order } = data

        if (!name) {
          return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
        }

        const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-')

        const brand = await db.brand.create({
          data: {
            name,
            slug: finalSlug,
            logo_url: logo_url || null,
            country: country || null,
            is_popular: is_popular ?? false,
            display_order: display_order ?? 0,
          },
        })

        return NextResponse.json({ success: true, brand })
      }

      default:
        return NextResponse.json({ error: 'Invalid category type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update category (brand)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { category_type, id, ...updates } = body

    if (!category_type || !id) {
      return NextResponse.json({ error: 'Category type and ID are required' }, { status: 400 })
    }

    switch (category_type) {
      case 'brand': {
        const allowedFields = ['name', 'slug', 'logo_url', 'country', 'is_popular', 'display_order', 'is_active']
        const filteredUpdates: Record<string, unknown> = {}

        for (const key of allowedFields) {
          if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key]
          }
        }

        const brand = await db.brand.update({
          where: { id: Number(id) },
          data: filteredUpdates,
        })

        return NextResponse.json({ success: true, brand })
      }

      default:
        return NextResponse.json({ error: 'Invalid category type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete category (brand)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category_type = searchParams.get('category_type')
    const id = searchParams.get('id')

    if (!category_type || !id) {
      return NextResponse.json({ error: 'Category type and ID are required' }, { status: 400 })
    }

    switch (category_type) {
      case 'brand': {
        // Check if brand has listings
        const count = await db.carListing.count({
          where: { brand_id: Number(id) },
        })

        if (count > 0) {
          return NextResponse.json({
            error: 'Cannot delete brand with existing listings',
            listing_count: count
          }, { status: 400 })
        }

        await db.brand.delete({
          where: { id: Number(id) },
        })

        return NextResponse.json({ success: true, message: 'Brand deleted successfully' })
      }

      default:
        return NextResponse.json({ error: 'Invalid category type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Default data functions
function getDefaultBrands() {
  return [
    { id: 1, name: 'Toyota', slug: 'toyota', country: 'Japan', is_popular: true, display_order: 1, listing_count: 0 },
    { id: 2, name: 'Honda', slug: 'honda', country: 'Japan', is_popular: true, display_order: 2, listing_count: 0 },
    { id: 3, name: 'Mitsubishi', slug: 'mitsubishi', country: 'Japan', is_popular: true, display_order: 3, listing_count: 0 },
    { id: 4, name: 'Suzuki', slug: 'suzuki', country: 'Japan', is_popular: true, display_order: 4, listing_count: 0 },
    { id: 5, name: 'Daihatsu', slug: 'daihatsu', country: 'Japan', is_popular: true, display_order: 5, listing_count: 0 },
    { id: 6, name: 'Nissan', slug: 'nissan', country: 'Japan', is_popular: false, display_order: 6, listing_count: 0 },
    { id: 7, name: 'BMW', slug: 'bmw', country: 'Germany', is_popular: false, display_order: 7, listing_count: 0 },
    { id: 8, name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'Germany', is_popular: false, display_order: 8, listing_count: 0 },
    { id: 9, name: 'Hyundai', slug: 'hyundai', country: 'South Korea', is_popular: false, display_order: 9, listing_count: 0 },
    { id: 10, name: 'Wuling', slug: 'wuling', country: 'China', is_popular: false, display_order: 10, listing_count: 0 }
  ]
}
