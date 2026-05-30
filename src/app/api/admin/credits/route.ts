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

// GET: Get all user credits (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const credits = await db.userCredit.findMany({
      include: {
        transactions: true,
      },
      orderBy: { created_at: 'desc' },
    })

    // Enrich with user and dealer data
    const enrichedCredits = await Promise.all(
      credits.map(async (credit) => {
        let user = null
        let dealer = null

        if (credit.user_id) {
          const profile = await db.profile.findUnique({
            where: { id: credit.user_id },
            select: { id: true, full_name: true, email: true },
          })
          user = profile
        }

        if (credit.dealer_id) {
          const dealerData = await db.dealer.findUnique({
            where: { id: credit.dealer_id },
            select: { id: true, name: true, slug: true },
          })
          dealer = dealerData
        }

        return {
          ...credit,
          user,
          dealer,
        }
      })
    )

    return NextResponse.json({ credits: enrichedCredits })
  } catch (error) {
    console.error('Error fetching admin credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Adjust user credits (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { credit_id, amount, description } = body

    if (!credit_id || amount === undefined) {
      return NextResponse.json({ error: 'Credit ID and amount are required' }, { status: 400 })
    }

    // Get current credits
    const userCredit = await db.userCredit.findUnique({
      where: { id: credit_id },
    })

    if (!userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }

    const newBalance = userCredit.balance + amount

    if (newBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance for this adjustment' }, { status: 400 })
    }

    // Update credits
    await db.userCredit.update({
      where: { id: credit_id },
      data: {
        balance: newBalance,
        total_earned: amount > 0 ? userCredit.total_earned + amount : userCredit.total_earned,
        total_spent: amount < 0 ? userCredit.total_spent + Math.abs(amount) : userCredit.total_spent,
      },
    })

    // Record transaction
    await db.creditTransaction.create({
      data: {
        user_credit_id: userCredit.id,
        user_id: userCredit.user_id,
        type: 'admin_adjustment',
        amount: amount,
        balance_before: userCredit.balance,
        balance_after: newBalance,
        description: description || 'Admin adjustment',
      },
    })

    return NextResponse.json({
      success: true,
      balance_before: userCredit.balance,
      balance_after: newBalance,
      adjustment: amount,
    })
  } catch (error) {
    console.error('Error adjusting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
