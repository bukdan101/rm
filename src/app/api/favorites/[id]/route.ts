import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the favorite, ensuring it belongs to the current user
    const result = await db.carFavorite.deleteMany({
      where: {
        id,
        user_id: userId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Favorite not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 })
  }
}
