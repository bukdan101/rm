import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default token packages fallback
const TOKEN_PACKAGES = [
  { id: 'pkg-1', tokens: 50, price: 50000, bonus_tokens: 0 },
  { id: 'pkg-2', tokens: 100, price: 95000, bonus_tokens: 5 },
  { id: 'pkg-3', tokens: 250, price: 225000, bonus_tokens: 15 },
  { id: 'pkg-4', tokens: 500, price: 425000, bonus_tokens: 50 },
  { id: 'pkg-5', tokens: 1000, price: 800000, bonus_tokens: 150 },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // Try to find the package in the database first
    let pkg = null
    if (packageId) {
      pkg = await db.creditPackage.findUnique({
        where: { id: packageId }
      })
    }

    // Fallback to default packages
    if (!pkg) {
      const defaultPkg = TOKEN_PACKAGES.find(p => p.id === packageId)
      if (!defaultPkg) {
        return NextResponse.json({ success: false, error: 'Invalid package' }, { status: 400 })
      }
      pkg = defaultPkg
    }

    const totalTokens = pkg.tokens + (pkg.bonus_tokens || 0)

    // Get or create user credits
    const existingCredit = await db.userCredit.findUnique({
      where: { user_id: userId }
    })

    let newBalance = totalTokens
    let creditId: string

    if (existingCredit) {
      // Update existing balance
      newBalance = existingCredit.balance + totalTokens
      creditId = existingCredit.id

      await db.userCredit.update({
        where: { id: existingCredit.id },
        data: {
          balance: newBalance,
          total_earned: existingCredit.total_earned + totalTokens,
          last_purchase_at: new Date(),
        }
      })
    } else {
      // Create new credits record
      const newCredit = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: totalTokens,
          total_earned: totalTokens,
          total_spent: 0,
          last_purchase_at: new Date(),
        }
      })

      creditId = newCredit.id
    }

    // Record the transaction
    await db.creditTransaction.create({
      data: {
        user_credit_id: creditId,
        user_id: userId,
        type: 'purchase',
        amount: totalTokens,
        balance_before: existingCredit?.balance || 0,
        balance_after: newBalance,
        description: `Purchased ${pkg.tokens} tokens${(pkg.bonus_tokens || 0) > 0 ? ` + ${pkg.bonus_tokens} bonus` : ''}`,
        reference_type: 'token_purchase',
        reference_id: packageId || `pkg_${Date.now()}`,
      }
    })

    return NextResponse.json({
      success: true,
      newBalance,
      tokensAdded: totalTokens,
      transaction: {
        id: `tx_${Date.now()}`,
        type: 'purchase',
        amount: totalTokens,
        balance_after: newBalance,
        description: `Purchased ${pkg.tokens} tokens${(pkg.bonus_tokens || 0) > 0 ? ` + ${pkg.bonus_tokens} bonus` : ''}`,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Token purchase error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
