import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // Get balance from user_credits only
    const credit = await db.userCredit.findUnique({
      where: { user_id: userId }
    })

    return NextResponse.json({
      success: true,
      balance: credit?.balance || 0,
    })
  } catch (error) {
    console.error('Get user tokens error:', error)
    return NextResponse.json({
      success: true,
      balance: 0,
    })
  }
}
