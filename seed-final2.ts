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
  console.log('🚀 Starting final seed...\n')
  
  // Get data
  const { data: brands } = await admin.from('brands').select('*')
  const { data: provinces } = await admin.from('provinces').select('*')
  const { data: cities } = await admin.from('cities').select('*')
  const { data: models } = await admin.from('car_models').select('*')
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  
  console.log(`✅ Brands: ${brands?.length || 0}`)
  console.log(`✅ Models: ${models?.length || 0}`)
  console.log(`✅ Provinces: ${provinces?.length || 0}`)
  console.log(`✅ Cities: ${cities?.length || 0}`)
  console.log(`✅ Auth Users: ${authUsers?.length || 0}`)

  // Get valid user IDs from auth
  const userIds = (authUsers || []).map(u => u.id)
  console.log('\nUser IDs:', userIds)

  // Insert 50 Listings
  console.log('\n📥 Inserting 50 car listings...')
  
  const fuels = ['bensin', 'bensin', 'bensin', 'diesel']
  const transmissions = ['automatic', 'automatic', 'manual']
  const conditions = ['bekas', 'bekas', 'baru']
  const priceRanges: Record<string, [number, number]> = {
    'mpv': [150000000, 450000000],
    'suv': [250000000, 750000000],
    'sedan': [200000000, 900000000],
    'hatchback': [150000000, 350000000],
    'pickup': [300000000, 550000000],
  }
  
  const listings = []
  for (let i = 0; i < 50; i++) {
    const brand = brands![Math.floor(Math.random() * brands!.length)]
    const brandModels = models!.filter(m => m.brand_id === brand.id)
    const model = brandModels.length > 0 
      ? brandModels[Math.floor(Math.random() * brandModels.length)] 
      : models![Math.floor(Math.random() * models!.length)]
    const city = cities![Math.floor(Math.random() * cities!.length)]
    const province = provinces!.find(p => p.id === city.province_id) || provinces![0]
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
      description: `Dijual ${brand.name} ${model?.name || ''} tahun ${year} kondisi terawat. Servis rutin, surat lengkap.`,
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

  // Insert Images
  console.log('\n📥 Inserting images...')
  const images = (insertedListings || []).flatMap((listing, idx) => [
    { car_listing_id: listing.id, image_url: carImages[idx % carImages.length], is_primary: true, display_order: 0 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 1) % carImages.length], is_primary: false, display_order: 1 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 2) % carImages.length], is_primary: false, display_order: 2 },
    { car_listing_id: listing.id, image_url: carImages[(idx + 3) % carImages.length], is_primary: false, display_order: 3 },
  ])
  const { error: imgErr } = await admin.from('car_images').insert(images)
  if (imgErr) console.log('⚠️ Images error:', imgErr.message)
  else console.log(`✅ Inserted ${images.length} images`)

  console.log('\n🎉 SEED COMPLETED!')
  console.log('==========================================')
  console.log(`✅ Brands: ${brands?.length || 0}`)
  console.log(`✅ Models: ${models?.length || 0}`)
  console.log(`✅ Listings: ${insertedListings?.length || 0}`)
  console.log(`✅ Images: ${images.length}`)
}

seed()
