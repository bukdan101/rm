import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cleanup() {
  // Delete test data
  console.log('Cleaning up test data...')
  
  // Delete listings with test titles
  const { error: d1 } = await admin.from('car_listings').delete().or(
    ['title.ilike.%test%', 'title.ilike.%Test%']
  )
  if (d1) console.log('Error deleting test listings:', d1.message)
  else console.log('Deleted test listings')
  
  // Delete test brands
  const { error: d2 } = await admin.from('brands').delete().eq('slug', 'test-brand-2')
  if (d2) console.log('Error deleting test brand:', d2.message)
  else console.log('Deleted test brand')
  
  // Get final counts
  const { count: listings } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  const { count: brands } = await admin.from('brands').select('*', { count: 'exact', head: true })
  const { count: models } = await admin.from('car_models').select('*', { count: 'exact', head: true })
  const { count: images } = await admin.from('car_images').select('*', { count: 'exact', head: true })
  
  console.log('\n========================================')
  console.log('   FINAL DATABASE STATUS')
  console.log('========================================')
  console.log('  Brands:', brands)
  console.log('  Models:', models)
  console.log('  Listings:', listings)
  console.log('  Images:', images)
  console.log('========================================')
}

cleanup()
