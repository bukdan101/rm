import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cleanup() {
  console.log('Cleaning up remaining test data...')
  
  // Delete test listings
  const { error: e1 } = await admin.from('car_listings').delete().or(
    'title.ilike.%test%',
    'title.ilike.%Test%',
    'title.ilike.%TestBrand%'
  )
  if (e1) console.log('Error:', e1.message)
  else console.log('Deleted test listings')
  
  // Delete test brands
  const { error: e2 } = await admin.from('brands').delete().or(
    'name.ilike.%test%',
    'name.ilike.%Test%'
  )
  if (e2) console.log('Error:', e2.message)
  else console.log('Deleted test brands')
  
  // Delete test models
  const { error: e3 } = await admin.from('car_models').delete().or(
    'name.ilike.%test%',
    'name.ilike.%Test%'
  )
  if (e3) console.log('Error:', e3.message)
  else console.log('Deleted test models')
  
  // Get final counts
  const { count: brands } = await admin.from('brands').select('*', { count: 'exact', head: true })
  const { count: models } = await admin.from('car_models').select('*', { count: 'exact', head: true })
  const { count: listings } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  const { count: images } = await admin.from('car_images').select('*', { count: 'exact', head: true })
  
  console.log('\n========================================')
  console.log('  FINAL CLEAN DATABASE')
  console.log('========================================')
  console.log('  Brands:', brands)
  console.log('  Models:', models)
  console.log('  Listings:', listings)
  console.log('  Images:', images)
  console.log('========================================')
  
  // Get sample listings
  const { data: sample } = await admin.from('car_listings').select('title, price_cash, city').order('created_at', { ascending: false }).limit(8)
  console.log('\n  SAMPLE LISTINGS:')
  sample?.forEach((l, i) => {
    const price = l.price_cash ? 'Rp ' + l.price_cash.toLocaleString('id-ID') : 'N/A'
    console.log('  ' + (i + 1) + '.', l.title, '|', price, '|', l.city)
  })
}

cleanup()
