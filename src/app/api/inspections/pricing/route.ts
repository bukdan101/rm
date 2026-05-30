import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get all inspection pricing
export async function GET(request: NextRequest) {
  try {
    const data = await db.inspectionPricing.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    })

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

    const data = await db.inspectionPricing.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price || 0,
        duration_days: body.duration_days || null,
        type: body.type,
        token_cost: body.token_cost || 0,
        includes_inspector: body.includes_inspector || false,
        includes_certificate: body.includes_certificate || false,
        includes_ai_analysis: body.includes_ai_analysis ?? true,
        certificate_validity_days: body.certificate_validity_days || 90,
        is_popular: body.is_popular || false,
        display_order: body.display_order || 0
      }
    })

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

    const data = await db.inspectionPricing.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        duration_days: body.duration_days,
        token_cost: body.token_cost,
        includes_inspector: body.includes_inspector,
        includes_certificate: body.includes_certificate,
        includes_ai_analysis: body.includes_ai_analysis,
        certificate_validity_days: body.certificate_validity_days,
        is_popular: body.is_popular,
        is_active: body.is_active,
        display_order: body.display_order
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating inspection pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inspection pricing' },
      { status: 500 }
    )
  }
}
