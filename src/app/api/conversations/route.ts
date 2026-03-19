import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const carListingId = searchParams.get('car_listing_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('conversations')
      .select(`
        *,
        car_listing:car_listings(
          id,
          title,
          price_cash,
          slug,
          brand:brands(name),
          model:car_models(name),
          images:car_images(image_url, is_primary)
        ),
        buyer:profiles!conversations_buyer_id_fkey(id, name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, name, avatar_url),
        last_message:message(
          id,
          message,
          created_at,
          sender_id
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })

    if (carListingId) {
      query = query.eq('car_listing_id', carListingId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate total unread
    const totalUnread = data?.reduce((acc, conv) => {
      if (conv.buyer_id === userId) {
        return acc + (conv.buyer_unread || 0)
      } else {
        return acc + (conv.seller_unread || 0)
      }
    }, 0) || 0

    return NextResponse.json({
      success: true,
      data,
      total_unread: totalUnread
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('car_listing_id', body.car_listing_id)
      .eq('buyer_id', body.buyer_id)
      .eq('seller_id', body.seller_id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, data: existing })
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        car_listing_id: body.car_listing_id,
        buyer_id: body.buyer_id,
        seller_id: body.seller_id,
        status: 'active'
      })
      .select(`
        *,
        car_listing:car_listings(
          id,
          title,
          price_cash,
          brand:brands(name),
          model:car_models(name),
          images:car_images(image_url, is_primary)
        ),
        buyer:profiles!conversations_buyer_id_fkey(id, name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Send initial message if provided
    if (body.message) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.id,
          sender_id: body.buyer_id,
          message: body.message,
          message_type: 'text'
        })

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: body.message,
          last_message_at: new Date().toISOString(),
          last_message_by: body.buyer_id,
          seller_unread: 1
        })
        .eq('id', data.id)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
