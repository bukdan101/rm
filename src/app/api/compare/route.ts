import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return errorResponse('Car IDs required', 400)
    }

    const carIds = ids.split(',').filter(Boolean)

    if (carIds.length === 0 || carIds.length > 4) {
      return errorResponse('Please provide 1-4 car IDs', 400)
    }

    const data = await db.carListing.findMany({
      where: {
        id: { in: carIds },
        deleted_at: null
      },
      include: {
        brand: true,
        model: true,
        variant: true,
        exteriorColor: true,
        images: true,
        features: true,
        rentalPrice: true,
        inspection: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching compare data:', error)
    return errorResponse('Failed to fetch comparison data', 500)
  }
}
