import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const carListingId = searchParams.get('car_listing_id')

    // Build the query - get conversations where user is buyer or seller
    let query = supabase
      .from('conversations')
      .select(`
        id,
        car_listing_id,
        buyer_id,
        seller_id,
        status,
        last_message,
        last_message_at,
        buyer_unread,
        seller_unread,
        car_listing:car_listings(
          id,
          title,
          images:car_images(image_url, is_primary)
        ),
        buyer:profiles!conversations_buyer_id_fkey(id, name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, name, avatar_url)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (carListingId) {
      query = query.eq('car_listing_id', carListingId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      // Return empty array if table doesn't exist or other error
      return NextResponse.json({
        success: true,
        conversations: [],
      })
    }

    // Transform the data to match the frontend interface
    const transformedConversations = (conversations || []).map((conv: Record<string, unknown>) => {
      const isBuyer = conv.buyer_id === user.id
      const otherUser = (isBuyer ? conv.seller : conv.buyer) as Record<string, unknown> | null
      const listing = conv.car_listing as Record<string, unknown> | null
      const primaryImage = listing?.images as Array<Record<string, unknown>> | null
      const imageUrl = primaryImage?.find((img: Record<string, unknown>) => img.is_primary)?.image_url || primaryImage?.[0]?.image_url || null

      return {
        id: conv.id as string,
        listing_id: conv.car_listing_id as string,
        listing_title: (listing?.title as string) || null,
        listing_image: imageUrl as string | null,
        other_user_id: otherUser?.id as string,
        other_user_name: (otherUser?.name as string) || 'Unknown User',
        other_user_avatar: (otherUser?.avatar_url as string) || null,
        last_message: (conv.last_message as string) || '',
        last_message_at: (conv.last_message_at as string) || (conv.created_at as string),
        unread_count: isBuyer ? ((conv.buyer_unread as number) || 0) : ((conv.seller_unread as number) || 0),
        status: (conv.status as string) || 'active',
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
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { car_listing_id, seller_id, message } = body

    if (!car_listing_id || !seller_id) {
      return NextResponse.json(
        { success: false, error: 'car_listing_id and seller_id are required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('car_listing_id', car_listing_id)
      .eq('buyer_id', user.id)
      .eq('seller_id', seller_id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, conversation: existing })
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        car_listing_id,
        buyer_id: user.id,
        seller_id,
        status: 'active',
        buyer_unread: 0,
        seller_unread: 0,
      })
      .select(`
        id,
        car_listing_id,
        buyer_id,
        seller_id,
        status,
        car_listing:car_listings(
          id,
          title,
          images:car_images(image_url, is_primary)
        ),
        buyer:profiles!conversations_buyer_id_fkey(id, name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (createError) {
      console.error('Error creating conversation:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    // Send initial message if provided
    if (message?.trim()) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          message: message.trim(),
          is_read: false,
        })

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: message.trim(),
          last_message_at: new Date().toISOString(),
          seller_unread: 1,
        })
        .eq('id', newConversation.id)
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
