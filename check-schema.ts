import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')
  
  // Check profiles table
  console.log('=== PROFILES TABLE ===')
  const { data: profiles, error: pError } = await admin.from('profiles').select('*').limit(1)
  if (pError) console.log('Error:', pError.message)
  else console.log('Columns:', profiles?.[0] ? Object.keys(profiles[0]) : 'No data')
  
  // Check brands table
  console.log('\n=== BRANDS TABLE ===')
  const { data: brands, error: bError } = await admin.from('brands').select('*').limit(1)
  if (bError) console.log('Error:', bError.message)
  else console.log('Columns:', brands?.[0] ? Object.keys(brands[0]) : 'No data')
  
  // Check car_models table
  console.log('\n=== CAR_MODELS TABLE ===')
  const { data: models, error: mError } = await admin.from('car_models').select('*').limit(1)
  if (mError) console.log('Error:', mError.message)
  else console.log('Columns:', models?.[0] ? Object.keys(models[0]) : 'No data')
  
  // Check provinces table
  console.log('\n=== PROVINCES TABLE ===')
  const { data: provinces, error: prError } = await admin.from('provinces').select('*').limit(1)
  if (prError) console.log('Error:', prError.message)
  else console.log('Columns:', provinces?.[0] ? Object.keys(provinces[0]) : 'No data')
  
  // Check cities table
  console.log('\n=== CITIES TABLE ===')
  const { data: cities, error: cError } = await admin.from('cities').select('*').limit(1)
  if (cError) console.log('Error:', cError.message)
  else console.log('Columns:', cities?.[0] ? Object.keys(cities[0]) : 'No data')
  
  // Check car_listings table
  console.log('\n=== CAR_LISTINGS TABLE ===')
  const { data: listings, error: lError } = await admin.from('car_listings').select('*').limit(1)
  if (lError) console.log('Error:', lError.message)
  else console.log('Columns:', listings?.[0] ? Object.keys(listings[0]) : 'No data')
  
  // Check car_images table
  console.log('\n=== CAR_IMAGES TABLE ===')
  const { data: images, error: iError } = await admin.from('car_images').select('*').limit(1)
  if (iError) console.log('Error:', iError.message)
  else console.log('Columns:', images?.[0] ? Object.keys(images[0]) : 'No data')
}

checkSchema()
