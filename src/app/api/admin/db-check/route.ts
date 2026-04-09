import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()
  
  // Tables to check - these are needed for admin
  const tablesToCheck = [
    // Core tables
    'profiles',
    'dealers',
    'brands',
    'car_models',
    'car_variants',
    'car_colors',
    'car_listings',
    'car_images',
    
    // Token system
    'user_tokens',
    'token_transactions',
    'token_packages',
    'token_settings',
    
    // Admin needed tables
    'kyc_verifications',
    'transactions',
    'withdrawals',
    'topup_requests',
    'reports',
    'support_tickets',
    'support_ticket_messages',
    'activity_logs',
    'banners',
    'coupons',
    'broadcasts',
    'categories',
    'boost_settings',
    'system_settings',
    'fee_settings',
    
    // Other
    'provinces',
    'cities',
    'conversations',
    'messages',
    'favorites',
  ]

  const results: Record<string, { exists: boolean; columns: string[]; count: number }> = {}

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        results[table] = { exists: false, columns: [], count: 0 }
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : []
        results[table] = { exists: true, columns, count: count || 0 }
      }
    } catch (e) {
      results[table] = { exists: false, columns: [], count: 0 }
    }
  }

  // Separate results
  const existingTables = Object.entries(results)
    .filter(([_, v]) => v.exists)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => a.name.localeCompare(b.name))
  
  const missingTables = Object.entries(results)
    .filter(([_, v]) => !v.exists)
    .map(([name]) => name)
    .sort()

  return NextResponse.json({
    success: true,
    summary: {
      total: tablesToCheck.length,
      existing: existingTables.length,
      missing: missingTables.length
    },
    existingTables,
    missingTables
  })
}
