import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function check() {
  // Try inserting with just id to see what columns are required
  const testId = '00000000-0000-0000-0000-000000000001'
  const { error: err1 } = await admin.from('profiles').insert({ id: testId }).select()
  console.log('Insert with id only:', err1?.message || 'Success')
  
  // Get existing profiles
  const { data, error } = await admin.from('profiles').select('*').limit(1)
  if (data && data[0]) {
    console.log('\nProfile columns:', Object.keys(data[0]))
  } else {
    // Check by error message
    const { error: err2 } = await admin.from('profiles').insert({ 
      id: testId, 
      full_name: 'Test',
      phone: '123',
      role: 'seller'
    }).select()
    console.log('\nInsert with more fields:', err2?.message || 'Success')
    
    // Try one more time
    const { error: err3 } = await admin.from('profiles').insert({ 
      id: testId, 
      name: 'Test',
      phone_number: '123',
      user_role: 'seller'
    }).select()
    console.log('Insert with alt fields:', err3?.message || 'Success')
  }
}

check()
