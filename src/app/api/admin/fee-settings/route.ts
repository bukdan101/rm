import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get fee settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      const { data, error } = await supabase
        .from('dealer_offer_settings')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, data })
    }
    
    // List all fee settings
    const { data, error } = await supabase
      .from('dealer_offer_settings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching fee settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee settings' },
      { status: 500 }
    )
  }
}

// POST - Create new fee setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fee_type,
      fee_percentage,
      fee_fixed_amount,
      fee_tiers,
      min_fee_amount,
      max_fee_amount,
      applies_to,
      min_vehicle_price,
      max_vehicle_price,
      valid_from,
      valid_until,
      created_by
    } = body
    
    // Deactivate existing settings if this one is active
    await supabase
      .from('dealer_offer_settings')
      .update({ is_active: false })
      .eq('is_active', true)
    
    const { data, error } = await supabase
      .from('dealer_offer_settings')
      .insert({
        fee_type: fee_type || 'percentage',
        fee_percentage: fee_percentage || 5.00,
        fee_fixed_amount: fee_fixed_amount || 0,
        fee_tiers,
        min_fee_amount: min_fee_amount || 0,
        max_fee_amount,
        applies_to: applies_to || 'all',
        min_vehicle_price: min_vehicle_price || 0,
        max_vehicle_price,
        is_active: true,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        created_by
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating fee setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create fee setting' },
      { status: 500 }
    )
  }
}

// PUT - Update fee setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_active, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Fee setting ID is required' },
        { status: 400 }
      )
    }
    
    // If activating this setting, deactivate others
    if (is_active) {
      await supabase
        .from('dealer_offer_settings')
        .update({ is_active: false })
        .neq('id', id)
    }
    
    const { data, error } = await supabase
      .from('dealer_offer_settings')
      .update({
        ...updates,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating fee setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update fee setting' },
      { status: 500 }
    )
  }
}

// DELETE - Delete fee setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Fee setting ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('dealer_offer_settings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Fee setting deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fee setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete fee setting' },
      { status: 500 }
    )
  }
}
