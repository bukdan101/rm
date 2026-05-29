import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: '⚠️ Supabase environment variables belum dikonfigurasi.',
        isConfigured: false,
        envStatus: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        instructions: [
          '1. Buat file .env.local di root project',
          '2. Tambahkan variabel berikut:',
          '   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
          '   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
          '   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
          '3. Restart dev server'
        ],
        // Return mock settings for UI preview
        mockSettings: {
          token_cost_public: 1,
          token_cost_dealer_marketplace: 2,
          token_cost_both: 3,
          default_offer_duration_hours: 72,
          inspection_cost: 250000
        }
      })
    }

    // Import supabase only if configured
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: '⚠️ Supabase admin client tidak tersedia.',
        isConfigured: false
      })
    }

    const results: Record<string, any> = {}
    
    // Check dealer_marketplace_settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('dealer_marketplace_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    results.dealer_marketplace_settings = {
      exists: !settingsError || settingsError?.code !== '42P01',
      data: settings,
      error: settingsError?.message || null
    }
    
    // Check dealer_offers
    const { error: offersError } = await supabaseAdmin
      .from('dealer_offers')
      .select('id')
      .limit(1)
    
    results.dealer_offers = {
      exists: !offersError || offersError?.code !== '42P01',
      error: offersError?.message || null
    }
    
    // Check dealer_offer_histories
    const { error: historiesError } = await supabaseAdmin
      .from('dealer_offer_histories')
      .select('id')
      .limit(1)
    
    results.dealer_offer_histories = {
      exists: !historiesError || historiesError?.code !== '42P01',
      error: historiesError?.message || null
    }
    
    // Check dealer_marketplace_favorites
    const { error: favoritesError } = await supabaseAdmin
      .from('dealer_marketplace_favorites')
      .select('id')
      .limit(1)
    
    results.dealer_marketplace_favorites = {
      exists: !favoritesError || favoritesError?.code !== '42P01',
      error: favoritesError?.message || null
    }
    
    // Check dealer_marketplace_views
    const { error: viewsError } = await supabaseAdmin
      .from('dealer_marketplace_views')
      .select('id')
      .limit(1)
    
    results.dealer_marketplace_views = {
      exists: !viewsError || viewsError?.code !== '42P01',
      error: viewsError?.message || null
    }
    
    // Check car_listings visibility column
    const { data: listings, error: listingsError } = await supabaseAdmin
      .from('car_listings')
      .select('id, visibility, published_to_dealer_marketplace_at, tokens_spent_for_dealer_marketplace')
      .limit(1)
    
    results.car_listings_visibility = {
      column_exists: !listingsError || listingsError?.code !== '42703',
      error: listingsError?.message || null
    }
    
    // Summary
    const allTablesExist = 
      results.dealer_marketplace_settings?.exists &&
      results.dealer_offers?.exists &&
      results.dealer_offer_histories?.exists &&
      results.dealer_marketplace_favorites?.exists &&
      results.dealer_marketplace_views?.exists
    
    return NextResponse.json({
      success: true,
      isConfigured: true,
      message: allTablesExist 
        ? '✅ Semua tabel dealer marketplace berhasil dibuat!'
        : '⚠️ Beberapa tabel mungkin belum dibuat. Jalankan schema SQL.',
      results,
      summary: {
        all_tables_exist: allTablesExist,
        tables: {
          dealer_marketplace_settings: results.dealer_marketplace_settings?.exists,
          dealer_offers: results.dealer_offers?.exists,
          dealer_offer_histories: results.dealer_offer_histories?.exists,
          dealer_marketplace_favorites: results.dealer_marketplace_favorites?.exists,
          dealer_marketplace_views: results.dealer_marketplace_views?.exists,
          car_listings_visibility_column: results.car_listings_visibility?.column_exists
        }
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
