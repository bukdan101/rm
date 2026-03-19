import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This API runs the schema migration
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Supabase credentials not configured',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      }, { status: 500 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { sql } = body

    if (!sql) {
      return NextResponse.json({ error: 'SQL is required' }, { status: 400 })
    }

    // Execute SQL via RPC
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query if RPC doesn't exist
      // We'll create tables one by one using individual queries
      return NextResponse.json({ 
        error: error.message,
        suggestion: 'Run the schema manually in Supabase SQL Editor',
        sqlFile: '/supabase/schema-72-tables.sql'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Schema execution error:', error)
    return NextResponse.json({ 
      error: String(error),
      suggestion: 'Run the schema manually in Supabase SQL Editor'
    }, { status: 500 })
  }
}

// Check current database status
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const results: Record<string, unknown> = {
      config: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseServiceKey: !!supabaseServiceKey,
        supabaseUrl: supabaseUrl || 'NOT SET'
      }
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(results)
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check critical tables
    const tables = [
      'profiles', 
      'user_settings', 
      'wallets', 
      'wallet_transactions',
      'credit_packages',
      'car_listings',
      'dealers',
      'brands',
      'car_models',
      'car_variants',
      'car_images',
      'car_inspections',
      'conversations',
      'messages',
      'orders',
      'payments'
    ]

    const tableStatus: Record<string, { exists: boolean; count?: number; error?: string }> = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })

        tableStatus[table] = {
          exists: !error,
          count: count || 0,
          error: error?.message
        }
      } catch (e) {
        tableStatus[table] = {
          exists: false,
          error: String(e)
        }
      }
    }

    results.tables = tableStatus

    // Count existing tables
    const existingTables = Object.values(tableStatus).filter(t => t.exists).length
    results.summary = {
      total: tables.length,
      existing: existingTables,
      missing: tables.length - existingTables
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
