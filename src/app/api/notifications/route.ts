import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const where: Record<string, unknown> = { user_id: userId }
    if (unreadOnly) where.read = false

    const notifications = await db.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    // Get unread count
    const unreadCount = await db.notification.count({
      where: { user_id: userId, read: false },
    })

    // Transform data for frontend
    const transformedNotifications = notifications.map(n => ({
      id: n.id,
      type: n.type || 'info',
      title: n.title,
      message: n.message,
      isRead: n.read,
      createdAt: n.created_at,
      actionUrl: n.action_url,
      // data is String? in schema - parse JSON if needed
      data: n.data ? tryParseJSON(n.data) : null,
    }))

    return NextResponse.json({
      notifications: transformedNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, markAllRead, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (markAllRead) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: { user_id: userId, read: false },
        data: { read: true, read_at: new Date() },
      })
    } else if (notificationId) {
      // Mark single notification as read
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true, read_at: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, actionUrl, data } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notification = await db.notification.create({
      data: {
        user_id: userId,
        type: type || 'info',
        title,
        message: message || null,
        action_url: actionUrl || null,
        // Fixed: data is String? in schema - must JSON.stringify before inserting
        data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null,
        read: false,
      },
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to safely parse JSON strings
function tryParseJSON(str: string): unknown {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}
