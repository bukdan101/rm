import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get user's credit balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId },
      select: { id: true },
    })

    // Get or create user credits
    let credits = await db.userCredit.findFirst({
      where: dealer
        ? { dealer_id: dealer.id }
        : { user_id: userId },
    })

    // If no credits record, create one (with registration bonus check)
    if (!credits) {
      const bonusTracker = await db.registrationBonusTracker.findFirst({
        where: { is_active: true },
      })

      let initialBalance = 0

      // Check if eligible for registration bonus
      if (bonusTracker && bonusTracker.total_given < bonusTracker.max_bonus) {
        initialBalance = bonusTracker.bonus_amount

        // Create credits record
        const newCredits = await db.userCredit.create({
          data: {
            user_id: dealer ? null : userId,
            dealer_id: dealer?.id || null,
            balance: initialBalance,
            total_earned: initialBalance,
            total_spent: 0,
            total_bonus: initialBalance,
          },
        })

        // Record transaction
        await db.creditTransaction.create({
          data: {
            user_credit_id: newCredits.id,
            user_id: dealer ? null : userId,
            type: 'registration_bonus',
            amount: initialBalance,
            balance_before: 0,
            balance_after: initialBalance,
            description: `Bonus pendaftaran (${bonusTracker.total_given + 1}/${bonusTracker.max_bonus})`,
            reference_type: 'registration',
          },
        })

        // Update bonus tracker
        await db.registrationBonusTracker.update({
          where: { id: bonusTracker.id },
          data: { total_given: bonusTracker.total_given + 1 },
        })

        return NextResponse.json({
          credits: newCredits,
          isNewUser: true,
          bonusReceived: initialBalance,
        })
      } else {
        // No bonus, create empty credits
        const newCredits = await db.userCredit.create({
          data: {
            user_id: dealer ? null : userId,
            dealer_id: dealer?.id || null,
            balance: 0,
            total_earned: 0,
            total_spent: 0,
          },
        })

        return NextResponse.json({
          credits: newCredits,
          isNewUser: true,
          bonusReceived: 0,
        })
      }
    }

    return NextResponse.json({
      credits,
      isNewUser: false,
      bonusReceived: 0,
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
