import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST: Deduct credits for listing creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, reference, user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: user_id },
      select: { id: true },
    })

    // Get user credits
    const userCredit = await db.userCredit.findFirst({
      where: dealer
        ? { dealer_id: dealer.id }
        : { user_id: user_id },
    })

    if (!userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }

    // Check balance
    if (userCredit.balance < amount) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: amount,
          current: userCredit.balance,
        },
        { status: 400 }
      )
    }

    // Deduct credits
    const newBalance = userCredit.balance - amount

    await db.userCredit.update({
      where: { id: userCredit.id },
      data: {
        balance: newBalance,
        total_spent: userCredit.total_spent + amount,
        last_usage_at: new Date(),
      },
    })

    // Record transaction
    try {
      await db.creditTransaction.create({
        data: {
          user_credit_id: userCredit.id,
          user_id: dealer ? null : user_id,
          type: 'usage',
          amount: -amount,
          balance_before: userCredit.balance,
          balance_after: newBalance,
          description: description || 'Credit deduction',
          reference_id: reference?.id,
          reference_type: reference?.type,
        },
      })
    } catch (transactionError) {
      console.error('Failed to record transaction:', transactionError)
      // Don't rollback, just log the error
    }

    return NextResponse.json({
      success: true,
      balance_before: userCredit.balance,
      balance_after: newBalance,
      amount_deducted: amount,
    })
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
