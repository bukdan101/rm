import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()
  
  try {
    // Get one row from each table to see actual columns
    const tables = ['car_listings', 'profiles', 'car_variants', 'brands', 'car_models']
    const results: Record<string, { columns: string[], sample: Record<string, unknown> | null, error?: string }> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          results[table] = { columns: [], sample: null, error: error.message }
        } else {
          const columns = data && data.length > 0 ? Object.keys(data[0]) : []
          results[table] = { 
            columns, 
            sample: data?.[0] || null 
          }
        }
      } catch (e) {
        results[table] = { columns: [], sample: null, error: String(e) }
      }
    }
    
    return NextResponse.json({
      success: true,
      schema: results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
