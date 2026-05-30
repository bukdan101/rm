import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/banners/[id]/click - Track banner click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current banner
    const banner = await db.banner.findUnique({
      where: { id },
      select: { clicks: true }
    })

    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 })
    }

    // Increment click count
    await db.banner.update({
      where: { id },
      data: { clicks: (banner.clicks || 0) + 1 }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ success: false, error: 'Failed to track click' }, { status: 500 })
  }
}
