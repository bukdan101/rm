import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners/[id] - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const banner = await db.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      banner,
    })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

// PATCH /api/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
    if (body.targetUrl !== undefined) updateData.target_url = body.targetUrl
    if (body.position !== undefined) updateData.position = body.position
    if (body.status !== undefined) updateData.status = body.status
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder
    // Fixed: budget_total now exists in Banner schema
    if (body.budgetTotal !== undefined) updateData.budget_total = body.budgetTotal
    // Fixed: starts_at/ends_at → start_date/end_date
    if (body.startDate !== undefined) updateData.start_date = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.end_date = body.endDate ? new Date(body.endDate) : null
    // Also accept the old field names for backward compatibility
    if (body.startsAt !== undefined) updateData.start_date = body.startsAt ? new Date(body.startsAt) : null
    if (body.endsAt !== undefined) updateData.end_date = body.endsAt ? new Date(body.endsAt) : null

    const banner = await db.banner.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      banner,
    })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

// DELETE /api/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
