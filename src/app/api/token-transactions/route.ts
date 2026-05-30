import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // Get user's credit transactions
    const transactions = await db.creditTransaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
    })
  } catch (error) {
    console.error('Token transactions error:', error)
    return NextResponse.json({
      success: true,
      transactions: [],
    })
  }
}
