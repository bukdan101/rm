import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get user's credit transaction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId },
      select: { id: true },
    })

    // Get user credits
    const userCredit = await db.userCredit.findFirst({
      where: dealer
        ? { dealer_id: dealer.id }
        : { user_id: userId },
    })

    if (!userCredit) {
      return NextResponse.json({ transactions: [], total: 0 })
    }

    // Build transaction query
    const where: Record<string, unknown> = {
      user_credit_id: userCredit.id,
    }
    if (type) {
      where.type = type
    }

    const [transactions, count] = await Promise.all([
      db.creditTransaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.creditTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
