import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addFinal() {
  const { data: brands } = await admin.from('brands').select('*')
  const { data: models } = await admin.from('car_models').select('*')
  const { data: cities } = await admin.from('cities').select('*')
  const { data: provinces } = await admin.from('provinces').select('*')
  
  const brand = brands.find(b => b.slug === 'toyota') || brands[0]
  const model = models.find(m => m.brand_id === brand.id && m.name?.toLowerCase().includes('fortuner')) || models.find(m => m.brand_id === brand.id) || models[0]
  const city = cities.find(c => c.name === 'Jakarta Selatan') || cities[0]
  const province = provinces.find(p => p.id === city.province_id) || provinces[0]
  
  const ln = 'CL-' + Date.now() + '-0050'
  
  const { data: listing } = await admin.from('car_listings').insert({
    listing_number: ln,
    brand_id: brand.id,
    model_id: model.id,
    year: 2023,
    mileage: 15000,
    fuel: 'diesel',
    transmission: 'automatic',
    body_type: model?.body_type || 'suv',
    transaction_type: 'jual',
    condition: 'bekas',
    price_cash: 585000000,
    price_negotiable: true,
    city: city.name,
    province: province?.name || 'DKI Jakarta',
    city_id: city.id,
    province_id: province?.id,
    view_count: 200,
    title: 'Toyota Fortuner 2023 VRZ Diesel',
    description: 'Dijual Toyota Fortuner VRZ Diesel 2023, kondisi prime, KM 15rb. Tangan pertama.',
    slug: 'toyota-fortuner-2023-vrz-diesel-' + ln,
    status: 'active',
    featured_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  }).select('id')
  
  if (listing) {
    await admin.from('car_images').insert([
      { car_listing_id: listing[0].id, image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', is_primary: true, display_order: 0 },
      { car_listing_id: listing[0].id, image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', is_primary: false, display_order: 1 },
      { car_listing_id: listing[0].id, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', is_primary: false, display_order: 2 },
    ])
    console.log('Added: Toyota Fortuner 2023 VRZ Diesel')
  }
  
  const { count } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  console.log('Total listings:', count)
}

addFinal()
