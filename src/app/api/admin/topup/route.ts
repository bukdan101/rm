import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch topup requests with user info and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Filter params
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    // Build query for topup requests
    let where: any = {}

    // Apply status filter
    if (status) {
      where.status = status
    }

    // Apply search filter (on topup_number or payment_reference)
    if (search) {
      where.OR = [
        { topup_number: { contains: search } },
        { payment_reference: { contains: search } }
      ]
    }

    const [topupRequests, count] = await Promise.all([
      db.topupRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.topupRequest.count({ where })
    ])

    if (!topupRequests || topupRequests.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // Get user IDs from topup requests
    const userIds = topupRequests.map(t => t.user_id).filter(Boolean) as string[]

    // Fetch user profiles
    const profiles = await db.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, full_name: true, avatar_url: true, phone: true }
    })

    // Create profile map
    const profileMap = new Map(
      profiles.map(p => [p.id, p])
    )

    // Combine topup data with user info
    const enrichedRecords = topupRequests.map(topup => ({
      id: topup.id,
      topup_number: topup.topup_number,
      user_id: topup.user_id,
      amount: topup.amount,
      tokens: topup.tokens,
      payment_method: topup.payment_method,
      payment_proof_url: topup.payment_proof_url,
      payment_reference: topup.payment_reference,
      status: topup.status,
      rejection_reason: topup.rejection_reason,
      processed_by: topup.processed_by,
      processed_at: topup.processed_at,
      notes: topup.notes,
      created_at: topup.created_at,
      updated_at: topup.updated_at,
      user: topup.user_id ? profileMap.get(topup.user_id) || null : null,
    }))

    return NextResponse.json({
      success: true,
      data: enrichedRecords,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching topup requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topup requests' },
      { status: 500 }
    )
  }
}

// PATCH - Confirm or reject topup request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { topupId, status, adminId, notes, rejectionReason } = body

    if (!topupId || !status) {
      return NextResponse.json(
        { success: false, error: 'Topup ID and status are required' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be either confirmed or rejected' },
        { status: 400 }
      )
    }

    // Get the topup request first
    const topupRequest = await db.topupRequest.findUnique({
      where: { id: topupId }
    })

    if (!topupRequest) {
      return NextResponse.json(
        { success: false, error: 'Topup request not found' },
        { status: 404 }
      )
    }

    if (topupRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Topup request already processed' },
        { status: 400 }
      )
    }

    // Update topup request
    const updateData: any = {
      status,
      processed_at: new Date(),
      processed_by: adminId || null,
    }

    if (notes) {
      updateData.notes = notes
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const data = await db.topupRequest.update({
      where: { id: topupId },
      data: updateData
    })

    // If confirmed, add tokens to user
    if (status === 'confirmed' && data.user_id) {
      // Check if user_credits record exists
      const existingCredit = await db.userCredit.findUnique({
        where: { user_id: data.user_id }
      })

      if (existingCredit) {
        // Update existing record
        await db.userCredit.update({
          where: { user_id: data.user_id },
          data: {
            balance: existingCredit.balance + data.tokens,
            total_earned: existingCredit.total_earned + data.tokens,
            last_purchase_at: new Date(),
          }
        })
      } else {
        // Create new record
        await db.userCredit.create({
          data: {
            user_id: data.user_id,
            balance: data.tokens,
            total_earned: data.tokens,
            total_spent: 0,
            total_bonus: 0,
            last_purchase_at: new Date(),
          }
        })
      }

      // Create credit transaction record
      const userCredit = await db.userCredit.findUnique({
        where: { user_id: data.user_id }
      })

      if (userCredit) {
        await db.creditTransaction.create({
          data: {
            user_credit_id: userCredit.id,
            user_id: data.user_id,
            type: 'purchase',
            amount: data.tokens,
            description: `Topup via ${data.payment_method} - ${data.topup_number}`,
            reference_type: 'topup',
            reference_id: data.id,
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Topup request ${status} successfully`,
      data,
    })
  } catch (error) {
    console.error('Error updating topup status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update topup status' },
      { status: 500 }
    )
  }
}
