import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET - Get all inspection pricing
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('inspection_pricing')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching inspection pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection pricing' },
      { status: 500 }
    )
  }
}

// POST - Create new pricing (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const { data, error } = await adminClient
      .from('inspection_pricing')
      .insert({
        name: body.name,
        description: body.description,
        type: body.type,
        token_cost: body.token_cost || 0,
        includes_inspector: body.includes_inspector || false,
        includes_certificate: body.includes_certificate || false,
        includes_ai_analysis: body.includes_ai_analysis ?? true,
        certificate_validity_days: body.certificate_validity_days || 90,
        is_popular: body.is_popular || false,
        display_order: body.display_order || 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating inspection pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create inspection pricing' },
      { status: 500 }
    )
  }
}

// PUT - Update pricing (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const { data, error } = await adminClient
      .from('inspection_pricing')
      .update({
        name: body.name,
        description: body.description,
        token_cost: body.token_cost,
        includes_inspector: body.includes_inspector,
        includes_certificate: body.includes_certificate,
        includes_ai_analysis: body.includes_ai_analysis,
        certificate_validity_days: body.certificate_validity_days,
        is_popular: body.is_popular,
        is_active: body.is_active,
        display_order: body.display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating inspection pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inspection pricing' },
      { status: 500 }
    )
  }
}
