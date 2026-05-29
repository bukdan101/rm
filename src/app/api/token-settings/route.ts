import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { errorResponse, successResponse } from '@/lib/api-utils'

// Default token settings - will be seeded if not exists
const DEFAULT_TOKEN_SETTINGS = [
  // Marketplace listing types
  { key: 'marketplace_umum', name: 'Marketplace Umum (WhatsApp)', tokens: 3, category: 'listing', description: 'Listing via WhatsApp aktif', is_active: true },
  { key: 'dealer_marketplace', name: 'Dealer Marketplace (Bidding)', tokens: 5, category: 'listing', description: 'Listing ke dealer dengan bidding system', is_active: true },
  { key: 'chat_platform', name: 'Chat Platform', tokens: 4, category: 'listing', description: 'Listing dengan chat in-app dan escrow opsional', is_active: true },
  
  // Additional services
  { key: 'inspection_160', name: 'Inspeksi 160 Titik', tokens: 10, category: 'service', description: 'Inspeksi lengkap 160 titik', is_active: true },
  { key: 'featured_7days', name: 'Featured/Promoted (7 hari)', tokens: 5, category: 'boost', description: 'Highlight listing selama 7 hari', is_active: true },
  
  // Extensions
  { key: 'extend_listing', name: 'Perpanjangan Listing (30 hari)', tokens: 2, category: 'extension', description: 'Perpanjangan listing umum/chat platform', is_active: true },
  { key: 'extend_dealer', name: 'Perpanjangan Dealer (7 hari)', tokens: 2, category: 'extension', description: 'Perpanjangan periode bidding dealer', is_active: true },
  
  // Token configuration
  { key: 'token_value_rupiah', name: 'Nilai 1 Token (Rupiah)', tokens: 10000, category: 'config', description: 'Nilai 1 token dalam Rupiah', is_active: true },
]

// GET: Fetch all token settings (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active_only') === 'true'
    
    let query = supabase
      .from('token_settings')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    // If no data, seed default settings
    if ((!data || data.length === 0) && !category) {
      const settingsToInsert = DEFAULT_TOKEN_SETTINGS.map((setting, index) => ({
        id: uuidv4(),
        ...setting,
        display_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { data: insertedData, error: insertError } = await supabase
        .from('token_settings')
        .insert(settingsToInsert)
        .select()
      
      if (insertError) {
        console.error('Error seeding token settings:', insertError)
        // Return defaults anyway
        return successResponse({ 
          settings: DEFAULT_TOKEN_SETTINGS.map((s, i) => ({ ...s, id: `default-${i}`, display_order: i })),
          seeded: false 
        })
      }
      
      return successResponse({ settings: insertedData, seeded: true })
    }
    
    if (error) {
      // If table doesn't exist, return defaults
      if (error.code === '42P01') {
        return successResponse({ 
          settings: DEFAULT_TOKEN_SETTINGS.map((s, i) => ({ ...s, id: `default-${i}`, display_order: i })),
          seeded: false,
          table_exists: false
        })
      }
      return errorResponse(error.message, 500)
    }
    
    return successResponse({ settings: data, seeded: false })
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return successResponse({ 
      settings: DEFAULT_TOKEN_SETTINGS.map((s, i) => ({ ...s, id: `default-${i}`, display_order: i })),
      seeded: false 
    })
  }
}

// POST: Create or update token setting (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { key, name, tokens, category, description, is_active, display_order } = body
    
    if (!key || !name || tokens === undefined) {
      return errorResponse('Key, name, and tokens are required', 400)
    }
    
    const { data, error } = await supabase
      .from('token_settings')
      .upsert({
        id: uuidv4(),
        key,
        name,
        tokens,
        category: category || 'listing',
        description: description || '',
        is_active: is_active ?? true,
        display_order: display_order || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single()
    
    if (error) {
      return errorResponse(error.message, 500)
    }
    
    return successResponse({ setting: data })
  } catch (error) {
    console.error('Error creating/updating token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}

// PUT: Update token setting (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { id, name, tokens, category, description, is_active, display_order } = body
    
    if (!id) {
      return errorResponse('Setting ID is required', 400)
    }
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (tokens !== undefined) updateData.tokens = tokens
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active
    if (display_order !== undefined) updateData.display_order = display_order
    
    const { data, error } = await supabase
      .from('token_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return errorResponse(error.message, 500)
    }
    
    return successResponse({ setting: data })
  } catch (error) {
    console.error('Error updating token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE: Delete token setting (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return errorResponse('Setting ID is required', 400)
    }
    
    const { error } = await supabase
      .from('token_settings')
      .delete()
      .eq('id', id)
    
    if (error) {
      return errorResponse(error.message, 500)
    }
    
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Error deleting token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}
