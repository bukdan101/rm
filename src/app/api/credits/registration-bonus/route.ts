import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const REGISTRATION_BONUS = 500

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user already received registration bonus
    const existingBonus = await db.creditTransaction.findFirst({
      where: {
        user_id: userId,
        type: 'bonus',
        description: 'Bonus registrasi user baru'
      }
    })

    if (existingBonus) {
      return NextResponse.json({
        success: false,
        message: 'User already received registration bonus',
        credits: null,
      })
    }

    // Ensure profile exists first
    const profile = await db.profile.findUnique({
      where: { id: userId }
    })

    if (!profile) {
      // Create profile if doesn't exist
      await db.profile.create({
        data: {
          id: userId,
          email: email || `${userId}@example.com`,
          full_name: name || 'User',
        }
      })
    }

    // Get or create user credits
    const userCredit = await db.userCredit.findUnique({
      where: { user_id: userId }
    })

    if (!userCredit) {
      // Create new user credits with bonus
      const newCredit = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: REGISTRATION_BONUS,
          total_earned: REGISTRATION_BONUS,
          total_spent: 0,
          total_bonus: REGISTRATION_BONUS,
        }
      })

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          user_credit_id: newCredit.id,
          user_id: userId,
          type: 'bonus',
          amount: REGISTRATION_BONUS,
          balance_before: 0,
          balance_after: REGISTRATION_BONUS,
          description: 'Bonus registrasi user baru',
          reference_type: 'registration',
          reference_id: userId,
        }
      })

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: REGISTRATION_BONUS,
          bonus: REGISTRATION_BONUS,
        },
      })
    } else {
      // User credits already exist, add bonus
      const newBalance = (userCredit.balance || 0) + REGISTRATION_BONUS
      const newTotalBonus = (userCredit.total_bonus || 0) + REGISTRATION_BONUS

      await db.userCredit.update({
        where: { id: userCredit.id },
        data: {
          balance: newBalance,
          total_earned: userCredit.total_earned + REGISTRATION_BONUS,
          total_bonus: newTotalBonus,
        }
      })

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          user_credit_id: userCredit.id,
          user_id: userId,
          type: 'bonus',
          amount: REGISTRATION_BONUS,
          balance_before: userCredit.balance || 0,
          balance_after: newBalance,
          description: 'Bonus registrasi user baru',
          reference_type: 'registration',
          reference_id: userId,
        }
      })

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: newBalance,
          bonus: REGISTRATION_BONUS,
        },
      })
    }
  } catch (error) {
    console.error('Error giving registration bonus:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to give registration bonus' },
      { status: 500 }
    )
  }
}
