import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        isAuthenticated: false,
        isAdmin: false,
        isDealer: false,
        role: null,
      })
    }

    // Get user profile to check role
    const profile = await db.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!profile) {
      return NextResponse.json({
        isAuthenticated: true,
        isAdmin: false,
        isDealer: false,
        role: 'user',
      })
    }

    const role = profile.role || 'user'
    const isAdmin = role === 'admin'
    const isDealer = role === 'dealer' || isAdmin

    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      isDealer,
      role,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      isDealer: false,
      role: null,
    })
  }
}
