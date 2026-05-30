import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    // Brand model fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url
    if (body.country !== undefined) updateData.country = body.country
    if (body.is_popular !== undefined) updateData.is_popular = body.is_popular
    if (body.display_order !== undefined) updateData.display_order = body.display_order
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    const brand = await db.brand.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json({ success: true, brand })
  } catch (error) {
    console.error('Error in admin categories PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if brand has listings
    const listingCount = await db.carListing.count({
      where: { brand_id: Number(id) },
    })

    if (listingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing listings', listing_count: listingCount },
        { status: 400 }
      )
    }

    await db.brand.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin categories DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
