import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log('🚀 Starting seed...\n')
  
  // Clean up test data first
  await admin.from('brands').delete().eq('slug', 'test-brand-2')
  
  // 1. Insert Brands (using discovered columns)
  console.log('📥 Inserting brands...')
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
  
  const { data: insertedBrands, error: bErr } = await admin.from('brands').upsert(brands, { onConflict: 'slug' }).select()
  if (bErr) {
    console.log('❌ Brands error:', bErr.message)
    return
  }
  console.log(`✅ Inserted ${insertedBrands?.length} brands`)

  // 2. Insert Models - need to check columns first
  console.log('\n📥 Inserting models...')
  const { error: mTestErr } = await admin.from('car_models').insert({ brand_id: insertedBrands![0].id, name: 'Test' }).select()
  console.log('Model columns check:', mTestErr?.message || 'Success with brand_id and name')
  
  // Get the actual columns by querying
  const { data: existingModels } = await admin.from('car_models').select('*').limit(1)
  if (existingModels && existingModels[0]) {
    console.log('Model columns:', Object.keys(existingModels[0]))
  }
  
  // 3. Insert Provinces - check columns
  console.log('\n📥 Inserting provinces...')
  const { error: pTestErr } = await admin.from('provinces').insert({ name: 'TestProv' }).select()
  console.log('Province columns check:', pTestErr?.message || 'Success with name')
  
  const { data: existingProv } = await admin.from('provinces').select('*').limit(1)
  if (existingProv && existingProv[0]) {
    console.log('Province columns:', Object.keys(existingProv[0]))
  }
  
  // 4. Check car_listings columns
  console.log('\n📥 Checking car_listings...')
  const { error: lTestErr } = await admin.from('car_listings').insert({ title: 'Test' }).select()
  console.log('Listing error:', lTestErr?.message?.substring(0, 200))
  
  const { data: existingListings } = await admin.from('car_listings').select('*').limit(1)
  if (existingListings && existingListings[0]) {
    console.log('Listing columns:', Object.keys(existingListings[0]))
  }
  
  // 5. Check profiles columns
  console.log('\n📥 Checking profiles...')
  const { error: uTestErr } = await admin.from('profiles').insert({ id: '00000000-0000-0000-0000-000000000001' }).select()
  console.log('Profile error:', uTestErr?.message?.substring(0, 200))
  
  const { data: existingUsers } = await admin.from('profiles').select('*').limit(1)
  if (existingUsers && existingUsers[0]) {
    console.log('Profile columns:', Object.keys(existingUsers[0]))
  }
}

seed()
