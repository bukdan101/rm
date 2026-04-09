import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Sample Users
const sampleUsers = [
  { id: 'user-001-automarket', email: 'ahmad.dealer@automarket.id', full_name: 'Ahmad Susanto', phone: '081234567890', role: 'dealer', is_verified: true },
  { id: 'user-002-automarket', email: 'budi.seller@automarket.id', full_name: 'Budi Pratama', phone: '081234567891', role: 'seller', is_verified: true },
  { id: 'user-003-automarket', email: 'citra.dealer@automarket.id', full_name: 'Citra Dewi', phone: '081234567892', role: 'dealer', is_verified: true },
  { id: 'user-004-automarket', email: 'doni.seller@automarket.id', full_name: 'Doni Wijaya', phone: '081234567893', role: 'seller', is_verified: false },
  { id: 'user-005-automarket', email: 'eka.seller@automarket.id', full_name: 'Eka Putri', phone: '081234567894', role: 'seller', is_verified: true },
]

// Brands
const sampleBrands = [
  { name: 'Toyota', slug: 'toyota', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png', is_active: true },
  { name: 'Honda', slug: 'honda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo.svg/1200px-Honda_logo.svg.png', is_active: true },
  { name: 'Mitsubishi', slug: 'mitsubishi', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mitsubishi_Motors_logo.svg/1200px-Mitsubishi_Motors_logo.svg.png', is_active: true },
  { name: 'Suzuki', slug: 'suzuki', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png', is_active: true },
  { name: 'Daihatsu', slug: 'daihatsu', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Daihatsu_logo.svg/1200px-Daihatsu_logo.svg.png', is_active: true },
  { name: 'Nissan', slug: 'nissan', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nissan-logo.svg/1200px-Nissan-logo.svg.png', is_active: true },
  { name: 'Mazda', slug: 'mazda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mazda_logo.svg/1200px-Mazda_logo.svg.png', is_active: true },
  { name: 'Hyundai', slug: 'hyundai', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png', is_active: true },
  { name: 'BMW', slug: 'bmw', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png', is_active: true },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png', is_active: true },
]

// Car Models
const sampleModels: Record<string, Array<{ name: string; body_type: string; price_range: [number, number] }>> = {
  'toyota': [
    { name: 'Avanza', body_type: 'mpv', price_range: [180000000, 280000000] },
    { name: 'Innova', body_type: 'mpv', price_range: [280000000, 450000000] },
    { name: 'Fortuner', body_type: 'suv', price_range: [420000000, 750000000] },
    { name: 'Rush', body_type: 'suv', price_range: [230000000, 320000000] },
    { name: 'Yaris', body_type: 'hatchback', price_range: [220000000, 320000000] },
    { name: 'Vios', body_type: 'sedan', price_range: [240000000, 340000000] },
    { name: 'Camry', body_type: 'sedan', price_range: [550000000, 850000000] },
    { name: 'Hilux', body_type: 'pickup', price_range: [350000000, 550000000] },
    { name: 'RAV4', body_type: 'suv', price_range: [480000000, 650000000] },
    { name: 'Alphard', body_type: 'mpv', price_range: [950000000, 1800000000] },
  ],
  'honda': [
    { name: 'Jazz', body_type: 'hatchback', price_range: [200000000, 300000000] },
    { name: 'City', body_type: 'sedan', price_range: [280000000, 400000000] },
    { name: 'Civic', body_type: 'sedan', price_range: [450000000, 650000000] },
    { name: 'CR-V', body_type: 'suv', price_range: [420000000, 650000000] },
    { name: 'HR-V', body_type: 'suv', price_range: [320000000, 450000000] },
    { name: 'BR-V', body_type: 'suv', price_range: [260000000, 350000000] },
    { name: 'Mobilio', body_type: 'mpv', price_range: [200000000, 280000000] },
    { name: 'Brio', body_type: 'hatchback', price_range: [150000000, 230000000] },
  ],
  'mitsubishi': [
    { name: 'Xpander', body_type: 'mpv', price_range: [240000000, 340000000] },
    { name: 'Pajero Sport', body_type: 'suv', price_range: [450000000, 700000000] },
    { name: 'Triton', body_type: 'pickup', price_range: [350000000, 550000000] },
    { name: 'Outlander', body_type: 'suv', price_range: [400000000, 550000000] },
    { name: 'Mirage', body_type: 'hatchback', price_range: [150000000, 220000000] },
  ],
  'suzuki': [
    { name: 'Ertiga', body_type: 'mpv', price_range: [200000000, 280000000] },
    { name: 'XL7', body_type: 'mpv', price_range: [240000000, 320000000] },
    { name: 'Jimny', body_type: 'suv', price_range: [280000000, 400000000] },
    { name: 'Vitara', body_type: 'suv', price_range: [320000000, 450000000] },
    { name: 'Swift', body_type: 'hatchback', price_range: [250000000, 350000000] },
  ],
  'daihatsu': [
    { name: 'Xenia', body_type: 'mpv', price_range: [150000000, 230000000] },
    { name: 'Terios', body_type: 'suv', price_range: [200000000, 290000000] },
    { name: 'Rocky', body_type: 'suv', price_range: [220000000, 300000000] },
    { name: 'Ayla', body_type: 'hatchback', price_range: [110000000, 170000000] },
    { name: 'Sigra', body_type: 'mpv', price_range: [150000000, 220000000] },
  ],
  'nissan': [
    { name: 'X-Trail', body_type: 'suv', price_range: [380000000, 550000000] },
    { name: 'Qashqai', body_type: 'suv', price_range: [350000000, 480000000] },
    { name: 'Navara', body_type: 'pickup', price_range: [380000000, 520000000] },
    { name: 'Livina', body_type: 'mpv', price_range: [230000000, 320000000] },
  ],
  'hyundai': [
    { name: 'Tucson', body_type: 'suv', price_range: [420000000, 580000000] },
    { name: 'Santa Fe', body_type: 'suv', price_range: [550000000, 750000000] },
    { name: 'Creta', body_type: 'suv', price_range: [320000000, 420000000] },
    { name: 'Ioniq', body_type: 'hatchback', price_range: [500000000, 700000000] },
  ],
  'bmw': [
    { name: '320i', body_type: 'sedan', price_range: [650000000, 950000000] },
    { name: '530i', body_type: 'sedan', price_range: [950000000, 1400000000] },
    { name: 'X3', body_type: 'suv', price_range: [850000000, 1200000000] },
    { name: 'X5', body_type: 'suv', price_range: [1250000000, 1800000000] },
  ],
  'mercedes-benz': [
    { name: 'C200', body_type: 'sedan', price_range: [750000000, 1100000000] },
    { name: 'E300', body_type: 'sedan', price_range: [1100000000, 1600000000] },
    { name: 'GLC 300', body_type: 'suv', price_range: [1000000000, 1400000000] },
  ],
}

// Provinces
const sampleProvinces = [
  { name: 'DKI Jakarta', slug: 'dki-jakarta' },
  { name: 'Jawa Barat', slug: 'jawa-barat' },
  { name: 'Jawa Tengah', slug: 'jawa-tengah' },
  { name: 'Jawa Timur', slug: 'jawa-timur' },
  { name: 'Banten', slug: 'banten' },
]

// Cities
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

// Car images
const carImages = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
]

async function runSeed() {
  console.log('🚀 Starting seed data...')
  
  try {
    // 1. Insert Users
    console.log('📥 Inserting users...')
    const { data: users, error: usersError } = await admin
      .from('profiles')
      .upsert(sampleUsers, { onConflict: 'id' })
      .select('id, full_name, email, role')
    
    if (usersError) console.log('⚠️ Users error:', usersError.message)
    else console.log(`✅ Inserted ${users?.length} users`)

    // 2. Insert Brands
    console.log('📥 Inserting brands...')
    const { data: brands, error: brandsError } = await admin
      .from('brands')
      .upsert(sampleBrands, { onConflict: 'slug' })
      .select('id, name, slug')
    
    if (brandsError) console.log('⚠️ Brands error:', brandsError.message)
    else console.log(`✅ Inserted ${brands?.length} brands`)

    // 3. Insert Models
    console.log('📥 Inserting models...')
    let allModels: any[] = []
    for (const brand of brands || []) {
      const models = sampleModels[brand.slug] || []
      if (models.length > 0) {
        const modelsToInsert = models.map(m => ({
          brand_id: brand.id,
          name: m.name,
          slug: `${brand.slug}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
          body_type: m.body_type,
          is_active: true
        }))
        
        const { data: insertedModels } = await admin
          .from('car_models')
          .upsert(modelsToInsert, { onConflict: 'slug' })
          .select('id, brand_id, name, body_type')
        
        if (insertedModels) {
          insertedModels.forEach(m => allModels.push({ ...m, brand_slug: brand.slug, price_range: models.find(x => x.name === m.name)?.price_range }))
        }
      }
    }
    console.log(`✅ Inserted ${allModels.length} models`)

    // 4. Insert Provinces
    console.log('📥 Inserting provinces...')
    const { data: provinces, error: provError } = await admin
      .from('provinces')
      .upsert(sampleProvinces, { onConflict: 'slug' })
      .select('id, name, slug')
    
    if (provError) console.log('⚠️ Provinces error:', provError.message)
    else console.log(`✅ Inserted ${provinces?.length} provinces`)

    // 5. Insert Cities
    console.log('📥 Inserting cities...')
    const provinceMap = new Map(provinces?.map(p => [p.slug, p.id]) || [])
    const citiesToInsert = sampleCities.map(c => ({
      province_id: provinceMap.get(c.province_slug),
      name: c.name,
      slug: c.slug
    })).filter(c => c.province_id)
    
    const { data: cities, error: citiesError } = await admin
      .from('cities')
      .upsert(citiesToInsert, { onConflict: 'slug' })
      .select('id, name, province_id')
    
    if (citiesError) console.log('⚠️ Cities error:', citiesError.message)
    else console.log(`✅ Inserted ${cities?.length} cities`)

    // 6. Insert 50 Listings
    console.log('📥 Inserting 50 car listings...')
    const userIds = users?.map(u => u.id) || []
    const cityData = cities || []
    const provinceData = provinces || []
    
    const fuels = ['bensin', 'bensin', 'bensin', 'diesel', 'hybrid']
    const transmissions = ['automatic', 'automatic', 'automatic', 'manual']
    const conditions = ['bekas', 'bekas', 'bekas', 'baru']
    const colors = ['Putih', 'Hitam', 'Silver', 'Abu-abu', 'Merah', 'Biru']
    
    const listings = []
    for (let i = 0; i < 50; i++) {
      const brand = brands![Math.floor(Math.random() * brands!.length)]
      const brandModels = allModels.filter(m => m.brand_id === brand.id)
      const model = brandModels.length > 0 
        ? brandModels[Math.floor(Math.random() * brandModels.length)] 
        : allModels[Math.floor(Math.random() * allModels.length)]
      
      const city = cityData[Math.floor(Math.random() * cityData.length)]
      const province = provinceData?.find(p => p.id === city?.province_id) || provinceData![0]
      const userId = userIds[i % userIds.length]
      
      const year = 2018 + Math.floor(Math.random() * 6)
      const priceRange = model?.price_range || [150000000, 500000000]
      const price = priceRange[0] + Math.floor(Math.random() * (priceRange[1] - priceRange[0]))
      const mileage = 5000 + Math.floor(Math.random() * 95000)
      const listingNumber = `CL-${Date.now()}-${String(i).padStart(4, '0')}`
      const isFeatured = i % 5 === 0
      
      listings.push({
        listing_number: listingNumber,
        user_id: userId,
        brand_id: brand.id,
        model_id: model.id,
        year,
        mileage,
        fuel: fuels[Math.floor(Math.random() * fuels.length)],
        transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
        body_type: model?.body_type || 'sedan',
        exterior_color: colors[Math.floor(Math.random() * colors.length)],
        transaction_type: 'jual',
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        price_cash: price,
        price_negotiable: true,
        city_id: city?.id || cityData[0]?.id,
        province_id: province?.id || provinceData![0]?.id,
        city: city?.name || 'Jakarta',
        province: province?.name || 'DKI Jakarta',
        title: `${brand.name} ${model?.name || 'Car'} ${year}`,
        description: `Dijual ${brand.name} ${model?.name || ''} tahun ${year} kondisi sangat terawat. Servis rutin di bengkel resmi. Surat-surat lengkap. SIAP BBN.`,
        slug: `${brand.name.toLowerCase()}-${model?.name?.toLowerCase().replace(/\s+/g, '-') || 'car'}-${year}-${listingNumber}`.replace(/\s+/g, '-'),
        status: 'active',
        featured_until: isFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    const { data: insertedListings, error: listingsError } = await admin
      .from('car_listings')
      .insert(listings)
      .select('id, title, price_cash')
    
    if (listingsError) console.log('⚠️ Listings error:', listingsError.message)
    else console.log(`✅ Inserted ${insertedListings?.length} listings`)

    // 7. Insert Images
    console.log('📥 Inserting images...')
    if (insertedListings && insertedListings.length > 0) {
      const images = insertedListings.flatMap((listing, idx) => [
        { car_listing_id: listing.id, image_url: carImages[idx % carImages.length], caption: 'Tampak Depan', is_primary: true, display_order: 0 },
        { car_listing_id: listing.id, image_url: carImages[(idx + 1) % carImages.length], caption: 'Tampak Samping', is_primary: false, display_order: 1 },
        { car_listing_id: listing.id, image_url: carImages[(idx + 2) % carImages.length], caption: 'Interior', is_primary: false, display_order: 2 },
        { car_listing_id: listing.id, image_url: carImages[(idx + 3) % carImages.length], caption: 'Mesin', is_primary: false, display_order: 3 },
      ])
      
      const { error: imgError } = await admin.from('car_images').insert(images)
      if (imgError) console.log('⚠️ Images error:', imgError.message)
      else console.log(`✅ Inserted ${images.length} images`)
    }

    console.log('\n🎉 Seed data completed!')
    console.log('Summary:')
    console.log(`  - Users: ${users?.length || 0}`)
    console.log(`  - Brands: ${brands?.length || 0}`)
    console.log(`  - Models: ${allModels.length}`)
    console.log(`  - Listings: ${insertedListings?.length || 0}`)
    console.log(`  - Images: ${(insertedListings?.length || 0) * 4}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

runSeed()
