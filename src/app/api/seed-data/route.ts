import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Sample car data for seeding
const sampleBrands = [
  { name: 'Toyota', slug: 'toyota', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png' },
  { name: 'Honda', slug: 'honda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo.svg/1200px-Honda_logo.svg.png' },
  { name: 'Mitsubishi', slug: 'mitsubishi', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mitsubishi_Motors_logo.svg/1200px-Mitsubishi_Motors_logo.svg.png' },
  { name: 'Suzuki', slug: 'suzuki', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png' },
  { name: 'Daihatsu', slug: 'daihatsu', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Daihatsu_logo.svg/1200px-Daihatsu_logo.svg.png' },
  { name: 'Nissan', slug: 'nissan', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nissan-logo.svg/1200px-Nissan-logo.svg.png' },
  { name: 'Mazda', slug: 'mazda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mazda_logo.svg/1200px-Mazda_logo.svg.png' },
  { name: 'Hyundai', slug: 'hyundai', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png' },
  { name: 'BMW', slug: 'bmw', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png' },
]

const sampleModels: Record<string, Array<{ name: string; body_type: string }>> = {
  'toyota': [
    { name: 'Avanza', body_type: 'mpv' },
    { name: 'Innova', body_type: 'mpv' },
    { name: 'Fortuner', body_type: 'suv' },
    { name: 'Rush', body_type: 'suv' },
    { name: 'Yaris', body_type: 'hatchback' },
    { name: 'Vios', body_type: 'sedan' },
    { name: 'Camry', body_type: 'sedan' },
    { name: 'Hilux', body_type: 'pickup' },
    { name: 'RAV4', body_type: 'suv' },
    { name: 'Alphard', body_type: 'mpv' },
  ],
  'honda': [
    { name: 'Jazz', body_type: 'hatchback' },
    { name: 'City', body_type: 'sedan' },
    { name: 'Civic', body_type: 'sedan' },
    { name: 'CR-V', body_type: 'suv' },
    { name: 'HR-V', body_type: 'suv' },
    { name: 'BR-V', body_type: 'suv' },
    { name: 'Mobilio', body_type: 'mpv' },
    { name: 'Brio', body_type: 'hatchback' },
  ],
  'mitsubishi': [
    { name: 'Xpander', body_type: 'mpv' },
    { name: 'Pajero Sport', body_type: 'suv' },
    { name: 'Triton', body_type: 'pickup' },
    { name: 'Outlander', body_type: 'suv' },
    { name: 'Mirage', body_type: 'hatchback' },
  ],
  'suzuki': [
    { name: 'Ertiga', body_type: 'mpv' },
    { name: 'XL7', body_type: 'mpv' },
    { name: 'Jimny', body_type: 'suv' },
    { name: 'Vitara', body_type: 'suv' },
    { name: 'Swift', body_type: 'hatchback' },
  ],
  'daihatsu': [
    { name: 'Xenia', body_type: 'mpv' },
    { name: 'Terios', body_type: 'suv' },
    { name: 'Rocky', body_type: 'suv' },
    { name: 'Ayla', body_type: 'hatchback' },
    { name: 'Sigra', body_type: 'mpv' },
  ],
  'nissan': [
    { name: 'X-Trail', body_type: 'suv' },
    { name: 'Qashqai', body_type: 'suv' },
    { name: 'Navara', body_type: 'pickup' },
    { name: 'Livina', body_type: 'mpv' },
  ],
  'hyundai': [
    { name: 'Tucson', body_type: 'suv' },
    { name: 'Santa Fe', body_type: 'suv' },
    { name: 'Creta', body_type: 'suv' },
    { name: 'Ioniq', body_type: 'hatchback' },
  ],
  'bmw': [
    { name: '320i', body_type: 'sedan' },
    { name: '530i', body_type: 'sedan' },
    { name: 'X3', body_type: 'suv' },
    { name: 'X5', body_type: 'suv' },
  ],
  'mercedes-benz': [
    { name: 'C200', body_type: 'sedan' },
    { name: 'E300', body_type: 'sedan' },
    { name: 'GLC 300', body_type: 'suv' },
    { name: 'S450', body_type: 'sedan' },
  ],
}

const sampleProvinces = [
  { name: 'DKI Jakarta', slug: 'dki-jakarta' },
  { name: 'Jawa Barat', slug: 'jawa-barat' },
  { name: 'Jawa Tengah', slug: 'jawa-tengah' },
  { name: 'Jawa Timur', slug: 'jawa-timur' },
  { name: 'Banten', slug: 'banten' },
]

const sampleCities = [
  { province_slug: 'dki-jakarta', name: 'Jakarta Selatan', slug: 'jakarta-selatan' },
  { province_slug: 'dki-jakarta', name: 'Jakarta Pusat', slug: 'jakarta-pusat' },
  { province_slug: 'dki-jakarta', name: 'Jakarta Barat', slug: 'jakarta-barat' },
  { province_slug: 'jawa-barat', name: 'Bandung', slug: 'bandung' },
  { province_slug: 'jawa-barat', name: 'Bekasi', slug: 'bekasi' },
  { province_slug: 'jawa-barat', name: 'Depok', slug: 'depok' },
  { province_slug: 'jawa-tengah', name: 'Semarang', slug: 'semarang' },
  { province_slug: 'jawa-timur', name: 'Surabaya', slug: 'surabaya' },
  { province_slug: 'banten', name: 'Tangerang', slug: 'tangerang' },
]

const carImages = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
]

export async function GET(request: NextRequest) {
  const results: { step: string; status: string; error?: string; data?: unknown }[] = []

  try {
    const admin = supabaseAdmin
    if (!admin) {
      return NextResponse.json({ 
        error: 'Supabase admin client not available. Check SUPABASE_SERVICE_ROLE_KEY env variable.' 
      }, { status: 500 })
    }

    // Step 1: Insert Brands
    const brandsToInsert = sampleBrands.map(b => ({ ...b, is_active: true }))
    const { error: brandsError } = await admin
      .from('brands')
      .upsert(brandsToInsert, { onConflict: 'slug' })
    
    if (brandsError) {
      results.push({ step: 'brands', status: 'error', error: brandsError.message })
    } else {
      results.push({ step: 'brands', status: 'success', data: `Inserted ${brandsToInsert.length} brands` })
    }

    // Step 2: Get brands for models
    const { data: brands } = await admin.from('brands').select('id, slug')
    
    if (!brands || brands.length === 0) {
      return NextResponse.json({ error: 'No brands found', results }, { status: 500 })
    }

    // Step 3: Insert Models
    let modelsInserted = 0
    for (const brand of brands) {
      const models = sampleModels[brand.slug] || []
      if (models.length > 0) {
        const modelsToInsert = models.map(m => ({
          brand_id: brand.id,
          name: m.name,
          slug: `${brand.slug}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
          body_type: m.body_type,
          is_active: true
        }))
        
        const { error } = await admin
          .from('car_models')
          .upsert(modelsToInsert, { onConflict: 'slug' })
        
        if (!error) {
          modelsInserted += models.length
        }
      }
    }
    results.push({ step: 'models', status: 'success', data: `Inserted ${modelsInserted} models` })

    // Step 4: Insert Provinces
    const { error: provincesError } = await admin
      .from('provinces')
      .upsert(sampleProvinces, { onConflict: 'slug' })
    
    if (provincesError) {
      results.push({ step: 'provinces', status: 'error', error: provincesError.message })
    } else {
      results.push({ step: 'provinces', status: 'success', data: `Inserted ${sampleProvinces.length} provinces` })
    }

    // Step 5: Insert Cities
    const { data: provinces } = await admin.from('provinces').select('id, slug')
    const provinceMap = new Map(provinces?.map(p => [p.slug, p.id]) || [])
    
    const citiesToInsert = sampleCities.map(c => ({
      province_id: provinceMap.get(c.province_slug),
      name: c.name,
      slug: c.slug
    })).filter(c => c.province_id)
    
    const { error: citiesError } = await admin
      .from('cities')
      .upsert(citiesToInsert, { onConflict: 'slug' })
    
    if (citiesError) {
      results.push({ step: 'cities', status: 'error', error: citiesError.message })
    } else {
      results.push({ step: 'cities', status: 'success', data: `Inserted ${citiesToInsert.length} cities` })
    }

    // Step 6: Get all data for listings
    const { data: allBrands } = await admin.from('brands').select('id, name')
    const { data: allModels } = await admin.from('car_models').select('id, brand_id, name, body_type')
    const { data: allCities } = await admin.from('cities').select('id, name, province_id')
    const { data: allProvinces } = await admin.from('provinces').select('id, name')

    if (!allBrands || !allModels || !allCities || !allProvinces) {
      return NextResponse.json({ error: 'Failed to fetch reference data', results }, { status: 500 })
    }

    // Step 7: Insert Sample Listings
    const listings: Array<{
      listing_number: string
      brand_id: number
      model_id: number
      year: number
      mileage: number
      fuel: string
      transmission: string
      body_type: string
      transaction_type: string
      condition: string
      price_cash: number
      price_negotiable: boolean
      city_id: number
      province_id: number
      city: string
      province: string
      title: string
      description: string
      slug: string
      status: string
      expired_at: string
    }> = []
    
    const fuels = ['bensin', 'bensin', 'diesel', 'hybrid']
    const transmissions = ['automatic', 'automatic', 'manual']
    const transactionTypes = ['jual', 'jual', 'jual', 'credit', 'rental']
    const conditions = ['bekas', 'bekas', 'bekas', 'baru']

    for (let i = 0; i < 30; i++) {
      const brand = allBrands[Math.floor(Math.random() * allBrands.length)]
      const brandModels = allModels.filter(m => m.brand_id === brand.id)
      const model = brandModels.length > 0 ? brandModels[Math.floor(Math.random() * brandModels.length)] : allModels[0]
      const city = allCities[Math.floor(Math.random() * allCities.length)]
      const province = allProvinces.find(p => p.id === city.province_id) || allProvinces[0]
      
      const year = 2018 + Math.floor(Math.random() * 6)
      const price = 100000000 + Math.floor(Math.random() * 400000000)
      const mileage = 10000 + Math.floor(Math.random() * 90000)
      const listingNumber = `CL-${Date.now()}-${String(i).padStart(4, '0')}`
      
      listings.push({
        listing_number: listingNumber,
        brand_id: brand.id,
        model_id: model.id,
        year,
        mileage,
        fuel: fuels[Math.floor(Math.random() * fuels.length)],
        transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
        body_type: model?.body_type || 'sedan',
        transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        price_cash: price,
        price_negotiable: true,
        city_id: city.id,
        province_id: province.id,
        city: city.name,
        province: province.name,
        title: `${brand.name} ${model?.name || 'Car'} ${year}`,
        description: `Mobil ${brand.name} ${model?.name || ''} tahun ${year} kondisi sangat terawat. Servis rutin di bengkel resmi. Surat-surat lengkap. SIAP BBN. Tidak ada accident.`,
        slug: `${brand.name.toLowerCase()}-${model?.name?.toLowerCase() || 'car'}-${year}-${listingNumber}`.replace(/\s+/g, '-'),
        status: 'active',
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    const { data: insertedListings, error: listingsError } = await admin
      .from('car_listings')
      .insert(listings)
      .select('id')
    
    if (listingsError) {
      results.push({ step: 'listings', status: 'error', error: listingsError.message })
    } else {
      results.push({ step: 'listings', status: 'success', data: `Inserted ${insertedListings?.length || 0} listings` })
      
      // Step 8: Insert Images for listings
      if (insertedListings && insertedListings.length > 0) {
        const images = insertedListings.flatMap((listing, idx) => [
          {
            car_listing_id: listing.id,
            image_url: carImages[idx % carImages.length],
            caption: 'Main Photo',
            is_primary: true,
            display_order: 0
          },
          {
            car_listing_id: listing.id,
            image_url: carImages[(idx + 1) % carImages.length],
            caption: 'Interior',
            is_primary: false,
            display_order: 1
          }
        ])
        
        const { error: imagesError } = await admin
          .from('car_images')
          .insert(images)
        
        if (imagesError) {
          results.push({ step: 'images', status: 'error', error: imagesError.message })
        } else {
          results.push({ step: 'images', status: 'success', data: `Inserted ${images.length} images` })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data completed!',
      results,
      summary: {
        brands: allBrands?.length || 0,
        models: allModels?.length || 0,
        listings: insertedListings?.length || 0
      }
    })

  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json({
      error: String(error),
      results
    }, { status: 500 })
  }
}
