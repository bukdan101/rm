import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkColumns() {
  console.log('🔍 Checking actual columns...\n')
  
  // Try insert and see what columns are expected
  console.log('=== PROFILES ===')
  const { error: pErr } = await admin.from('profiles').insert({ id: 'test' })
  console.log('Error:', pErr?.message)
  
  console.log('\n=== BRANDS ===')
  const { error: bErr } = await admin.from('brands').insert({ name: 'test' })
  console.log('Error:', bErr?.message)
  
  console.log('\n=== PROVINCES ===')
  const { error: prErr } = await admin.from('provinces').insert({ name: 'test' })
  console.log('Error:', prErr?.message)
  
  console.log('\n=== CAR_MODELS ===')
  const { error: mErr } = await admin.from('car_models').insert({ name: 'test' })
  console.log('Error:', mErr?.message)
  
  console.log('\n=== CAR_LISTINGS ===')
  const { error: lErr } = await admin.from('car_listings').insert({ title: 'test' })
  console.log('Error:', lErr?.message)
}

checkColumns()
