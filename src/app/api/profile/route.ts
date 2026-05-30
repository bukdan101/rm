import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile from profiles table
    const profile = await db.profile.findUnique({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      profile: profile || {
        id: userId,
        email: '',
        full_name: '',
        role: 'buyer',
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, full_name, phone } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Fixed: Removed city and province fields - they don't exist in Profile model
    const profile = await db.profile.upsert({
      where: { id: userId },
      update: {
        full_name: full_name || undefined,
        phone: phone || undefined,
      },
      create: {
        id: userId,
        email: '', // Will need to be provided or have a default
        full_name: full_name || null,
        phone: phone || null,
      },
    })

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
