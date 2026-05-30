import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Build where clause for transactions
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { reference_id: { contains: search } },
      ]
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ])

    // Fetch user profiles for the transactions
    const userIds = [...new Set(transactions.map(t => t.user_id).filter(Boolean))] as string[]
    const profiles = await db.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true, email: true, avatar_url: true },
    })

    const profilesMap = new Map(profiles.map(p => [p.id, p]))

    // Enrich transactions with user data
    const enrichedTransactions = transactions.map(t => ({
      ...t,
      user: profilesMap.get(t.user_id || '') || null,
    }))

    return NextResponse.json({
      success: true,
      data: enrichedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error in admin orders API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    // Transaction model doesn't have a notes field - use description or metadata
    if (notes !== undefined) {
      updateData.description = notes
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error in admin orders PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
