import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Get admin client that bypasses RLS
const supabase = getSupabaseAdmin()

// Car image URLs
const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=600&fit=crop',
]

// Seller/Dealer data
const SELLERS = [
  {
    name: 'Rahmad Mobil',
    email: 'rahmad@rahmadmobil.com',
    phone: '081234567890',
    city: 'Tangerang Selatan',
    province: 'Banten',
    address: 'JLN SULTAN AGUNG KM NO 1.A KEL. MEDAN SATRIA',
  },
  {
    name: 'Auto Prima Jakarta',
    email: 'sales@autoprima.co.id',
    phone: '081234567891',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    address: 'JL. GAJAH MADA NO. 123, KEL. MANGGA DUA SELATAN',
  },
  {
    name: 'Mobil Surabaya Jaya',
    email: 'info@mobilsurabayajaya.com',
    phone: '081234567892',
    city: 'Surabaya',
    province: 'Jawa Timur',
    address: 'JL. AHMAD YANI NO. 456, KEL. GUBENG',
  },
  {
    name: 'Bandung Auto Gallery',
    email: 'sales@bandungauto.id',
    phone: '081234567893',
    city: 'Bandung',
    province: 'Jawa Barat',
    address: 'JL. SETIABUDI NO. 789, KEL. LEDENG',
  },
  {
    name: 'Medan Car Center',
    email: 'contact@medancarcenter.com',
    phone: '081234567894',
    city: 'Medan',
    province: 'Sumatera Utara',
    address: 'JL. GAJAH MADA NO. 321, KEL. KESAWAN',
  },
]

// Brands and Models
const BRANDS_MODELS: Record<string, { models: { name: string; variants: { name: string; engineCC: number; priceRange: [number, number] }[] }[] }> = {
  'Toyota': {
    models: [
      { name: 'Avanza', variants: [
        { name: '1.5 G MT', engineCC: 1496, priceRange: [180000000, 220000000] },
        { name: '1.5 G CVT', engineCC: 1496, priceRange: [195000000, 240000000] },
      ]},
      { name: 'Innova', variants: [
        { name: '2.0 V MT', engineCC: 1998, priceRange: [280000000, 350000000] },
        { name: '2.0 V AT', engineCC: 1998, priceRange: [300000000, 380000000] },
      ]},
      { name: 'Fortuner', variants: [
        { name: '2.4 VRZ AT', engineCC: 2393, priceRange: [480000000, 580000000] },
      ]},
      { name: 'Rush', variants: [
        { name: '1.5 G MT', engineCC: 1496, priceRange: [220000000, 270000000] },
      ]},
      { name: 'Veloz', variants: [
        { name: '1.5 CVT', engineCC: 1496, priceRange: [240000000, 290000000] },
      ]},
    ]
  },
  'Honda': {
    models: [
      { name: 'HR-V', variants: [
        { name: '1.5 E CVT', engineCC: 1498, priceRange: [320000000, 380000000] },
        { name: '1.5 SE CVT', engineCC: 1498, priceRange: [350000000, 420000000] },
      ]},
      { name: 'CR-V', variants: [
        { name: '1.5 Turbo CVT', engineCC: 1498, priceRange: [450000000, 550000000] },
      ]},
      { name: 'Brio', variants: [
        { name: 'RS CVT', engineCC: 1199, priceRange: [180000000, 220000000] },
      ]},
      { name: 'City', variants: [
        { name: '1.5 S CVT', engineCC: 1498, priceRange: [300000000, 360000000] },
      ]},
      { name: 'Jazz', variants: [
        { name: 'RS CVT', engineCC: 1498, priceRange: [280000000, 340000000] },
      ]},
    ]
  },
  'Mitsubishi': {
    models: [
      { name: 'Xpander', variants: [
        { name: 'Ultimate AT', engineCC: 1499, priceRange: [280000000, 330000000] },
      ]},
      { name: 'Xpander Cross', variants: [
        { name: 'Ultimate AT', engineCC: 1499, priceRange: [320000000, 380000000] },
      ]},
      { name: 'Pajero Sport', variants: [
        { name: 'Dakar 4x2 AT', engineCC: 2442, priceRange: [520000000, 620000000] },
      ]},
    ]
  },
  'Daihatsu': {
    models: [
      { name: 'Xenia', variants: [
        { name: '1.0 M MT', engineCC: 998, priceRange: [150000000, 190000000] },
      ]},
      { name: 'Terios', variants: [
        { name: 'R Deluxe MT', engineCC: 1496, priceRange: [200000000, 250000000] },
      ]},
      { name: 'Rocky', variants: [
        { name: '1.0 Turbo CVT', engineCC: 998, priceRange: [230000000, 280000000] },
      ]},
    ]
  },
  'Suzuki': {
    models: [
      { name: 'Ertiga', variants: [
        { name: 'GX AT', engineCC: 1462, priceRange: [250000000, 300000000] },
      ]},
      { name: 'XL7', variants: [
        { name: 'Zeta AT', engineCC: 1462, priceRange: [270000000, 320000000] },
      ]},
    ]
  },
  'Nissan': {
    models: [
      { name: 'X-Trail', variants: [
        { name: '2.5 CVT', engineCC: 2488, priceRange: [420000000, 500000000] },
      ]},
      { name: 'Serena', variants: [
        { name: 'Highway Star', engineCC: 1997, priceRange: [350000000, 420000000] },
      ]},
    ]
  },
  'BMW': {
    models: [
      { name: '320i', variants: [
        { name: 'Sport Line', engineCC: 1998, priceRange: [550000000, 700000000] },
      ]},
      { name: 'X5', variants: [
        { name: 'xDrive40i', engineCC: 2998, priceRange: [1200000000, 1500000000] },
      ]},
    ]
  },
  'Mercedes-Benz': {
    models: [
      { name: 'C200', variants: [
        { name: 'Avantgarde', engineCC: 1496, priceRange: [650000000, 850000000] },
      ]},
    ]
  },
  'Mazda': {
    models: [
      { name: 'CX-5', variants: [
        { name: '2.0 Touring AT', engineCC: 1998, priceRange: [400000000, 480000000] },
      ]},
      { name: 'Mazda3', variants: [
        { name: '2.0 Premium AT', engineCC: 1998, priceRange: [380000000, 450000000] },
      ]},
    ]
  },
  'Hyundai': {
    models: [
      { name: 'Creta', variants: [
        { name: '1.5 GLS IVT', engineCC: 1497, priceRange: [280000000, 340000000] },
      ]},
      { name: 'Santa Fe', variants: [
        { name: '2.2 CRDi AT', engineCC: 2199, priceRange: [550000000, 650000000] },
      ]},
    ]
  },
  'Wuling': {
    models: [
      { name: 'Almaz', variants: [
        { name: '1.5 Turbo CVT', engineCC: 1451, priceRange: [280000000, 340000000] },
      ]},
      { name: 'Cortez', variants: [
        { name: '1.8 LUX AT', engineCC: 1799, priceRange: [230000000, 280000000] },
      ]},
    ]
  },
}

// Colors
const COLORS = [
  { name: 'Putih', hex: '#FFFFFF' },
  { name: 'Hitam', hex: '#000000' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Abu-abu', hex: '#808080' },
  { name: 'Merah', hex: '#FF0000' },
  { name: 'Biru', hex: '#0000FF' },
  { name: 'Hijau', hex: '#008000' },
  { name: 'Emas', hex: '#FFD700' },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPrice(min: number, max: number): number {
  return Math.round(randomInt(min, max) / 1000000) * 1000000
}

export async function GET() {
  console.log('=== Starting seed process ===')

  try {
    // Step 1: Create colors
    console.log('Step 1: Creating colors...')
    const colorIds: Record<string, string> = {}

    for (const color of COLORS) {
      const { data: existing } = await supabase
        .from('car_colors')
        .select('id')
        .eq('name', color.name)
        .maybeSingle()

      if (existing) {
        colorIds[color.name] = existing.id
      } else {
        const { data, error } = await supabase
          .from('car_colors')
          .insert({ name: color.name, hex_code: color.hex })
          .select('id')
          .single()

        if (data && !error) {
          colorIds[color.name] = data.id
        }
      }
    }
    console.log(`Colors: ${Object.keys(colorIds).length}`)

    // Step 2: Create brands
    console.log('Step 2: Creating brands...')
    const brandIds: Record<string, string> = {}

    for (const brandName of Object.keys(BRANDS_MODELS)) {
      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .maybeSingle()

      if (existing) {
        brandIds[brandName] = existing.id
      } else {
        const { data, error } = await supabase
          .from('brands')
          .insert({ name: brandName })
          .select('id')
          .single()

        if (data && !error) {
          brandIds[brandName] = data.id
        }
      }
    }
    console.log(`Brands: ${Object.keys(brandIds).length}`)

    // Step 3: Create models
    console.log('Step 3: Creating models...')
    const modelIds: Record<string, string> = {}

    for (const [brandName, data] of Object.entries(BRANDS_MODELS)) {
      const brandId = brandIds[brandName]
      if (!brandId) continue

      for (const modelData of data.models) {
        const key = `${brandName}-${modelData.name}`

        const { data: existing } = await supabase
          .from('car_models')
          .select('id')
          .eq('brand_id', brandId)
          .eq('name', modelData.name)
          .maybeSingle()

        if (existing) {
          modelIds[key] = existing.id
        } else {
          const { data: newModel, error } = await supabase
            .from('car_models')
            .insert({
              brand_id: brandId,
              name: modelData.name,
            })
            .select('id')
            .single()

          if (newModel && !error) {
            modelIds[key] = newModel.id
          }
        }
      }
    }
    console.log(`Models: ${Object.keys(modelIds).length}`)

    // Step 4: Create variants
    console.log('Step 4: Creating variants...')
    const variantIds: Record<string, { id: string; priceRange: [number, number]; brand: string; model: string; variant: string; engineCC: number }> = {}

    for (const [brandName, data] of Object.entries(BRANDS_MODELS)) {
      for (const modelData of data.models) {
        const modelKey = `${brandName}-${modelData.name}`
        const modelId = modelIds[modelKey]
        if (!modelId) continue

        for (const variant of modelData.variants) {
          const key = `${modelKey}-${variant.name}`

          const { data: existing } = await supabase
            .from('car_variants')
            .select('id')
            .eq('model_id', modelId)
            .eq('name', variant.name)
            .maybeSingle()

          if (existing) {
            variantIds[key] = { id: existing.id, priceRange: variant.priceRange, brand: brandName, model: modelData.name, variant: variant.name, engineCC: variant.engineCC }
          } else {
            const { data: newVariant, error } = await supabase
              .from('car_variants')
              .insert({
                model_id: modelId,
                name: variant.name,
              })
              .select('id')
              .single()

            if (newVariant && !error) {
              variantIds[key] = { id: newVariant.id, priceRange: variant.priceRange, brand: brandName, model: modelData.name, variant: variant.name, engineCC: variant.engineCC }
            }
          }
        }
      }
    }
    console.log(`Variants: ${Object.keys(variantIds).length}`)

    // Step 5: Create users (sellers)
    console.log('Step 5: Creating users...')
    const userIds: string[] = []

    for (const seller of SELLERS) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', seller.email)
        .maybeSingle()

      if (existing) {
        userIds.push(existing.id)
      } else {
        const userId = uuidv4()
        const { error } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            role: 'dealer',
          })

        if (!error) {
          userIds.push(userId)
          console.log(`Created user: ${seller.name}`)
        }
      }
    }
    console.log(`Users: ${userIds.length}`)

    // Step 6: Create car listings
    console.log('Step 6: Creating car listings...')
    const variantKeys = Object.keys(variantIds)
    let listingCount = 0

    for (let i = 0; i < 50; i++) {
      const sellerIndex = i < 20 ? 0 : randomInt(0, SELLERS.length - 1)
      const userId = userIds[sellerIndex]
      const seller = SELLERS[sellerIndex]

      if (!userId) continue

      const variantKey = randomChoice(variantKeys)
      const vData = variantIds[variantKey]

      const brandId = brandIds[vData.brand]
      const modelKey = `${vData.brand}-${vData.model}`
      const modelId = modelIds[modelKey]

      if (!brandId || !modelId || !vData) continue

      const year = randomInt(2018, 2024)
      const mileage = year >= 2023 ? randomInt(1000, 20000) : year >= 2021 ? randomInt(20000, 50000) : randomInt(50000, 120000)
      const price = randomPrice(vData.priceRange[0], vData.priceRange[1])
      const colorNames = Object.keys(colorIds)
      const colorId = colorIds[randomChoice(colorNames)]

      const listingId = uuidv4()

      const { error: listingError } = await supabase
        .from('car_listings')
        .insert({
          id: listingId,
          user_id: userId,
          brand_id: brandId,
          model_id: modelId,
          variant_id: vData.id,
          year: year,
          exterior_color_id: colorId,
          engine_capacity: vData.engineCC,
          seat_count: randomInt(5, 7),
          mileage: mileage,
          price_cash: price,
          city: seller.city,
          province: seller.province,
          status: 'active',
        })

      if (listingError) {
        console.error(`Error listing ${i}:`, listingError.message)
        continue
      }

      // Add images
      for (let j = 0; j < randomInt(2, 4); j++) {
        await supabase
          .from('car_images')
          .insert({
            id: uuidv4(),
            car_listing_id: listingId,
            image_url: CAR_IMAGES[(i + j) % CAR_IMAGES.length],
            is_primary: j === 0,
          })
      }

      listingCount++
    }

    console.log('=== Seed completed ===')

    return NextResponse.json({
      success: true,
      message: 'Seed completed successfully!',
      data: {
        users: userIds.length,
        listings: listingCount,
        colors: Object.keys(colorIds).length,
        brands: Object.keys(brandIds).length,
        models: Object.keys(modelIds).length,
        variants: Object.keys(variantIds).length,
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
