import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current view count and increment
    const listing = await db.carListing.findUnique({
      where: { id },
      select: { view_count: true },
    })

    if (listing) {
      await db.carListing.update({
        where: { id },
        data: { view_count: (listing.view_count || 0) + 1 },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json({ success: true })
  }
}
