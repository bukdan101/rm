import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const carListingId = searchParams.get('car_listing_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const where: Record<string, unknown> = {
      OR: [{ buyer_id: userId }, { seller_id: userId }],
    }

    if (carListingId) {
      where.car_listing_id = carListingId
    }

    const conversations = await db.conversation.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: {
              select: { image_url: true, is_primary: true },
              orderBy: { display_order: 'asc' },
            },
          },
        },
        buyer: {
          select: { id: true, full_name: true, avatar_url: true },
        },
        seller: {
          select: { id: true, full_name: true, avatar_url: true },
        },
      },
      orderBy: { last_message_at: 'desc' },
    })

    // Transform the data to match the frontend interface
    const transformedConversations = conversations.map(conv => {
      const isBuyer = conv.buyer_id === userId
      const otherUser = isBuyer ? conv.seller : conv.buyer
      const listing = conv.listing
      const primaryImage = listing?.images
      const imageUrl = primaryImage?.find(img => img.is_primary)?.image_url || primaryImage?.[0]?.image_url || null

      return {
        id: conv.id,
        listing_id: conv.car_listing_id,
        listing_title: listing?.title || null,
        listing_image: imageUrl,
        other_user_id: otherUser?.id,
        other_user_name: otherUser?.full_name || 'Unknown User',
        other_user_avatar: otherUser?.avatar_url || null,
        last_message: conv.last_message || '',
        last_message_at: conv.last_message_at || conv.created_at,
        unread_count: isBuyer ? (conv.buyer_unread || 0) : (conv.seller_unread || 0),
        status: conv.status || 'active',
      }
    })

    return NextResponse.json({
      success: true,
      conversations: transformedConversations,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({
      success: true,
      conversations: [],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { car_listing_id, seller_id, message, buyer_id } = body

    if (!car_listing_id || !seller_id || !buyer_id) {
      return NextResponse.json(
        { success: false, error: 'car_listing_id, seller_id, and buyer_id are required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existing = await db.conversation.findFirst({
      where: {
        car_listing_id,
        buyer_id,
        seller_id,
      },
    })

    if (existing) {
      return NextResponse.json({ success: true, conversation: existing })
    }

    // Create new conversation
    const newConversation = await db.conversation.create({
      data: {
        car_listing_id,
        buyer_id,
        seller_id,
        status: 'active',
        buyer_unread: 0,
        seller_unread: 0,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: {
              select: { image_url: true, is_primary: true },
              orderBy: { display_order: 'asc' },
            },
          },
        },
        buyer: {
          select: { id: true, full_name: true, avatar_url: true },
        },
        seller: {
          select: { id: true, full_name: true, avatar_url: true },
        },
      },
    })

    // Send initial message if provided
    if (message?.trim()) {
      await db.message.create({
        data: {
          conversation_id: newConversation.id,
          sender_id: buyer_id,
          message: message.trim(),
          is_read: false,
        },
      })

      // Update conversation
      await db.conversation.update({
        where: { id: newConversation.id },
        data: {
          last_message: message.trim(),
          last_message_at: new Date(),
          seller_unread: 1,
        },
      })
    }

    return NextResponse.json({ success: true, conversation: newConversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
