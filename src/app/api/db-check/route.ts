import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required tables for the application
const REQUIRED_TABLES = {
  // Core tables
  core: [
    'profiles',
    'dealers',
    'provinces',
    'cities',
    'districts',
    'villages',
  ],
  // Car marketplace tables
  marketplace: [
    'brands',
    'car_models',
    'car_variants',
    'car_colors',
    'car_listings',
    'car_images',
    'car_videos',
    'car_documents',
    'car_features',
  ],
  // Inspection tables
  inspection: [
    'inspection_categories',
    'inspection_items',
    'car_inspections',
    'inspection_results',
  ],
  // Credit system tables
  credit: [
    'credit_packages',
    'user_credits',
    'credit_transactions',
    'payments',
    'boost_features',
    'listing_boosts',
    'registration_bonus_tracker',
  ],
  // KYC tables
  kyc: [
    'kyc_verifications',
  ],
  // Communication tables
  communication: [
    'conversations',
    'messages',
  ],
}

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    connection: {
      status: 'unknown',
      message: '',
    },
    envCheck: {
      hasSupabaseUrl: false,
      hasSupabaseKey: false,
      supabaseUrl: '',
    },
    tables: {
      existing: [] as string[],
      missing: [] as string[],
      byCategory: {} as Record<string, { exists: string[], missing: string[] }>,
    },
    stats: {
      totalRequired: 0,
      totalExisting: 0,
      totalMissing: 0,
      percentageComplete: 0,
    },
    recommendations: [] as string[],
  }

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  results.envCheck.hasSupabaseUrl = !!supabaseUrl
  results.envCheck.hasSupabaseKey = !!supabaseKey
  results.envCheck.supabaseUrl = supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET'

  // If no Supabase config, return early
  if (!supabaseUrl || !supabaseKey) {
    results.connection.status = 'error'
    results.connection.message = 'Supabase environment variables not configured'
    results.recommendations.push('Set NEXT_PUBLIC_SUPABASE_URL in .env.local')
    results.recommendations.push('Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    return NextResponse.json(results)
  }

  // Test connection and get tables
  try {
    // Try to query for table existence
    // First, let's try a simple query to test connection
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (connectionError) {
      // Check if it's a "table doesn't exist" error vs connection error
      if (connectionError.message.includes('relation') || connectionError.message.includes('does not exist')) {
        results.connection.status = 'connected'
        results.connection.message = 'Connected but tables may not exist'
      } else if (connectionError.message.includes('Failed to fetch') || connectionError.message.includes('network')) {
        results.connection.status = 'error'
        results.connection.message = `Connection failed: ${connectionError.message}`
        results.recommendations.push('Check if Supabase project is running')
        results.recommendations.push('Verify the Supabase URL is correct')
        return NextResponse.json(results)
      } else {
        results.connection.status = 'connected'
        results.connection.message = `Connected (${connectionError.message})`
      }
    } else {
      results.connection.status = 'connected'
      results.connection.message = 'Successfully connected to Supabase'
    }

    // Check each category of tables
    const allExisting: string[] = []
    const allMissing: string[] = []

    for (const [category, tables] of Object.entries(REQUIRED_TABLES)) {
      const categoryResult = { exists: [] as string[], missing: [] as string[] }

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1)

          if (error) {
            if (error.message.includes('relation') || error.message.includes('does not exist') || error.code === '42P01') {
              categoryResult.missing.push(table)
              allMissing.push(table)
            } else {
              // Table exists but might have RLS or other issues
              categoryResult.exists.push(table)
              allExisting.push(table)
            }
          } else {
            categoryResult.exists.push(table)
            allExisting.push(table)
          }
        } catch {
          categoryResult.missing.push(table)
          allMissing.push(table)
        }
      }

      results.tables.byCategory[category] = categoryResult
    }

    results.tables.existing = allExisting
    results.tables.missing = allMissing

    // Calculate stats
    const totalRequired = Object.values(REQUIRED_TABLES).flat().length
    results.stats.totalRequired = totalRequired
    results.stats.totalExisting = allExisting.length
    results.stats.totalMissing = allMissing.length
    results.stats.percentageComplete = Math.round((allExisting.length / totalRequired) * 100)

    // Add recommendations based on missing tables
    if (allMissing.length > 0) {
      results.recommendations.push('Run the following SQL files in Supabase SQL Editor:')
      
      if (allMissing.some(t => REQUIRED_TABLES.core.includes(t))) {
        results.recommendations.push('  - supabase/schema-complete.sql (for core tables)')
      }
      if (allMissing.some(t => REQUIRED_TABLES.marketplace.includes(t))) {
        results.recommendations.push('  - supabase/schema-complete.sql (for marketplace tables)')
      }
      if (allMissing.some(t => REQUIRED_TABLES.inspection.includes(t))) {
        results.recommendations.push('  - supabase/schema-complete.sql (for inspection tables)')
      }
      if (allMissing.some(t => REQUIRED_TABLES.credit.includes(t))) {
        results.recommendations.push('  - supabase/schema-credit-system.sql (for credit system)')
      }
      if (allMissing.some(t => REQUIRED_TABLES.kyc.includes(t))) {
        results.recommendations.push('  - supabase/schema-kyc-extension.sql (for KYC)')
      }
    } else {
      results.recommendations.push('All required tables exist!')
      results.recommendations.push('Database is ready for use.')
    }

  } catch (error) {
    results.connection.status = 'error'
    results.connection.message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return NextResponse.json(results, { status: 200 })
}
