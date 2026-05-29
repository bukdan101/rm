import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Check if token tables exist
export async function GET() {
  try {
    const tables = ['token_settings', 'token_packages', 'user_tokens', 'token_transactions', 'token_usage_logs']
    const results: Record<string, { exists: boolean; count?: number }> = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table as any)
          .select('*', { count: 'exact', head: true })

        results[table] = { exists: !error, count: count || 0 }
      } catch {
        results[table] = { exists: false }
      }
    }

    const allExist = Object.values(results).every(r => r.exists)

    return NextResponse.json({
      success: true,
      tables: results,
      allTablesExist: allExist,
      message: allExist ? 'All token tables exist' : 'Some token tables are missing'
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// POST - Create token tables and seed default data
export async function POST() {
  try {
    const results: string[] = []
    const errors: string[] = []

    // 1. Create token_settings table (via insert with default values)
    const { data: existingSettings } = await supabaseAdmin
      .from('token_settings')
      .select('*')
      .limit(1)

    if (!existingSettings || existingSettings.length === 0) {
      const { error: settingsError } = await supabaseAdmin
        .from('token_settings')
        .insert({
          token_price_base: 1000,
          token_price_currency: 'IDR',
          ai_prediction_tokens: 5,
          ai_prediction_duration_hours: 24,
          listing_normal_tokens: 10,
          listing_normal_duration_days: 30,
          listing_normal_chat_free: true,
          listing_dealer_tokens: 20,
          listing_dealer_duration_days: 7,
          listing_dealer_multiplier: 2.00,
          dealer_contact_tokens: 5,
          dealer_contact_multiplier: 0.50,
          boost_tokens: 3,
          boost_duration_days: 7,
          highlight_tokens: 2,
          highlight_duration_days: 7,
          featured_tokens: 5,
          featured_duration_days: 7,
          premium_badge_tokens: 10,
          premium_badge_duration_days: 30,
          top_search_tokens: 5,
          top_search_duration_days: 7,
          inspection_tokens: 0,
          inspection_mandatory: true,
          auto_move_to_public: true,
          auto_move_gratis: true,
          remind_before_expire_days: 2,
          is_active: true
        })

      if (settingsError) {
        errors.push(`Token Settings: ${settingsError.message}`)
      } else {
        results.push('✓ Token Settings (default values)')
      }
    } else {
      results.push('✓ Token Settings (already exists)')
    }

    // 2. Create token_packages
    const { data: existingPackages } = await supabaseAdmin
      .from('token_packages')
      .select('*')
      .limit(1)

    if (!existingPackages || existingPackages.length === 0) {
      const { error: packagesError } = await supabaseAdmin
        .from('token_packages')
        .insert([
          {
            name: 'Paket Starter',
            description: 'Cocok untuk pemula yang ingin mencoba',
            tokens: 50,
            price: 45000,
            discount_percentage: 10.00,
            bonus_tokens: 0,
            is_popular: false,
            is_recommended: false,
            target_user: 'all',
            is_active: true,
            display_order: 1
          },
          {
            name: 'Paket Pro',
            description: 'Pilihan terbaik untuk pengguna aktif',
            tokens: 100,
            price: 80000,
            discount_percentage: 20.00,
            bonus_tokens: 0,
            is_popular: true,
            is_recommended: true,
            badge_text: 'Best Value',
            target_user: 'all',
            is_active: true,
            display_order: 2
          },
          {
            name: 'Paket Enterprise',
            description: 'Untuk dealer dan power seller',
            tokens: 200,
            price: 150000,
            discount_percentage: 25.00,
            bonus_tokens: 20,
            is_popular: false,
            is_recommended: false,
            badge_text: 'Bonus 20 Token',
            target_user: 'dealer',
            is_active: true,
            display_order: 3
          },
          {
            name: 'Paket Ultimate',
            description: 'Maximum savings untuk profesional',
            tokens: 500,
            price: 350000,
            discount_percentage: 30.00,
            bonus_tokens: 50,
            is_popular: false,
            is_recommended: false,
            badge_text: 'Bonus 50 Token',
            target_user: 'all',
            is_active: true,
            display_order: 4
          }
        ])

      if (packagesError) {
        errors.push(`Token Packages: ${packagesError.message}`)
      } else {
        results.push('✓ Token Packages (4 packages)')
      }
    } else {
      results.push('✓ Token Packages (already exists)')
    }

    return NextResponse.json({
      success: true,
      message: 'Token system setup complete!',
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
