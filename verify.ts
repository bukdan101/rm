import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function verify() {
  const { count: listings } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  const { count: images } = await admin.from('car_images').select('*', { count: 'exact', head: true })
  const { count: brands } = await admin.from('brands').select('*', { count: 'exact', head: true })
  const { count: models } = await admin.from('car_models').select('*', { count: 'exact', head: true })
  
  console.log('========================================')
  console.log('   DATABASE STATUS - AutoMarket')
  console.log('========================================')
  console.log('  Brands:', brands)
  console.log('  Models:', models)
  console.log('  Listings:', listings)
  console.log('  Images:', images)
  console.log('========================================')
  
  // Get sample listings
  const { data: sampleListings } = await admin.from('car_listings').select('id, title, price_cash, year, city').limit(5)
  console.log('\nSample Listings:')
  sampleListings?.forEach((l, i) => {
    console.log('  ', i + 1, '.', l.title, '| Rp', l.price_cash?.toLocaleString(), '|', l.city)
  })
}

verify()
