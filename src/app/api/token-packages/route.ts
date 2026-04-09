import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get token packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target') // 'all', 'user', 'dealer'
    
    let query = supabase
      .from('token_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (target) {
      query = query.or(`target_user.eq.all,target_user.eq.${target}`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Calculate pricing info
    const packagesWithPricing = data.map(pkg => ({
      ...pkg,
      calculated_price_per_token: Math.round(pkg.price / pkg.tokens),
      total_tokens: pkg.tokens + pkg.bonus_tokens,
      savings_amount: pkg.discount_percentage > 0 
        ? Math.round((pkg.tokens * 1000) - pkg.price) 
        : 0,
      is_good_deal: pkg.discount_percentage >= 20
    }))
    
    return NextResponse.json({
      success: true,
      data: packagesWithPricing
    })
  } catch (error) {
    console.error('Error fetching token packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token packages' },
      { status: 500 }
    )
  }
}

// POST - Create token package (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      tokens,
      price,
      discount_percentage,
      bonus_tokens,
      is_popular,
      is_recommended,
      badge_text,
      target_user,
      display_order
    } = body
    
    if (!name || !tokens || !price) {
      return NextResponse.json(
        { success: false, error: 'Name, tokens, and price are required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('token_packages')
      .insert({
        name,
        description,
        tokens,
        price,
        discount_percentage: discount_percentage || 0,
        bonus_tokens: bonus_tokens || 0,
        is_popular: is_popular || false,
        is_recommended: is_recommended || false,
        badge_text,
        target_user: target_user || 'all',
        display_order: display_order || 0
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Token package created successfully'
    })
  } catch (error) {
    console.error('Error creating token package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create token package' },
      { status: 500 }
    )
  }
}

// PUT - Update token package (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('token_packages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Token package updated successfully'
    })
  } catch (error) {
    console.error('Error updating token package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update token package' },
      { status: 500 }
    )
  }
}

// DELETE - Delete token package (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('token_packages')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Token package deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting token package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete token package' },
      { status: 500 }
    )
  }
}
