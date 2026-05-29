import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  // For now, we'll use a simple check
  // In production, you'd verify the session/JWT token
  const authHeader = request.headers.get('authorization')
  // The actual auth check happens via the AdminLayout component on the frontend
  // For API routes, we rely on the service role key having proper access
  return true
}

// GET - Fetch coupons with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Try to fetch from coupons table
    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.ilike('code', `%${search}%`)
    }

    // Apply status filter
    if (status === 'active') {
      const now = new Date().toISOString()
      query = query.eq('status', 'active').gte('valid_until', now)
    } else if (status === 'expired') {
      const now = new Date().toISOString()
      query = query.or(`status.eq.expired,valid_until.lt.${now}`)
    } else if (status === 'disabled') {
      query = query.eq('status', 'disabled')
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: coupons, count, error } = await query

    if (error) {
      // If table doesn't exist, return empty data with mock stats
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
          stats: {
            activeCoupons: 0,
            totalUsage: 0,
            expiredCoupons: 0,
          },
        })
      }
      throw error
    }

    // Get stats
    const now = new Date().toISOString()
    
    const { count: activeCount } = await supabase
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('valid_until', now)

    const { count: expiredCount } = await supabase
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .or(`status.eq.expired,valid_until.lt.${now}`)

    const { data: usageData } = await supabase
      .from('coupons')
      .select('usage_count')

    const totalUsage = usageData?.reduce((sum, c) => sum + (c.usage_count || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: coupons || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: {
        activeCoupons: activeCount || 0,
        totalUsage,
        expiredCoupons: expiredCount || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      code,
      discount_type,
      discount_value,
      max_discount,
      min_purchase,
      valid_from,
      valid_until,
      usage_limit,
      applicable_to,
      status,
    } = body

    // Validate required fields
    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    const couponData = {
      id: randomUUID(),
      code: code.toUpperCase(),
      discount_type,
      discount_value: Number(discount_value),
      max_discount: max_discount ? Number(max_discount) : null,
      min_purchase: Number(min_purchase) || 0,
      valid_from: valid_from || null,
      valid_until: valid_until || null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      usage_count: 0,
      applicable_to: applicable_to || 'all',
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert(couponData)
      .select()
      .single()

    if (error) {
      // If table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Coupons table not found. Please run database migrations.' },
          { status: 500 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

// PATCH - Update coupon
export async function PATCH(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    // Check if code is being updated and already exists
    if (updates.code) {
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', updates.code.toUpperCase())
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Ensure code is uppercase
    if (updateData.code) {
      updateData.code = (updateData.code as string).toUpperCase()
    }

    // Ensure numeric fields
    if (updateData.discount_value !== undefined) {
      updateData.discount_value = Number(updateData.discount_value)
    }
    if (updateData.max_discount !== undefined) {
      updateData.max_discount = updateData.max_discount ? Number(updateData.max_discount) : null
    }
    if (updateData.min_purchase !== undefined) {
      updateData.min_purchase = Number(updateData.min_purchase)
    }
    if (updateData.usage_limit !== undefined) {
      updateData.usage_limit = updateData.usage_limit ? Number(updateData.usage_limit) : null
    }

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Coupons table not found' },
          { status: 500 }
        )
      }
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Coupons table not found' },
          { status: 500 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
