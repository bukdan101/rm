import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }
  return { authorized: true, userId }
}

// GET: Get all dealers with pagination and search (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const verified = searchParams.get('verified')
    const isActive = searchParams.get('is_active')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true'
    }

    if (isActive !== null && isActive !== undefined) {
      where.is_active = isActive === 'true'
    }

    // Fetch dealers with owner relation
    const [dealers, count] = await Promise.all([
      db.dealer.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          phone: true,
          address: true,
          city_id: true,
          province_id: true,
          verified: true,
          rating: true,
          total_listings: true,
          is_active: true,
          created_at: true,
          owner: {
            select: { id: true, full_name: true, email: true, phone: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.dealer.count({ where }),
    ])

    // Get city and province names for each dealer
    const dealersWithLocation = await Promise.all(
      dealers.map(async (dealer) => {
        let cityName = null
        let provinceName = null

        if (dealer.city_id) {
          const city = await db.city.findUnique({ where: { id: dealer.city_id }, select: { name: true } })
          cityName = city?.name || null
        }

        if (dealer.province_id) {
          const province = await db.province.findUnique({ where: { id: dealer.province_id! }, select: { name: true } })
          provinceName = province?.name || null
        }

        return {
          ...dealer,
          city_name: cityName,
          province_name: provinceName,
        }
      })
    )

    return NextResponse.json({
      dealers: dealersWithLocation,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching admin dealers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Verify/activate dealer (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { dealer_id, verified, is_active } = body

    if (!dealer_id) {
      return NextResponse.json({ error: 'Dealer ID is required' }, { status: 400 })
    }

    // Check if at least one field to update is provided
    if (verified === undefined && is_active === undefined) {
      return NextResponse.json({ error: 'At least one field (verified or is_active) is required' }, { status: 400 })
    }

    // Build update object
    const updateData: { verified?: boolean; is_active?: boolean } = {}

    if (verified !== undefined) {
      updateData.verified = verified
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    // Update dealer
    const updatedDealer = await db.dealer.update({
      where: { id: dealer_id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        verified: true,
        is_active: true,
        updated_at: true,
      },
    })

    if (!updatedDealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer updated successfully',
      dealer: updatedDealer,
    })
  } catch (error) {
    console.error('Error updating dealer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
