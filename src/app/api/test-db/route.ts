import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const results: Record<string, unknown> = {}

  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    results.config = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      supabaseUrlValue: supabaseUrl || 'NOT SET',
    }

    // Test 1: Check if profiles table exists
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      results.profiles_table = {
        exists: !profilesError,
        error: profilesError?.message || null,
        sampleData: profiles
      }
    } catch (e) {
      results.profiles_table = { exists: false, error: String(e) }
    }

    // Test 2: Check if user_settings table exists
    try {
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .limit(1)

      results.user_settings_table = {
        exists: !settingsError,
        error: settingsError?.message || null,
        columns: userSettings?.[0] ? Object.keys(userSettings[0]) : []
      }
    } catch (e) {
      results.user_settings_table = { exists: false, error: String(e) }
    }

    // Test 3: Check if wallets table exists (for tokens)
    try {
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .limit(1)

      results.wallets_table = {
        exists: !walletsError,
        error: walletsError?.message || null,
        columns: wallets?.[0] ? Object.keys(wallets[0]) : []
      }
    } catch (e) {
      results.wallets_table = { exists: false, error: String(e) }
    }

    // Test 4: Check if credit_packages table exists
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('credit_packages')
        .select('*')
        .limit(5)

      results.credit_packages_table = {
        exists: !packagesError,
        error: packagesError?.message || null,
        data: packages
      }
    } catch (e) {
      results.credit_packages_table = { exists: false, error: String(e) }
    }

    // Test 5: Check if car_listings table exists
    try {
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select('id, title, status')
        .limit(3)

      results.car_listings_table = {
        exists: !listingsError,
        error: listingsError?.message || null,
        count: listings?.length || 0
      }
    } catch (e) {
      results.car_listings_table = { exists: false, error: String(e) }
    }

    // Test 6: Check if dealers table exists
    try {
      const { data: dealers, error: dealersError } = await supabase
        .from('dealers')
        .select('id, name, slug')
        .limit(3)

      results.dealers_table = {
        exists: !dealersError,
        error: dealersError?.message || null,
        count: dealers?.length || 0
      }
    } catch (e) {
      results.dealers_table = { exists: false, error: String(e) }
    }

    // Test 7: Check if brands table exists
    try {
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(5)

      results.brands_table = {
        exists: !brandsError,
        error: brandsError?.message || null,
        data: brands
      }
    } catch (e) {
      results.brands_table = { exists: false, error: String(e) }
    }

    // Test 8: Admin client check
    results.admin_client = {
      available: !!supabaseAdmin
    }

  } catch (error) {
    results.fatalError = String(error)
  }

  return NextResponse.json(results, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
