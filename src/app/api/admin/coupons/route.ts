import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch coupons with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Apply search filter
    if (search) {
      where.code = { contains: search }
    }

    // Apply status filter
    if (status === 'active') {
      where.is_active = true
      where.valid_until = { gte: new Date() }
    } else if (status === 'expired') {
      where.OR = [
        { is_active: false },
        { valid_until: { lt: new Date() } },
      ]
    }

    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.coupon.count({ where }),
    ])

    // Get stats
    const now = new Date()
    const activeCoupons = await db.coupon.count({
      where: { is_active: true, valid_until: { gte: now } },
    })
    const expiredCoupons = await db.coupon.count({
      where: { OR: [{ is_active: false }, { valid_until: { lt: now } }] },
    })
    const allCoupons = await db.coupon.findMany({ select: { used_count: true } })
    const totalUsage = allCoupons.reduce((sum, c) => sum + (c.used_count || 0), 0)

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        activeCoupons,
        totalUsage,
        expiredCoupons,
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
    const body = await request.json()

    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      max_discount,
      min_purchase,
      valid_from,
      valid_until,
      usage_limit,
      per_user_limit,
      is_active,
    } = body

    // Validate required fields
    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        name: name || code.toUpperCase(),
        description: description || null,
        discount_type: discount_type || 'percentage',
        discount_value: Number(discount_value),
        max_discount: max_discount ? Number(max_discount) : null,
        min_purchase: Number(min_purchase) || 0,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_until: valid_until ? new Date(valid_until) : null,
        usage_limit: usage_limit ? Number(usage_limit) : null,
        used_count: 0,
        per_user_limit: per_user_limit ? Number(per_user_limit) : 1,
        is_active: is_active !== undefined ? is_active : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: coupon,
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
      const existing = await db.coupon.findUnique({
        where: { code: updates.code.toUpperCase() },
      })
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (updates.code !== undefined) updateData.code = updates.code.toUpperCase()
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.discount_type !== undefined) updateData.discount_type = updates.discount_type
    if (updates.discount_value !== undefined) updateData.discount_value = Number(updates.discount_value)
    if (updates.max_discount !== undefined) updateData.max_discount = updates.max_discount ? Number(updates.max_discount) : null
    if (updates.min_purchase !== undefined) updateData.min_purchase = Number(updates.min_purchase)
    if (updates.usage_limit !== undefined) updateData.usage_limit = updates.usage_limit ? Number(updates.usage_limit) : null
    if (updates.per_user_limit !== undefined) updateData.per_user_limit = Number(updates.per_user_limit)
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active
    if (updates.valid_from !== undefined) updateData.valid_from = updates.valid_from ? new Date(updates.valid_from) : null
    if (updates.valid_until !== undefined) updateData.valid_until = updates.valid_until ? new Date(updates.valid_until) : null

    const data = await db.coupon.update({
      where: { id },
      data: updateData,
    })

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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    await db.coupon.delete({
      where: { id },
    })

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
