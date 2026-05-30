import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch banners with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = {}
    // Apply status filter - Banner has both status (String) and is_active (Boolean)
    if (status && status !== 'all') {
      where.status = status
    }

    const [banners, total] = await Promise.all([
      db.banner.findMany({
        where,
        orderBy: [
          { display_order: 'asc' },
          { created_at: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      db.banner.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      banners,
      totalPages,
      total,
    })
  } catch (error) {
    console.error('Error in admin banners GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      imageUrl,
      targetUrl, // Fixed: link_url → target_url
      position,
      displayOrder,
      status,
      isActive,
      startDate,
      endDate,
    } = body

    // Validate required fields
    if (!title || !imageUrl) {
      return NextResponse.json({
        error: 'Title and image URL are required',
      }, { status: 400 })
    }

    // Insert banner using correct field names from Banner schema
    const banner = await db.banner.create({
      data: {
        title,
        description: description || null,
        image_url: imageUrl,
        target_url: targetUrl || null, // Fixed: link_url → target_url
        position: position || 'home',
        display_order: displayOrder || 0,
        status: status || 'active',
        is_active: isActive !== undefined ? isActive : true,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        impressions: 0,
        clicks: 0,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Error in admin banners POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update banner
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      description,
      imageUrl,
      targetUrl, // Fixed: link_url → target_url
      position,
      displayOrder,
      status,
      isActive,
      startDate,
      endDate,
    } = body

    // Build update object using correct Banner schema field names
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (targetUrl !== undefined) updateData.target_url = targetUrl // Fixed: link_url → target_url
    if (position !== undefined) updateData.position = position
    if (displayOrder !== undefined) updateData.display_order = displayOrder
    if (status !== undefined) updateData.status = status
    if (isActive !== undefined) updateData.is_active = isActive
    if (startDate !== undefined) updateData.start_date = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.end_date = endDate ? new Date(endDate) : null

    // Update banner
    const banner = await db.banner.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Error in admin banners PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin banners DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
