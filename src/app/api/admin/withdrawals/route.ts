import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.withdrawal.count({ where }),
    ])

    // Fetch user profiles
    const userIds = [...new Set(withdrawals.map(w => w.user_id).filter(Boolean))] as string[]
    const profiles = await db.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true },
    })

    const profilesMap = new Map(profiles.map(p => [p.id, p]))

    const enrichedWithdrawals = withdrawals.map(w => ({
      ...w,
      user: profilesMap.get(w.user_id || '') || null,
    }))

    return NextResponse.json({
      success: true,
      data: enrichedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error in admin withdrawals API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, rejection_reason, processed_by } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (rejection_reason) updateData.rejection_reason = rejection_reason
    // Withdrawal model uses processed_by (not reviewed_by)
    if (processed_by) updateData.processed_by = processed_by
    if (status === 'completed') updateData.processed_at = new Date()

    const withdrawal = await db.withdrawal.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: withdrawal })
  } catch (error) {
    console.error('Error in admin withdrawals PATCH:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
