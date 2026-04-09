import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const carImages = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
]

async function seed() {
  console.log('🚀 Starting complete seed...\n')
  
  // 1. Brands
  console.log('📥 Step 1: Inserting brands...')
  const brands = [
    { name: 'Toyota', slug: 'toyota', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png', is_popular: true },
    { name: 'Honda', slug: 'honda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo.svg/1200px-Honda_logo.svg.png', is_popular: true },
    { name: 'Mitsubishi', slug: 'mitsubishi', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mitsubishi_Motors_logo.svg/1200px-Mitsubishi_Motors_logo.svg.png', is_popular: true },
    { name: 'Suzuki', slug: 'suzuki', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png', is_popular: true },
    { name: 'Daihatsu', slug: 'daihatsu', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Daihatsu_logo.svg/1200px-Daihatsu_logo.svg.png', is_popular: true },
    { name: 'Nissan', slug: 'nissan', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nissan-logo.svg/1200px-Nissan-logo.svg.png', is_popular: false },
    { name: 'Mazda', slug: 'mazda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mazda_logo.svg/1200px-Mazda_logo.svg.png', is_popular: false },
    { name: 'Hyundai', slug: 'hyundai', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png', is_popular: false },
    { name: 'BMW', slug: 'bmw', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png', is_popular: false },
    { name: 'Mercedes-Benz', slug: 'mercedes-benz', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png', is_popular: false },
  ]
  const { data: insertedBrands } = await admin.from('brands').upsert(brands, { onConflict: 'slug' }).select()
  console.log(`✅ Inserted ${insertedBrands?.length || 0} brands`)

  // 2. Models
  console.log('\n📥 Step 2: Inserting models...')
  const modelsByBrand: Record<string, Array<{ name: string; body_type: string }>> = {
    'toyota': [
      { name: 'Avanza', body_type: 'mpv' }, { name: 'Innova', body_type: 'mpv' }, { name: 'Fortuner', body_type: 'suv' },
      { name: 'Rush', body_type: 'suv' }, { name: 'Yaris', body_type: 'hatchback' }, { name: 'Vios', body_type: 'sedan' },
      { name: 'Camry', body_type: 'sedan' }, { name: 'Hilux', body_type: 'pickup' }, { name: 'RAV4', body_type: 'suv' },
      { name: 'Alphard', body_type: 'mpv' }, { name: 'C-HR', body_type: 'suv' },
    ],
    'honda': [
      { name: 'Jazz', body_type: 'hatchback' }, { name: 'City', body_type: 'sedan' }, { name: 'Civic', body_type: 'sedan' },
      { name: 'CR-V', body_type: 'suv' }, { name: 'HR-V', body_type: 'suv' }, { name: 'BR-V', body_type: 'suv' },
      { name: 'Mobilio', body_type: 'mpv' }, { name: 'Brio', body_type: 'hatchback' },
    ],
    'mitsubishi': [
      { name: 'Xpander', body_type: 'mpv' }, { name: 'Pajero Sport', body_type: 'suv' }, { name: 'Triton', body_type: 'pickup' },
      { name: 'Outlander', body_type: 'suv' }, { name: 'Mirage', body_type: 'hatchback' },
    ],
    'suzuki': [
      { name: 'Ertiga', body_type: 'mpv' }, { name: 'XL7', body_type: 'mpv' }, { name: 'Jimny', body_type: 'suv' },
      { name: 'Vitara', body_type: 'suv' }, { name: 'Swift', body_type: 'hatchback' },
    ],
    'daihatsu': [
      { name: 'Xenia', body_type: 'mpv' }, { name: 'Terios', body_type: 'suv' }, { name: 'Rocky', body_type: 'suv' },
      { name: 'Ayla', body_type: 'hatchback' }, { name: 'Sigra', body_type: 'mpv' },
    ],
    'nissan': [
      { name: 'X-Trail', body_type: 'suv' }, { name: 'Qashqai', body_type: 'suv' },
      { name: 'Navara', body_type: 'pickup' }, { name: 'Livina', body_type: 'mpv' },
    ],
    'hyundai': [
      { name: 'Tucson', body_type: 'suv' }, { name: 'Santa Fe', body_type: 'suv' },
      { name: 'Creta', body_type: 'suv' }, { name: 'Ioniq', body_type: 'hatchback' },
    ],
    'bmw': [
      { name: '320i', body_type: 'sedan' }, { name: '530i', body_type: 'sedan' },
      { name: 'X3', body_type: 'suv' }, { name: 'X5', body_type: 'suv' },
    ],
    'mercedes-benz': [
      { name: 'C200', body_type: 'sedan' }, { name: 'E300', body_type: 'sedan' },
      { name: 'GLC 300', body_type: 'suv' }, { name: 'S450', body_type: 'sedan' },
    ],
  }
  
  let allModels: any[] = []
  for (const brand of insertedBrands || []) {
    const models = modelsByBrand[brand.slug] || []
    const toInsert = models.map(m => ({
      brand_id: brand.id,
      name: m.name,
      slug: `${brand.slug}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
      body_type: m.body_type,
      is_popular: true
    }))
    const { data: inserted } = await admin.from('car_models').upsert(toInsert, { onConflict: 'slug' }).select()
    if (inserted) allModels.push(...inserted)
  }
  console.log(`✅ Inserted ${allModels.length} models`)

  // 3. Provinces
  console.log('\n📥 Step 3: Inserting provinces...')
  const provinces = [
    { code: 'JK', name: 'DKI Jakarta', is_active: true },
    { code: 'JB', name: 'Jawa Barat', is_active: true },
    { code: 'JT', name: 'Jawa Tengah', is_active: true },
    { code: 'JI', name: 'Jawa Timur', is_active: true },
    { code: 'BT', name: 'Banten', is_active: true },
  ]
  const { data: insertedProvinces } = await admin.from('provinces').upsert(provinces, { onConflict: 'code' }).select()
  console.log(`✅ Inserted ${insertedProvinces?.length || 0} provinces`)

  // 4. Cities
  console.log('\n📥 Step 4: Inserting cities...')
  const cities = [
    { province_id: insertedProvinces![0].id, name: 'Jakarta Selatan' },
    { province_id: insertedProvinces![0].id, name: 'Jakarta Pusat' },
    { province_id: insertedProvinces![0].id, name: 'Jakarta Barat' },
    { province_id: insertedProvinces![1].id, name: 'Bandung' },
    { province_id: insertedProvinces![1].id, name: 'Bekasi' },
    { province_id: insertedProvinces![1].id, name: 'Depok' },
    { province_id: insertedProvinces![2].id, name: 'Semarang' },
    { province_id: insertedProvinces![3].id, name: 'Surabaya' },
    { province_id: insertedProvinces![4].id, name: 'Tangerang' },
  ]
  const { data: insertedCities } = await admin.from('cities').insert(cities).select()
  console.log(`✅ Inserted ${insertedCities?.length || 0} cities`)

  // 5. Create 5 dummy users via auth (without email confirmation)
  console.log('\n📥 Step 5: Creating users...')
  const usersToCreate = [
    { email: 'ahmad@automarket.id', password: 'Test123456', name: 'Ahmad Susanto' },
    { email: 'budi@automarket.id', password: 'Test123456', name: 'Budi Pratama' },
    { email: 'citra@automarket.id', password: 'Test123456', name: 'Citra Dewi' },
    { email: 'doni@automarket.id', password: 'Test123456', name: 'Doni Wijaya' },
    { email: 'eka@automarket.id', password: 'Test123456', name: 'Eka Putri' },
  ]
  
  let userIds: string[] = []
  for (const u of usersToCreate) {
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name }
    })
    if (authData.user) {
      userIds.push(authData.user.id)
      console.log(`  ✅ Created: ${u.name} (${authData.user.id.substring(0, 8)}...)`)
    } else {
      console.log(`  ⚠️ Error creating ${u.name}: ${authErr?.message}`)
    }
  }
  console.log(`✅ Created ${userIds.length} users`)

  // 6. Insert 50 Listings
  console.log('\n📥 Step 6: Inserting 50 car listings...')
  const fuels = ['bensin', 'bensin', 'bensin', 'diesel', 'hybrid']
  const transmissions = ['automatic', 'automatic', 'automatic', 'manual']
  const conditions = ['bekas', 'bekas', 'bekas', 'baru']
  const colors = ['Putih', 'Hitam', 'Silver', 'Abu-abu', 'Merah', 'Biru']
  const priceRanges: Record<string, [number, number]> = {
    'mpv': [150000000, 450000000],
    'suv': [250000000, 750000000],
    'sedan': [200000000, 900000000],
    'hatchback': [150000000, 350000000],
    'pickup': [300000000, 550000000],
  }
  
  const listings = []
  for (let i = 0; i < 50; i++) {
    const brand = insertedBrands![Math.floor(Math.random() * insertedBrands!.length)]
    const brandModels = allModels.filter(m => m.brand_id === brand.id)
    const model = brandModels.length > 0 ? brandModels[Math.floor(Math.random() * brandModels.length)] : allModels[0]
    const city = insertedCities![Math.floor(Math.random() * insertedCities!.length)]
    const province = insertedProvinces!.find(p => p.id === city.province_id) || insertedProvinces![0]
    const userId = userIds[i % userIds.length]
    const year = 2018 + Math.floor(Math.random() * 6)
    const priceRange = priceRanges[model?.body_type] || [150000000, 500000000]
    const price = priceRange[0] + Math.floor(Math.random() * (priceRange[1] - priceRange[0]))
    const listingNumber = `CL-${Date.now()}-${String(i).padStart(4, '0')}`
    
    listings.push({
      listing_number: listingNumber,
      user_id: userId,
      brand_id: brand.id,
      model_id: model.id,
      year,
      mileage: 5000 + Math.floor(Math.random() * 95000),
      fuel: fuels[Math.floor(Math.random() * fuels.length)],
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      body_type: model?.body_type || 'sedan',
      exterior_color_id: null,
      interior_color_id: null,
      transaction_type: 'jual',
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      price_cash: price,
      price_negotiable: true,
      city: city.name,
      province: province.name,
      city_id: city.id,
      province_id: province.id,
      view_count: Math.floor(Math.random() * 500),
      title: `${brand.name} ${model?.name || 'Car'} ${year}`,
      description: `Dijual ${brand.name} ${model?.name || ''} tahun ${year} kondisi terawat. Servis rutin, surat lengkap. SIAP BBN.`,
      slug: `${brand.slug}-${model?.name?.toLowerCase().replace(/\s+/g, '-') || 'car'}-${year}-${listingNumber}`,
      status: 'active',
      featured_until: i % 5 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { data: insertedListings, error: lErr } = await admin.from('car_listings').insert(listings).select('id, title')
  if (lErr) {
    console.log('❌ Listings error:', lErr.message)
    return
  }
  console.log(`✅ Inserted ${insertedListings?.length || 0} listings`)

  // 7. Insert Images
  console.log('\n📥 Step 7: Inserting images...')
  const images = (insertedListings || []).flatMap((listing, idx) => [
    { car_listing_id: listing.id, image_url: carImages[idx % carImages.length], is_primary: true, display_order: 0 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 1) % carImages.length], is_primary: false, display_order: 1 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 2) % carImages.length], is_primary: false, display_order: 2 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 3) % carImages.length], is_primary: false, display_order: 3 },
  ])
  const { error: imgErr } = await admin.from('car_images').insert(images)
  if (imgErr) console.log('⚠️ Images error:', imgErr.message)
  else console.log(`✅ Inserted ${images.length} images`)

  console.log('\n🎉 SEED DATA COMPLETED!')
  console.log('==========================================')
  console.log(`✅ Brands: ${insertedBrands?.length || 0}`)
  console.log(`✅ Models: ${allModels.length}`)
  console.log(`✅ Provinces: ${insertedProvinces?.length || 0}`)
  console.log(`✅ Cities: ${insertedCities?.length || 0}`)
  console.log(`✅ Users: ${userIds.length}`)
  console.log(`✅ Listings: ${insertedListings?.length || 0}`)
  console.log(`✅ Images: ${images.length}`)
}

seed()
