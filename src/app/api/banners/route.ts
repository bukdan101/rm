import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners - Fetch banners by position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')

    const where: Record<string, unknown> = {}
    if (position) {
      where.position = position
    }

    const data = await db.banner.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    // Increment impressions for banners when position is specified
    if (position && data && data.length > 0) {
      const randomBanner = data[Math.floor(Math.random() * data.length)]

      // Increment impression (fire and forget)
      db.banner.update({
        where: { id: randomBanner.id },
        data: { impressions: (randomBanner.impressions || 0) + 1 },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      banners: data || [],
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({
      success: true,
      banners: [],
    })
  }
}

// POST /api/banners - Create new banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const data = await db.banner.create({
      data: {
        title: body.title,
        image_url: body.imageUrl,
        target_url: body.targetUrl,
        position: body.position,
      },
    })

    return NextResponse.json({
      success: true,
      banner: data,
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
