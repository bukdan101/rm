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

// GET: Get all users with pagination, search, and role filter (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const isVerified = searchParams.get('is_verified')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (isVerified !== null && isVerified !== undefined) {
      where.is_verified = isVerified === 'true'
    }

    // Fetch users with count
    const [users, count] = await Promise.all([
      db.profile.findMany({
        where,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          is_verified: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.profile.count({ where }),
    ])

    // Get listing and favorite counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (userData) => {
        // Get listing count
        const listingCount = await db.carListing.count({
          where: { user_id: userData.id },
        })

        // Get favorite count
        const favoriteCount = await db.carFavorite.count({
          where: { user_id: userData.id },
        })

        return {
          ...userData,
          listings_count: listingCount,
          favorites_count: favoriteCount,
        }
      })
    )

    return NextResponse.json({
      users: usersWithCounts,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update user role or verification status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { user_id, role, is_verified } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if at least one field to update is provided
    if (role === undefined && is_verified === undefined) {
      return NextResponse.json({ error: 'At least one field (role or is_verified) is required' }, { status: 400 })
    }

    // Build update object
    const updateData: { role?: string; is_verified?: boolean } = {}

    if (role !== undefined) {
      const validRoles = ['buyer', 'seller', 'dealer', 'admin', 'inspector']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Valid roles: buyer, seller, dealer, admin, inspector' }, { status: 400 })
      }
      updateData.role = role
    }

    if (is_verified !== undefined) {
      updateData.is_verified = is_verified
    }

    // Update user profile
    const updatedUser = await db.profile.update({
      where: { id: user_id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_verified: true,
        created_at: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
