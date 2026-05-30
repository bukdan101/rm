import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'purchase', 'usage', 'bonus', etc.

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Silakan login terlebih dahulu',
      }, { status: 401 })
    }

    // Get user's credit record using db.userCredit
    let wallet = await db.userCredit.findUnique({
      where: { user_id: userId },
    })

    if (!wallet) {
      // Create wallet if not exists
      wallet = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        },
      })

      return NextResponse.json({
        success: true,
        transactions: [],
        balance: 0,
        walletId: wallet.id,
      })
    }

    // Build query for transactions using db.creditTransaction
    const where: Record<string, unknown> = { user_credit_id: wallet.id }
    if (type) where.type = type

    const transactions = await db.creditTransaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    // Transform for frontend
    const transformedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.amount >= 0 ? 'credit' : 'debit',
      transactionType: tx.type,
      amount: Math.abs(tx.amount),
      description: tx.description,
      balanceBefore: tx.balance_before,
      balanceAfter: tx.balance_after,
      createdAt: tx.created_at,
      referenceId: tx.reference_id,
      referenceType: tx.reference_type,
    }))

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
      balance: wallet.balance || 0,
      totalEarned: wallet.total_earned || 0,
      totalSpent: wallet.total_spent || 0,
      walletId: wallet.id,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
    }, { status: 500 })
  }
}
