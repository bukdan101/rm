import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const tables = [
      'profiles',
      'brands',
      'car_models',
      'car_variants',
      'car_colors',
      'car_listings',
      'car_images',
      'car_documents',
      'car_features',
      'inspection_categories',
      'inspection_items',
      'car_inspections',
      'inspection_results',
      'car_rental_prices',
      'provinces',
      'cities',
    ]

    const results: Record<string, { exists: boolean; count: number; error?: string }> = {}

    for (const table of tables) {
      // Use select with limit to properly detect errors
      const { data, error } = await supabaseAdmin
        .from(table as any)
        .select('*')
        .limit(1)

      if (error) {
        results[table] = { exists: false, count: 0, error: error.message }
      } else {
        results[table] = { exists: true, count: data?.length || 0 }
      }
    }

    // Count existing tables
    const existingTables = Object.values(results).filter(r => r.exists).length
    const missingTables = Object.entries(results)
      .filter(([, r]) => !r.exists)
      .map(([name]) => name)

    return NextResponse.json({
      success: true,
      connection: 'OK',
      totalTablesChecked: tables.length,
      existingTables,
      missingTables,
      details: results,
      needsSetup: missingTables.length > 0,
      message: missingTables.length > 0 
        ? `⚠️ Missing ${missingTables.length} tables! Please run supabase/schema-complete.sql in Supabase SQL Editor.`
        : '✅ All tables exist and connected!'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Failed to connect to Supabase. Check your credentials.'
    }, { status: 500 })
  }
}
