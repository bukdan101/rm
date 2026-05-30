import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')

    // Build where clause
    const where: any = {
      status: 'active',
      deleted_at: null,
      transaction_type: 'rental',
      rentalPrice: { isNot: null }
    }

    if (priceMin) {
      where.price_cash = { ...where.price_cash, gte: parseInt(priceMin) }
    }
    if (priceMax) {
      where.price_cash = { ...where.price_cash, lte: parseInt(priceMax) }
    }

    const [data, count] = await Promise.all([
      db.carListing.findMany({
        where,
        include: {
          rentalPrice: true
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      db.carListing.count({ where })
    ])

    return successResponse({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching rentals:', error)
    return errorResponse('Failed to fetch rentals', 500)
  }
}
