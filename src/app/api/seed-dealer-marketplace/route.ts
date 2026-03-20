import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Seed data untuk testing Dealer Marketplace
// Membuat: 5 dealer, 5 seller, 50 listing acak

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role - use auth admin for user creation
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ========================================
// DATA ARRAY UNTUK SEED
// ========================================

const DEALER_DATA = [
  {
    name: 'Auto Prima Motor',
    slug: 'auto-prima-motor',
    description: 'Dealer mobil bekas berkualitas dengan garansi 1 tahun. Spesialis Toyota dan Honda.',
    phone: '021-5555-1001',
    email: 'info@autoprima.co.id',
    address: 'Jl. Fatmawati No. 123',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
  },
  {
    name: 'Mobil Bagus Jakarta',
    slug: 'mobil-bagus-jakarta',
    description: 'Dealer terpercaya sejak 2005. Menyediakan berbagai merek mobil dengan harga kompetitif.',
    phone: '021-5555-1002',
    email: 'sales@mobilbagus.co.id',
    address: 'Jl. Gatot Subroto No. 45',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
  },
  {
    name: 'Sentral Mobil Surabaya',
    slug: 'sentral-mobil-surabaya',
    description: 'Pusat mobil bekas berkualitas di Jawa Timur. Tersedia layanan tukar tambah dan kredit.',
    phone: '031-5555-1003',
    email: 'info@sentralmobil.co.id',
    address: 'Jl. Ahmad Yani No. 789',
    city: 'Surabaya',
    province: 'Jawa Timur',
  },
  {
    name: 'Bandung Auto Gallery',
    slug: 'bandung-auto-gallery',
    description: 'Showroom mobil premium dan mewah. Koleksi BMW, Mercedes, dan Audi.',
    phone: '022-5555-1004',
    email: 'sales@bandungauto.co.id',
    address: 'Jl. Setiabudi No. 321',
    city: 'Bandung',
    province: 'Jawa Barat',
  },
  {
    name: 'Medan Car Center',
    slug: 'medan-car-center',
    description: 'Dealer mobil bekas terbesar di Sumatera Utara. Layanan antar ke seluruh Sumatera.',
    phone: '061-5555-1005',
    email: 'info@medancar.co.id',
    address: 'Jl. Gatot Subroto No. 555',
    city: 'Medan',
    province: 'Sumatera Utara',
  },
]

const SELLER_DATA = [
  {
    full_name: 'Budi Santoso',
    phone: '081234567801',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
  },
  {
    full_name: 'Siti Rahayu',
    phone: '081234567802',
    city: 'Bandung',
    province: 'Jawa Barat',
  },
  {
    full_name: 'Ahmad Wijaya',
    phone: '081234567803',
    city: 'Surabaya',
    province: 'Jawa Timur',
  },
  {
    full_name: 'Dewi Lestari',
    phone: '081234567804',
    city: 'Semarang',
    province: 'Jawa Tengah',
  },
  {
    full_name: 'Eko Prasetyo',
    phone: '081234567805',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
  },
]

const DESCRIPTIONS = [
  'Mobil dalam kondisi prima, terawat, tidak pernah kecelakaan. Service rutin di bengkel resmi. STNK dan BPKB asli lengkap.',
  'Satu pemilik dari baru. Low KM. Interior bersih wangi. AC dingin. Wajar untuk tahun kendaraan.',
  'Kondisi istimewa seperti baru. Full original. Tidak pernah penyok atau cat. Siap pakai.',
  'Mobil second kondisi terbaik. Sunroof, camera 360, all feature working perfectly. Urgent sale!',
  'Well maintained, servis rutin tiap 5000km. Ganti oli mesin, transmisi, dan filter AC. Dokumen lengkap.',
  'Mobil personal, tidak pernah dipinjam. Garasi tertutup. Body mulus interior kinclong.',
  'Pemilik perokok, interior masih oke. Mesin halus tidak berisik. Transmisi shift halus.',
  'Baru servis besar: ganti kampas rem, oli mesin, filter. Siap dipakai jarak jauh.',
  'Fiscal year end sale! Harga bisa nego masuk akal. Serius buyer only.',
  'Mobil impian keluarga. Kapasitas 7 penumpang. Irit bensin untuk ukuran MPV.',
]

const PROVINCES = [
  { id: '11111111-1111-1111-1111-111111111001', name: 'DKI Jakarta' },
  { id: '11111111-1111-1111-1111-111111111002', name: 'Jawa Barat' },
  { id: '11111111-1111-1111-1111-111111111003', name: 'Jawa Tengah' },
  { id: '11111111-1111-1111-1111-111111111004', name: 'Jawa Timur' },
  { id: '11111111-1111-1111-1111-111111111006', name: 'DI Yogyakarta' },
]

const CITIES = [
  { province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Selatan' },
  { province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Pusat' },
  { province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Barat' },
  { province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Timur' },
  { province_id: '11111111-1111-1111-1111-111111111002', name: 'Bandung' },
  { province_id: '11111111-1111-1111-1111-111111111002', name: 'Bekasi' },
  { province_id: '11111111-1111-1111-1111-111111111003', name: 'Semarang' },
  { province_id: '11111111-1111-1111-1111-111111111003', name: 'Solo' },
  { province_id: '11111111-1111-1111-1111-111111111004', name: 'Surabaya' },
  { province_id: '11111111-1111-1111-1111-111111111004', name: 'Malang' },
  { province_id: '11111111-1111-1111-1111-111111111006', name: 'Yogyakarta' },
]

// Helper: Generate random ID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper: Generate listing number
function generateListingNumber(index: number) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `LST-${year}${month}-${String(index).padStart(5, '0')}`
}

// Helper: Random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper: Random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function GET() {
  try {
    console.log('🌱 Starting seed for Dealer Marketplace...')

    // Step 1: Get existing master data (brands, models, colors)
    const { data: brands, error: brandsError } = await supabaseAdmin
      .from('brands')
      .select('id, name')
      .limit(20)

    if (brandsError || !brands || brands.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No brands found. Please seed master data first.',
        hint: 'Run /api/seed-master-data or /api/seed-full first',
      }, { status: 400 })
    }

    const { data: models, error: modelsError } = await supabaseAdmin
      .from('car_models')
      .select('id, brand_id, name, body_type')
      .limit(50)

    if (modelsError || !models || models.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No car models found. Please seed master data first.',
      }, { status: 400 })
    }

    const { data: colors, error: colorsError } = await supabaseAdmin
      .from('car_colors')
      .select('id, name')

    if (colorsError) {
      console.log('Warning: Could not fetch colors, will use null')
    }

    console.log(`✅ Found ${brands.length} brands, ${models.length} models, ${colors?.length || 0} colors`)

    // Step 2: Create 5 Dealer Users (Auth users + profiles)
    console.log('📦 Creating 5 dealer users...')
    const dealerProfiles = []
    const dealerRecords = []

    for (let i = 0; i < DEALER_DATA.length; i++) {
      const dealerData = DEALER_DATA[i]
      const dealerId = generateUUID()
      const email = `dealer${i + 1}@automarket.test`

      // Try to get existing user first
      let profileId: string
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = existingUser?.users?.find((u) => u.email === email)
      
      if (foundUser) {
        profileId = foundUser.id
        console.log(`Found existing dealer user: ${email}`)
      } else {
        // Create auth user using Supabase Auth Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: 'TestDealer123!',
          email_confirm: true,
          user_metadata: {
            name: dealerData.name,
            role: 'dealer',
          },
        })

        if (authError || !authData?.user) {
          console.log(`Warning: Could not create auth user for dealer ${i + 1}:`, authError?.message)
          continue
        }
        profileId = authData.user.id
      }

      // Update or insert profile with additional data
      // First try to update, if no rows affected, then insert
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .single()

      if (existingProfile) {
        await supabaseAdmin
          .from('profiles')
          .update({
            name: dealerData.name,
            phone: dealerData.phone,
            role: 'dealer',
            email_verified: true,
          })
          .eq('id', profileId)
      } else {
        // Insert new profile
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: profileId,
            name: dealerData.name,
            phone: dealerData.phone,
            role: 'dealer',
            email_verified: true,
          })
        if (insertError) {
          console.log(`Warning: Could not insert dealer profile ${i + 1}:`, insertError.message)
        }
      }

      dealerProfiles.push({ id: profileId, name: dealerData.name })

      // Create dealer record (use UUID refs for city_id and province_id if available)
      const { error: dealerError } = await supabaseAdmin
        .from('dealers')
        .insert({
          id: dealerId,
          owner_id: profileId,
          name: dealerData.name,
          slug: dealerData.slug,
          description: dealerData.description,
          phone: dealerData.phone,
          email: dealerData.email,
          address: dealerData.address,
          rating: (Math.random() * 1 + 4).toFixed(2), // 4.0 - 5.0
          review_count: randomInRange(10, 200),
          total_listings: 0,
          verified: true,
          is_active: true,
          subscription_tier: randomItem(['basic', 'premium', 'enterprise']),
        })

      if (dealerError) {
        console.log(`Warning: Could not create dealer record ${i + 1}:`, dealerError.message)
      } else {
        dealerRecords.push({ id: dealerId, name: dealerData.name, owner_id: profileId })
      }
    }

    console.log(`✅ Created ${dealerProfiles.length} dealer profiles, ${dealerRecords.length} dealer records`)

    // Step 3: Create 5 Seller Users (Auth users + profiles)
    console.log('📦 Creating 5 seller users...')
    const sellerProfiles = []

    for (let i = 0; i < SELLER_DATA.length; i++) {
      const sellerData = SELLER_DATA[i]
      const email = `seller${i + 1}@automarket.test`

      // Try to get existing user first
      let profileId: string
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = existingUser?.users?.find((u) => u.email === email)
      
      if (foundUser) {
        profileId = foundUser.id
        console.log(`Found existing seller user: ${email}`)
      } else {
        // Create auth user using Supabase Auth Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: 'TestSeller123!',
          email_confirm: true,
          user_metadata: {
            name: sellerData.full_name,
            role: 'seller',
          },
        })

        if (authError || !authData?.user) {
          console.log(`Warning: Could not create auth user for seller ${i + 1}:`, authError?.message)
          continue
        }
        profileId = authData.user.id
      }

      // Update or insert profile with additional data
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .single()

      if (existingProfile) {
        await supabaseAdmin
          .from('profiles')
          .update({
            name: sellerData.full_name,
            phone: sellerData.phone,
            role: 'seller',
            email_verified: Math.random() > 0.3, // 70% verified
          })
          .eq('id', profileId)
      } else {
        // Insert new profile
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: profileId,
            name: sellerData.full_name,
            phone: sellerData.phone,
            role: 'seller',
            email_verified: Math.random() > 0.3, // 70% verified
          })
        if (insertError) {
          console.log(`Warning: Could not insert seller profile ${i + 1}:`, insertError.message)
        }
      }

      sellerProfiles.push({
        id: profileId,
        name: sellerData.full_name,
        city: sellerData.city,
        province: sellerData.province,
      })
    }

    console.log(`✅ Created ${sellerProfiles.length} seller profiles`)

    // Step 4: Create 50 Car Listings
    console.log('📦 Creating 50 car listings...')
    const listings = []
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < 50; i++) {
      const listingId = generateUUID()
      const model = randomItem(models)
      const brand = brands.find((b) => b.id === model.brand_id)
      if (!brand) {
        console.log(`Warning: Brand not found for model ${model.name}, skipping listing ${i + 1}`)
        continue
      }
      const color = colors?.length ? randomItem(colors) : null
      
      // Get seller - if no sellers available, skip
      const allSellers = [...sellerProfiles, ...dealerProfiles]
      if (allSellers.length === 0) {
        console.log(`Warning: No sellers available, skipping listing ${i + 1}`)
        continue
      }
      const seller = randomItem(allSellers)
      const cityData = randomItem(CITIES)
      const province = PROVINCES.find((p) => p.id === cityData.province_id)

      const year = randomInRange(currentYear - 7, currentYear - 1)
      const price = randomInRange(100, 750) * 1000000 // 100M - 750M
      const mileage = randomInRange(5000, 150000)
      const condition = randomItem(['baru', 'bekas', 'sedang', 'istimewa'])
      const transmission = randomItem(['automatic', 'manual'])
      const fuel = randomItem(['bensin', 'diesel', 'hybrid'])

      const listing: Record<string, unknown> = {
        id: listingId,
        listing_number: generateListingNumber(i + 1),
        user_id: seller.id,
        brand_id: brand.id,
        model_id: model.id,
        title: `${brand.name} ${model.name} ${year}`,
        description: randomItem(DESCRIPTIONS),
        year: year,
        price_cash: price,
        price_negotiable: Math.random() > 0.3,
        mileage: mileage,
        condition: condition,
        transmission: transmission,
        fuel: fuel,
        body_type: model.body_type || randomItem(['sedan', 'suv', 'mpv', 'hatchback', 'pickup']),
        transaction_type: 'jual',
        status: 'active',
        visibility: randomItem(['dealer_marketplace', 'both', 'both', 'both']), // 75% visible in dealer marketplace
        city: cityData.name,
        province: province?.name || 'DKI Jakarta',
        province_id: cityData.province_id,
        view_count: randomInRange(50, 2000),
        favorite_count: randomInRange(0, 50),
        inquiry_count: randomInRange(0, 30),
        published_at: new Date(Date.now() - randomInRange(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
        published_to_dealer_marketplace_at: new Date(Date.now() - randomInRange(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      }

      if (color) {
        listing.exterior_color_id = color.id
      }

      const { error: listingError } = await supabaseAdmin
        .from('car_listings')
        .insert(listing)

      if (listingError) {
        console.log(`Warning: Could not create listing ${i + 1}:`, listingError.message)
        continue
      }

      listings.push(listing)

      // Add a primary image for each listing
      const imageUrl = `https://picsum.photos/seed/${listingId}/800/600`
      await supabaseAdmin.from('car_images').insert({
        id: generateUUID(),
        car_listing_id: listingId,
        image_url: imageUrl,
        thumbnail_url: imageUrl.replace('/800/600', '/400/300'),
        is_primary: true,
        display_order: 0,
      })
    }

    console.log(`✅ Created ${listings.length} car listings`)

    // Summary
    const result = {
      success: true,
      message: 'Seed completed successfully!',
      summary: {
        dealers: {
          profiles: dealerProfiles.length,
          records: dealerRecords.length,
        },
        sellers: {
          profiles: sellerProfiles.length,
        },
        listings: {
          total: listings.length,
        },
        dealersCreated: dealerProfiles.map((d) => ({ id: d.id, name: d.name })),
        sellersCreated: sellerProfiles.map((s) => ({ id: s.id, name: s.name })),
      },
    }

    console.log('🎉 Seed completed!')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
