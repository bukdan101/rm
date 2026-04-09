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
]

async function addMore() {
  const { data: brands } = await admin.from('brands').select('*')
  const { data: models } = await admin.from('car_models').select('*')
  const { data: cities } = await admin.from('cities').select('*')
  const { data: provinces } = await admin.from('provinces').select('*')

  const listings = []
  for (let i = 0; i < 7; i++) {
    const brand = brands![Math.floor(Math.random() * brands!.length)]
    const brandModels = models!.filter(m => m.brand_id === brand.id)
    const model = brandModels.length > 0 ? brandModels[Math.floor(Math.random() * brandModels.length)] : models![0]
    const city = cities![Math.floor(Math.random() * cities!.length)]
    const province = provinces!.find(p => p.id === city.province_id) || provinces![0]
    const year = 2019 + Math.floor(Math.random() * 5)
    const priceRanges = { mpv: [180000000, 400000000], suv: [280000000, 650000000], sedan: [220000000, 800000000], hatchback: [160000000, 320000000] }
    const priceRange = priceRanges[model?.body_type] || [150000000, 500000000]
    const price = priceRange[0] + Math.floor(Math.random() * (priceRange[1] - priceRange[0]))
    const listingNumber = 'CL-' + Date.now() + '-' + String(43 + i).padStart(4, '0')

    listings.push({
      listing_number: listingNumber,
      brand_id: brand.id,
      model_id: model.id,
      year,
      mileage: 10000 + Math.floor(Math.random() * 80000),
      fuel: 'bensin',
      transmission: 'automatic',
      body_type: model?.body_type || 'sedan',
      transaction_type: 'jual',
      condition: 'bekas',
      price_cash: price,
      price_negotiable: true,
      city: city.name,
      province: province?.name || 'Jakarta',
      city_id: city.id,
      province_id: province?.id,
      view_count: Math.floor(Math.random() * 300),
      title: brand.name + ' ' + (model?.name || 'Car') + ' ' + year,
      description: 'Mobil ' + brand.name + ' ' + (model?.name || '') + ' tahun ' + year + ' kondisi terawat.',
      slug: brand.slug + '-' + (model?.name?.toLowerCase().replace(/\\s+/g, '-') || 'car') + '-' + year + '-' + listingNumber,
      status: 'active',
      expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { data: inserted, error } = await admin.from('car_listings').insert(listings).select('id')
  console.log('Added', inserted?.length, 'more listings')

  const images = inserted!.flatMap((l, idx) => [
    { car_listing_id: l.id, image_url: carImages[idx % carImages.length], is_primary: true, display_order: 0 },
    { car_listing_id: l.id, image_url: carImages[(idx + 1) % carImages.length], is_primary: false, display_order: 1 },
  { car_listing_id: l.id, image_url: carImages[(idx + 2) % carImages.length], is_primary: false, display_order: 2 },
  ])
  await admin.from('car_images').insert(images)
  console.log('Added', images.length, 'images')

  // Final count
  const { count: finalCount } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  console.log('Total listings:', finalCount)
}

addMore()
