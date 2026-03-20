import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // All 72 expected tables
    const expectedTables = [
      // Module 1: User System (7)
      'profiles', 'user_addresses', 'user_documents', 'user_verifications',
      'user_sessions', 'user_notifications', 'user_settings',
      // Module 2: Dealer System (6)
      'dealers', 'dealer_branches', 'dealer_staff', 'dealer_documents',
      'dealer_reviews', 'dealer_inventory',
      // Module 3: Car Master Data (8)
      'brands', 'car_models', 'car_variants', 'car_generations',
      'car_colors', 'car_body_types', 'car_fuel_types', 'car_transmissions',
      // Module 4: Car Feature Master (4)
      'feature_categories', 'feature_groups', 'feature_items', 'car_feature_values',
      // Module 5: Listing System (10)
      'car_listings', 'car_images', 'car_videos', 'car_documents',
      'car_features', 'car_price_history', 'car_status_history', 'car_views',
      'car_favorites', 'car_compares',
      // Module 6: Inspection System (6)
      'inspection_categories', 'inspection_items', 'car_inspections',
      'inspection_results', 'inspection_photos', 'inspection_certificates',
      // Module 7: Rental System (6)
      'car_rental_prices', 'rental_bookings', 'rental_availability',
      'rental_payments', 'rental_reviews', 'rental_insurance',
      // Module 8: Transaction System (8)
      'orders', 'order_items', 'payments', 'payment_methods',
      'escrow_accounts', 'transactions', 'refunds', 'invoices',
      // Module 9: Chat System (3)
      'conversations', 'messages', 'message_attachments',
      // Module 10: Review & Rating (3)
      'car_reviews', 'review_votes', 'review_images',
      // Module 11: Search & Discovery (4)
      'search_logs', 'recommendations', 'recent_views', 'trending_cars',
      // Module 12: Analytics (4)
      'analytics_events', 'analytics_page_views', 'analytics_clicks', 'analytics_conversions',
      // Module 13: Notification System (3)
      'notifications', 'notification_templates', 'notification_logs',
      // Module 14: Location System (4)
      'countries', 'provinces', 'cities', 'districts'
    ]

    const tableStatus: Record<string, { exists: boolean; error?: string }> = {}
    let existingCount = 0

    for (const table of expectedTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table as any)
          .select('*')
          .limit(1)
        
        if (!error) {
          tableStatus[table] = { exists: true }
          existingCount++
        } else {
          tableStatus[table] = { exists: false, error: error.message }
        }
      } catch (e: any) {
        tableStatus[table] = { exists: false, error: e.message }
      }
    }

    const missingTables = Object.entries(tableStatus)
      .filter(([, status]) => !status.exists)
      .map(([name]) => name)

    return NextResponse.json({
      success: true,
      expectedTablesCount: expectedTables.length,
      existingTablesCount: existingCount,
      missingTablesCount: missingTables.length,
      missingTables,
      tableStatus,
      message: missingTables.length === 0 
        ? '✅ All 72 tables exist!' 
        : `⚠️ ${missingTables.length} tables missing. Run schema-72-tables.sql in Supabase SQL Editor.`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
