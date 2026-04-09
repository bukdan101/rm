import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================
// TEST DATA CONFIGURATION
// ============================================

const SELLER_DATA = [
  { name: 'Budi Santoso', email: 'seller1@automarket.test', phone: '081234567801', city: 'Jakarta Selatan', province: 'DKI Jakarta' },
  { name: 'Siti Rahayu', email: 'seller2@automarket.test', phone: '081234567802', city: 'Bandung', province: 'Jawa Barat' },
  { name: 'Ahmad Wijaya', email: 'seller3@automarket.test', phone: '081234567803', city: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Dewi Lestari', email: 'seller4@automarket.test', phone: '081234567804', city: 'Semarang', province: 'Jawa Tengah' },
  { name: 'Eko Prasetyo', email: 'seller5@automarket.test', phone: '081234567805', city: 'Yogyakarta', province: 'DI Yogyakarta' },
]

const DEALER_DATA = [
  { name: 'Auto Prima Motor', email: 'dealer1@automarket.test', phone: '021-5555-1001', city: 'Jakarta Selatan', province: 'DKI Jakarta' },
  { name: 'Mobil Bagus Jakarta', email: 'dealer2@automarket.test', phone: '021-5555-1002', city: 'Jakarta Pusat', province: 'DKI Jakarta' },
  { name: 'Sentral Mobil Surabaya', email: 'dealer3@automarket.test', phone: '031-5555-1003', city: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Bandung Auto Gallery', email: 'dealer4@automarket.test', phone: '022-5555-1004', city: 'Bandung', province: 'Jawa Barat' },
  { name: 'Medan Car Center', email: 'dealer5@automarket.test', phone: '061-5555-1005', city: 'Medan', province: 'Sumatera Utara' },
]

const CAR_TITLES = [
  'Toyota Avanza 2022 - Siap Pakai',
  'Honda HR-V 2021 - Kondisi Istimewa',
  'Mitsubishi Xpander 2023 - Low KM',
  'Toyota Innova 2020 - Satu Pemilik',
  'Honda Brio 2022 - Irit BBM',
  'Suzuki Ertiga 2021 - Family Car',
  'Daihatsu Xenia 2022 - Terjangkau',
  'Toyota Fortuner 2019 - Prestige',
  'Honda CR-V 2020 - SUV Premium',
  'Wuling Almaz 2022 - Tech Savy',
]

const DESCRIPTIONS = [
  'Mobil dalam kondisi prima, terawat, tidak pernah kecelakaan. Service rutin di bengkel resmi. STNK dan BPKB asli lengkap.',
  'Satu pemilik dari baru. Low KM. Interior bersih wangi. AC dingin. Wajar untuk tahun kendaraan.',
  'Kondisi istimewa seperti baru. Full original. Tidak pernah penyok atau cat. Siap pakai.',
  'Mobil second kondisi terbaik. Sunroof, camera 360, all feature working perfectly.',
  'Well maintained, servis rutin tiap 5000km. Ganti oli mesin, transmisi, dan filter AC.',
]

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function GET() {
  console.log('🌱 Starting seed for Dealer Marketplace testing...')
  
  const results = {
    sellers: [] as { id: string; name: string; email: string }[],
    dealers: [] as { id: string; name: string; email: string }[],
    listings: 0,
    errors: [] as string[],
  }

  try {
    // ============================================
    // STEP 1: Create Seller Users + Profiles
    // ============================================
    console.log('📦 Creating 5 seller users...')
    
    for (const seller of SELLER_DATA) {
      try {
        // Check if user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === seller.email)
        
        let userId: string
        
        if (existingUser) {
          userId = existingUser.id
          console.log(`  ✓ Found existing seller: ${seller.email}`)
        } else {
          // Create auth user
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: seller.email,
            password: 'TestSeller123!',
            email_confirm: true,
            user_metadata: {
              name: seller.name,
              role: 'seller',
            },
          })
          
          if (authError || !authData?.user) {
            results.errors.push(`Failed to create seller ${seller.email}: ${authError?.message}`)
            continue
          }
          
          userId = authData.user.id
          console.log(`  ✓ Created seller: ${seller.email}`)
        }
        
        // Update profile
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          name: seller.name,
          phone: seller.phone,
          role: 'seller',
          city: seller.city,
          province: seller.province,
        })
        
        // Give 500 credits
        const { error: creditError } = await supabaseAdmin
          .from('user_credits')
          .select('id')
          .eq('user_id', userId)
          .single()
        
        if (creditError) {
          await supabaseAdmin.from('user_credits').insert({
            id: generateUUID(),
            user_id: userId,
            balance: 500,
          })
          console.log(`  ✓ Gave 500 credits to seller: ${seller.name}`)
        }
        
        results.sellers.push({ id: userId, name: seller.name, email: seller.email })
      } catch (err) {
        results.errors.push(`Error creating seller ${seller.email}: ${err}`)
      }
    }
    
    // ============================================
    // STEP 2: Create Dealer Users + Profiles + Dealer Records
    // ============================================
    console.log('📦 Creating 5 dealer users...')
    
    for (const dealer of DEALER_DATA) {
      try {
        // Check if user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === dealer.email)
        
        let userId: string
        
        if (existingUser) {
          userId = existingUser.id
          console.log(`  ✓ Found existing dealer: ${dealer.email}`)
        } else {
          // Create auth user
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: dealer.email,
            password: 'TestDealer123!',
            email_confirm: true,
            user_metadata: {
              name: dealer.name,
              role: 'dealer',
            },
          })
          
          if (authError || !authData?.user) {
            results.errors.push(`Failed to create dealer ${dealer.email}: ${authError?.message}`)
            continue
          }
          
          userId = authData.user.id
          console.log(`  ✓ Created dealer: ${dealer.email}`)
        }
        
        // Update profile
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          name: dealer.name,
          phone: dealer.phone,
          role: 'dealer',
          city: dealer.city,
          province: dealer.province,
        })
        
        // Create dealer record if not exists
        const { data: existingDealer } = await supabaseAdmin
          .from('dealers')
          .select('id')
          .eq('owner_id', userId)
          .maybeSingle()
        
        if (!existingDealer) {
          const dealerId = generateUUID()
          await supabaseAdmin.from('dealers').insert({
            id: dealerId,
            owner_id: userId,
            name: dealer.name,
            slug: dealer.name.toLowerCase().replace(/\s+/g, '-'),
            phone: dealer.phone,
            email: dealer.email,
            city: dealer.city,
            province: dealer.province,
            verified: true,
            is_active: true,
            subscription_tier: 'premium',
          })
          console.log(`  ✓ Created dealer record: ${dealer.name}`)
        }
        
        // Give 500 credits
        const { error: creditError } = await supabaseAdmin
          .from('user_credits')
          .select('id')
          .eq('user_id', userId)
          .single()
        
        if (creditError) {
          await supabaseAdmin.from('user_credits').insert({
            id: generateUUID(),
            user_id: userId,
            balance: 500,
          })
          console.log(`  ✓ Gave 500 credits to dealer: ${dealer.name}`)
        }
        
        results.dealers.push({ id: userId, name: dealer.name, email: dealer.email })
      } catch (err) {
        results.errors.push(`Error creating dealer ${dealer.email}: ${err}`)
      }
    }
    
    // ============================================
    // STEP 3: Get Brands & Models
    // ============================================
    console.log('📦 Fetching brands and models...')
    
    const { data: brands } = await supabaseAdmin
      .from('brands')
      .select('id, name')
      .limit(20)
    
    const { data: models } = await supabaseAdmin
      .from('car_models')
      .select('id, brand_id, name, body_type')
      .limit(50)
    
    const { data: colors } = await supabaseAdmin
      .from('car_colors')
      .select('id, name')
    
    if (!brands || brands.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No brands found. Run /api/seed-master-data first.',
      }, { status: 400 })
    }
    
    console.log(`  ✓ Found ${brands.length} brands, ${models?.length || 0} models`)
    
    // ============================================
    // STEP 4: Create Listings for Each Seller
    // ============================================
    console.log('📦 Creating 10 listings per seller...')
    
    for (const seller of results.sellers) {
      for (let i = 0; i < 10; i++) {
        try {
          const model = randomItem(models || [])
          const brand = brands?.find(b => b.id === model?.brand_id)
          const color = colors?.length ? randomItem(colors) : null
          
          if (!model || !brand) continue
          
          const year = randomInt(2018, 2024)
          const price = randomInt(100, 500) * 1000000
          const mileage = randomInt(5000, 100000)
          const transmission = randomItem(['automatic', 'manual'])
          const fuel = randomItem(['bensin', 'diesel', 'hybrid'])
          
          const listingId = generateUUID()
          
          // Create listing with visibility='both' (visible in dealer marketplace)
          const { error: listingError } = await supabaseAdmin
            .from('car_listings')
            .insert({
              id: listingId,
              user_id: seller.id,
              brand_id: brand.id,
              model_id: model.id,
              title: `${brand.name} ${model.name} ${year}`,
              description: randomItem(DESCRIPTIONS),
              year: year,
              price_cash: price,
              price_negotiable: true,
              mileage: mileage,
              condition: randomItem(['baru', 'bekas', 'istimewa']),
              transmission: transmission,
              fuel: fuel,
              body_type: model.body_type || randomItem(['sedan', 'suv', 'mpv', 'hatchback']),
              exterior_color_id: color?.id || null,
              city: SELLER_DATA.find(s => s.email === seller.email)?.city || 'Jakarta',
              province: SELLER_DATA.find(s => s.email === seller.email)?.province || 'DKI Jakarta',
              visibility: 'both', // KEY: visible in dealer marketplace
              status: 'active',
              transaction_type: 'jual',
              view_count: randomInt(10, 200),
              favorite_count: randomInt(0, 20),
              published_at: new Date().toISOString(),
              published_to_dealer_marketplace_at: new Date().toISOString(),
            })
          
          if (listingError) {
            console.error(`  ✗ Error creating listing: ${listingError.message}`)
            continue
          }
          
          // Add primary image
          const imageUrl = `https://picsum.photos/seed/${listingId}/800/600`
          await supabaseAdmin.from('car_images').insert({
            id: generateUUID(),
            car_listing_id: listingId,
            image_url: imageUrl,
            thumbnail_url: imageUrl.replace('/800/600', '/400/300'),
            is_primary: true,
            display_order: 0,
          })
          
          results.listings++
        } catch (err) {
          console.error(`  ✗ Error: ${err}`)
        }
      }
      
      console.log(`  ✓ Created 10 listings for ${seller.name}`)
    }
    
    console.log('🎉 Seed completed!')
    
    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully!',
      summary: {
        sellers: results.sellers.length,
        dealers: results.dealers.length,
        listings: results.listings,
        errors: results.errors.length,
      },
      accounts: {
        sellers: results.sellers.map(s => ({
          name: s.name,
          email: s.email,
          password: 'TestSeller123!',
        })),
        dealers: results.dealers.map(d => ({
          name: d.name,
          email: d.email,
          password: 'TestDealer123!',
        })),
      },
      errors: results.errors,
    })
    
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
