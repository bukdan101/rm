import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function finalVerify() {
  console.log('==========================================')
  console.log('  AUTOMARKET - FINAL DATABASE STATUS')
  console.log('==========================================')
  
  const { count: brands } = await admin.from('brands').select('*', { count: 'exact', head: true })
  const { count: models } = await admin.from('car_models').select('*', { count: 'exact', head: true })
  const { count: listings } = await admin.from('car_listings').select('*', { count: 'exact', head: true })
  const { count: images } = await admin.from('car_images').select('*', { count: 'exact', head: true })
  const { count: provinces } = await admin.from('provinces').select('*', { count: 'exact', head: true })
  const { count: cities } = await admin.from('cities').select('*', { count: 'exact', head: true })
  const { count: users } = await admin.from('profiles').select('*', { count: 'exact', head: true })
  
  console.log('  Brands:', brands)
  console.log('  Models:', models)
  console.log('  Listings:', listings)
  console.log('  Images:', images)
  console.log('  Provinces:', provinces)
  console.log('  Cities:', cities)
  console.log('  Users:', users)
  console.log('==========================================')
  
  // Get sample listings with details
  const { data: sampleListings } = await admin
    .from('car_listings')
    .select('title, price_cash, year, city, status')
    .order('created_at', { ascending: false })
    .limit(10)
  
  console.log('\n  SAMPLE LISTINGS:')
  sampleListings?.forEach((l, i) => {
    const price = l.price_cash ? 'Rp ' + l.price_cash.toLocaleString('id-ID') : 'N/A'
    console.log('  ' + (i + 1) + '. ' + l.title + ' | ' + price + ' | ' + l.city + ' | ' + l.status)
  })
}

finalVerify()
