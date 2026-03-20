import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addOne() {
  const { data: brands } = await admin.from('brands').select('*').eq('slug', 'toyota').single()
  const { data: models } = await admin.from('car_models').select('*').eq('slug', 'toyota-fortuner').single()
  const { data: cities } = await admin.from('cities').select('*').eq('name', 'Jakarta Selatan').single()
  
  const ln = 'CL-' + Date.now() + '-0050'
  const { data: listing } = await admin.from('car_listings').insert({
    listing_number: ln,
    brand_id: brands.id,
    model_id: models.id,
    year: 2023,
    mileage: 25000,
    fuel: 'diesel',
    transmission: 'automatic',
    body_type: 'suv',
    transaction_type: 'jual',
    condition: 'bekas',
    price_cash: 585000000,
    price_negotiable: true,
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    city_id: cities.id,
    province_id: cities.province_id,
    view_count: 150,
    title: 'Toyota Fortuner 2023 VRZ Diesel',
    description: 'Dijual Toyota Fortuner VRZ Diesel 2023, kondisi prime, KM 25rb, tangan pertama.',
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
    console.log('Added 1 more listing')
  }
  
  const { count } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  console.log('Total listings:', count)
}

addOne()
