import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSchema() {
  // Get actual data to see columns
  console.log('=== BRANDS COLUMNS ===')
  let result = await admin.from('brands').select('*').limit(1)
  if (result.data && result.data[0]) {
    console.log('Columns:', Object.keys(result.data[0]))
  } else {
    // Insert test to see columns
    const testResult = await admin.from('brands').insert({ name: 'Test', slug: 'test' }).select()
    console.log('After insert:', testResult.data?.[0] ? Object.keys(testResult.data[0]) : testResult.error?.message)
    // Clean up
    if (testResult.data) await admin.from('brands').delete().eq('slug', 'test')
  }

  // Check car_models
  console.log('\n=== CAR_MODELS COLUMNS ===')
  // Try to insert with brand_id
  const brands = await admin.from('brands').select('id').limit(1)
  if (brands.data && brands.data[0]) {
    const modelResult = await admin.from('car_models').insert({ 
      brand_id: brands.data[0].id, 
      name: 'TestModel',
      slug: 'test-model'
    }).select()
    console.log('After insert:', modelResult.data?.[0] ? Object.keys(modelResult.data[0]) : modelResult.error?.message)
    if (modelResult.data) await admin.from('car_models').delete().eq('slug', 'test-model')
  }

  // Check provinces
  console.log('\n=== PROVINCES COLUMNS ===')
  const provResult = await admin.from('provinces').insert({ name: 'TestProv' }).select()
  console.log('After insert:', provResult.data?.[0] ? Object.keys(provResult.data[0]) : provResult.error?.message)
  if (provResult.data) await admin.from('provinces').delete().eq('name', 'TestProv')

  // Check cities
  console.log('\n=== CITIES COLUMNS ===')
  const cityResult = await admin.from('cities').insert({ name: 'TestCity' }).select()
  console.log('After insert:', cityResult.data?.[0] ? Object.keys(cityResult.data[0]) : cityResult.error?.message)
  if (cityResult.data) await admin.from('cities').delete().eq('name', 'TestCity')

  // Check car_listings
  console.log('\n=== CAR_LISTINGS COLUMNS ===')
  const listingResult = await admin.from('car_listings').insert({ title: 'Test' }).select()
  console.log('Error:', listingResult.error?.message)

  // Check car_images
  console.log('\n=== CAR_IMAGES COLUMNS ===')
  const imgResult = await admin.from('car_images').insert({ image_url: 'test' }).select()
  console.log('Error:', listing in foreground, hero shot, dynamic angle low angle' + 'is elegantly, price, 25000, dynamic, high-end, hero shot, hero focus, 25000, dynamic, angle, dynamic, hero' }).select()
  console.log('Error:', listingResult.error?.message)
  
  // Check profiles columns
  console.log('\n 25000, angle, hero focus, price, angle: 25000).select()
  console.log('After insert:', result.data?.[0] ? Object.keys(result.data[0]) : result.error?.message)
}

checkSchema()
