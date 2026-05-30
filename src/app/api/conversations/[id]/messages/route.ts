import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get messages for the conversation
    const messages = await db.message.findMany({
      where: { conversation_id: id },
      orderBy: { created_at: 'asc' },
    })

    // Get the conversation to know who is the buyer and seller
    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    // Mark messages as read - set read_at timestamp
    await db.message.updateMany({
      where: {
        conversation_id: id,
        sender_id: { not: userId },
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    })

    // Reset unread counter for the current user
    if (conversation) {
      if (conversation.buyer_id === userId) {
        await db.conversation.update({
          where: { id },
          data: { buyer_unread: 0 },
        })
      } else if (conversation.seller_id === userId) {
        await db.conversation.update({
          where: { id },
          data: { seller_unread: 0 },
        })
      }
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({
      success: true,
      messages: [],
    })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { message, userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    // Insert the message
    const newMessage = await db.message.create({
      data: {
        conversation_id: id,
        sender_id: userId,
        message: message.trim(),
        is_read: false,
      },
    })

    // Get the conversation to determine buyer/seller
    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    // Update conversation's last_message_at, last_message_by, and increment unread counter
    if (conversation) {
      const updateData: Record<string, unknown> = {
        last_message: message.trim(),
        last_message_at: new Date(),
        last_message_by: userId,
      }

      // Increment the other party's unread counter
      if (conversation.buyer_id === userId) {
        updateData.seller_unread = (conversation.seller_unread || 0) + 1
      } else if (conversation.seller_id === userId) {
        updateData.buyer_unread = (conversation.buyer_unread || 0) + 1
      }

      await db.conversation.update({
        where: { id },
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
