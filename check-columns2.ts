import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkColumns() {
  // Check brands - try insert with various columns
  console.log('=== BRANDS - trying different columns ===')
  
  // Try with just name
  let result = await admin.from('brands').insert({ name: 'TestBrand' }).select()
  console.log('With name only:', result.error?.message || 'SUCCESS')
  
  // Try with name and slug
  result = await admin.from('brands').insert({ name: 'TestBrand2', slug: 'test-brand-2' }).select()
  console.log('With name+slug:', result.error?.message || 'SUCCESS', result.data)
  
  // Check provinces
  console.log('\n=== PROVINCES - trying different columns ===')
  result = await admin.from('provinces').insert({ name: 'TestProvince', slug: 'test-province' }).select()
  console.log('With name+slug:', result.error?.message || 'SUCCESS', result.data)
  
  // Check car_models
  console.log('\n=== CAR_MODELS ===')
  result = await admin.from('car_models').insert({ name: 'TestModel' }).select()
  console.log('With name only:', result.error?.message)
  
  // Check car_listings
  console.log('\n=== CAR_LISTINGS ===')
  result = await admin.from('car_listings').insert({ title: 'TestCar' }).select()
  console.log('With title only:', result.error?.message)
  
  // Check car_images
  console.log('\n=== CAR_IMAGES ===')
  result = await admin.from('car_images').insert({ image_url: 'test' }).select()
  console.log('With image_url only:', result.error?.message)
}

checkColumns()
