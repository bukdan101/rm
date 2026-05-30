import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const data = await db.carFavorite.findMany({
      where: { user_id: userId },
      include: {
        listing: {
          include: {
            brand: true,
            model: true,
            images: { orderBy: { display_order: 'asc' } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, car_listing_id, notes } = body

    try {
      const data = await db.carFavorite.create({
        data: {
          user_id,
          car_listing_id,
          notes,
        },
      })

      return NextResponse.json({ success: true, data })
    } catch (err: unknown) {
      // Unique constraint violation
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Already in favorites' },
          { status: 400 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const listingId = searchParams.get('listing_id')

    if (!userId || !listingId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Listing ID required' },
        { status: 400 }
      )
    }

    await db.carFavorite.deleteMany({
      where: {
        user_id: userId,
        car_listing_id: listingId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
