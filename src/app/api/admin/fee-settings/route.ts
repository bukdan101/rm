import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get fee settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const data = await db.feeSetting.findUnique({
        where: { id },
      })

      return NextResponse.json({ success: true, data })
    }

    // List all fee settings
    const data = await db.feeSetting.findMany({
      orderBy: { created_at: 'desc' },
    })

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
      created_by,
    } = body

    // Deactivate existing settings if this one is active
    await db.feeSetting.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    })

    const data = await db.feeSetting.create({
      data: {
        fee_type: fee_type || 'percentage',
        fee_percentage: fee_percentage || 5.0,
        fee_fixed_amount: fee_fixed_amount || 0,
        // fee_tiers is String? - must JSON.stringify if object/array
        fee_tiers: fee_tiers ? (typeof fee_tiers === 'string' ? fee_tiers : JSON.stringify(fee_tiers)) : null,
        min_fee_amount: min_fee_amount || 0,
        max_fee_amount: max_fee_amount || null,
        applies_to: applies_to || 'all',
        min_vehicle_price: min_vehicle_price || null,
        max_vehicle_price: max_vehicle_price || null,
        is_active: true,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_until: valid_until ? new Date(valid_until) : null,
        created_by: created_by || null,
      },
    })

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
      await db.feeSetting.updateMany({
        where: { is_active: true, NOT: { id } },
        data: { is_active: false },
      })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...updates }
    if (is_active !== undefined) updateData.is_active = is_active
    if (updates.fee_tiers) {
      updateData.fee_tiers = typeof updates.fee_tiers === 'string' ? updates.fee_tiers : JSON.stringify(updates.fee_tiers)
    }
    if (updates.valid_from) {
      updateData.valid_from = new Date(updates.valid_from)
    }
    if (updates.valid_until) {
      updateData.valid_until = new Date(updates.valid_until)
    }

    const data = await db.feeSetting.update({
      where: { id },
      data: updateData,
    })

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

    await db.feeSetting.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Fee setting deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting fee setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete fee setting' },
      { status: 500 }
    )
  }
}
