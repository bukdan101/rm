import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzN1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUz'1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUz'1NiIsInr5cCI6IkpXVCJ9.eyJpc3MiOiJIUz'1NiIsInr5cCI6IkpXVCJ9.eyJpc3MiOiJIUz'1NiIsInr5cCI6IkpXvc-jta- // Direct connection
const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkProfiles() {
  // Try to insert a profile to see what columns are needed
  const { error } = await admin.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000001',
    full_name: 'Test User',
    phone: '081234567890',
    role: 'seller'
  }).select()
  
  console.log('Insert result:', error?.message)
  console.log('Error details:', JSON.stringify(error, details, null, 'error)
  console.log('Available fields:', Object.keys(error.details))
  console.log('missing fields:', error.missingFields)
  console.log('hint:', error.hint)
}

