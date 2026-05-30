import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const settings = await db.userSetting.findUnique({
      where: { user_id: userId }
    })

    // Return default settings if not found
    const userSettings = settings || {
      notification_email: true,
      notification_push: true,
      notification_sms: false,
      promo_notifications: true,
      chat_notifications: true,
      theme: 'system',
      language: 'id',
      currency: 'IDR'
    }

    return NextResponse.json({ settings: userSettings })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId,
      email_notifications, 
      push_notifications, 
      sms_notifications,
      promo_notifications,
      chat_notifications,
      language,
      currency,
      theme
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Upsert settings
    const data = await db.userSetting.upsert({
      where: { user_id: userId },
      update: {
        notification_email: email_notifications ?? true,
        notification_push: push_notifications ?? true,
        notification_sms: sms_notifications ?? false,
        promo_notifications: promo_notifications ?? true,
        chat_notifications: chat_notifications ?? true,
        language: language ?? 'id',
        currency: currency ?? 'IDR',
        theme: theme ?? 'system',
      },
      create: {
        user_id: userId,
        notification_email: email_notifications ?? true,
        notification_push: push_notifications ?? true,
        notification_sms: sms_notifications ?? false,
        promo_notifications: promo_notifications ?? true,
        chat_notifications: chat_notifications ?? true,
        language: language ?? 'id',
        currency: currency ?? 'IDR',
        theme: theme ?? 'system',
      }
    })

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
