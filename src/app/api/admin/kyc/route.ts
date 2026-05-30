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

// GET: Get all KYC submissions with status filter (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) {
      const validStatuses = ['not_submitted', 'pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: 'Invalid status. Valid statuses: not_submitted, pending, approved, rejected',
        }, { status: 400 })
      }
      where.status = status
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { ktp_number: { contains: search } },
        { phone_number: { contains: search } },
      ]
    }

    // Fetch KYC submissions
    const [kycSubmissions, count] = await Promise.all([
      db.kycVerification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.kycVerification.count({ where }),
    ])

    // Get user profile data and location names for each KYC submission
    const kycWithUserData = await Promise.all(
      kycSubmissions.map(async (kyc) => {
        // Get user profile
        const userProfile = await db.profile.findUnique({
          where: { id: kyc.user_id },
          select: { id: true, email: true, full_name: true, phone: true, avatar_url: true, role: true },
        })

        // Get location names
        let provinceName = null
        let cityName = null
        let districtName = null
        let villageName = null

        if (kyc.province_id) {
          const province = await db.province.findUnique({ where: { id: kyc.province_id }, select: { name: true } })
          provinceName = province?.name || null
        }

        if (kyc.city_id) {
          const city = await db.city.findUnique({ where: { id: kyc.city_id }, select: { name: true } })
          cityName = city?.name || null
        }

        if (kyc.district_id) {
          const district = await db.district.findUnique({ where: { id: kyc.district_id }, select: { name: true } })
          districtName = district?.name || null
        }

        if (kyc.village_id) {
          const village = await db.village.findUnique({ where: { id: kyc.village_id }, select: { name: true } })
          villageName = village?.name || null
        }

        // Get reviewer info if reviewed
        let reviewerInfo = null
        if (kyc.reviewed_by) {
          const reviewer = await db.profile.findUnique({
            where: { id: kyc.reviewed_by },
            select: { id: true, full_name: true, email: true },
          })
          reviewerInfo = reviewer
        }

        return {
          ...kyc,
          user: userProfile,
          province_name: provinceName,
          city_name: cityName,
          district_name: districtName,
          village_name: villageName,
          reviewer: reviewerInfo,
        }
      })
    )

    return NextResponse.json({
      kyc_submissions: kycWithUserData,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching admin KYC submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Approve/reject KYC submission (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { kyc_id, action, rejection_reason } = body

    if (!kyc_id || !action) {
      return NextResponse.json({ error: 'KYC ID and action are required' }, { status: 400 })
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Valid actions: approve, reject' }, { status: 400 })
    }

    // Get KYC submission
    const kycSubmission = await db.kycVerification.findUnique({
      where: { id: kyc_id },
    })

    if (!kycSubmission) {
      return NextResponse.json({ error: 'KYC submission not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Approve KYC
      await db.kycVerification.update({
        where: { id: kyc_id },
        data: {
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: authResult.userId,
        },
      })

      // Update user's is_verified status
      await db.profile.update({
        where: { id: kycSubmission.user_id },
        data: { is_verified: true },
      })

      return NextResponse.json({
        success: true,
        message: 'KYC submission approved successfully',
      })
    }

    if (action === 'reject') {
      // Validate rejection reason
      if (!rejection_reason) {
        return NextResponse.json({ error: 'Rejection reason is required when rejecting' }, { status: 400 })
      }

      // Reject KYC
      await db.kycVerification.update({
        where: { id: kyc_id },
        data: {
          status: 'rejected',
          rejection_reason,
          reviewed_at: new Date(),
          reviewed_by: authResult.userId,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'KYC submission rejected',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating KYC submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
