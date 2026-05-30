import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse, successResponse } from '@/lib/api-utils'

// POST - Process credit purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, paymentMethod, userId } = body

    if (!packageId || !userId) {
      return errorResponse('Missing required fields', 400)
    }

    // Get package details from CreditPackage
    const pkg = await db.creditPackage.findUnique({
      where: { id: packageId }
    })

    // If package not in DB, use default calculation
    let credits = 50
    let bonusCredits = 0
    let price = 50000

    if (pkg) {
      credits = pkg.tokens
      bonusCredits = pkg.bonus_tokens || 0
      price = pkg.price
    } else {
      // Default packages mapping
      const defaultPackages: Record<string, { credits: number; bonus: number; price: number }> = {
        'pkg-starter': { credits: 50, bonus: 0, price: 50000 },
        'pkg-popular': { credits: 150, bonus: 15, price: 125000 },
        'pkg-business': { credits: 350, bonus: 50, price: 275000 },
        'pkg-enterprise': { credits: 750, bonus: 150, price: 550000 },
      }
      const defaultPkg = defaultPackages[packageId]
      if (defaultPkg) {
        credits = defaultPkg.credits
        bonusCredits = defaultPkg.bonus
        price = defaultPkg.price
      }
    }

    const totalCredits = credits + bonusCredits

    // Get or create user credit record
    const userCredit = await db.userCredit.findUnique({
      where: { user_id: userId }
    })

    if (userCredit) {
      // Update existing credit
      const newBalance = userCredit.balance + totalCredits
      await db.userCredit.update({
        where: { id: userCredit.id },
        data: {
          balance: newBalance,
          total_earned: userCredit.total_earned + totalCredits,
          last_purchase_at: paymentMethod === 'online' ? new Date() : userCredit.last_purchase_at,
        }
      })

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          user_credit_id: userCredit.id,
          user_id: userId,
          type: 'purchase',
          amount: totalCredits,
          balance_before: userCredit.balance,
          balance_after: newBalance,
          description: `Purchase ${credits} credits${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ''} via ${paymentMethod}`,
          reference_type: 'credit_purchase',
          reference_id: `PUR-${Date.now()}-${userId.slice(0, 8)}`,
        }
      })

      if (paymentMethod === 'online') {
        return successResponse({
          creditsAdded: totalCredits,
          message: 'Credits added successfully'
        })
      }
    } else {
      // Create new credit record
      const newCredit = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: totalCredits,
          total_earned: totalCredits,
          total_spent: 0,
          last_purchase_at: paymentMethod === 'online' ? new Date() : undefined,
        }
      })

      // Create transaction record
      await db.creditTransaction.create({
        data: {
          user_credit_id: newCredit.id,
          user_id: userId,
          type: 'purchase',
          amount: totalCredits,
          balance_before: 0,
          balance_after: totalCredits,
          description: `Purchase ${credits} credits${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ''} via ${paymentMethod}`,
          reference_type: 'credit_purchase',
          reference_id: `PUR-${Date.now()}-${userId.slice(0, 8)}`,
        }
      })

      if (paymentMethod === 'online') {
        return successResponse({
          creditsAdded: totalCredits,
          message: 'Credits added successfully'
        })
      }
    }

    // For manual payment, return bank details
    return successResponse({
      status: 'pending',
      creditsToAdd: totalCredits,
      amount: price,
      bankDetails: {
        bank: 'BNI',
        accountNumber: '1234567890',
        accountName: 'AutoMarket Indonesia',
        reference: `PUR-${Date.now()}-${userId.slice(0, 8)}`
      },
      instructions: `Silakan transfer ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)} ke rekening di atas`
    })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// GET - Get purchase history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return errorResponse('User ID required', 400)
    }

    const transactions = await db.creditTransaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    return successResponse({ transactions: transactions || [] })
  } catch (error) {
    console.error('Transaction fetch error:', error)
    return errorResponse('Internal server error', 500)
  }
}
