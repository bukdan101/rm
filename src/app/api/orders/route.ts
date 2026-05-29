import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ orders: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'buyer' or 'seller'

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_id,
        seller_id,
        car_listing_id,
        agreed_price,
        platform_fee,
        total_amount,
        status,
        created_at,
        updated_at,
        confirmed_at,
        completed_at,
        car_listings (
          id,
          title,
          slug,
          price_cash,
          car_images (
            image_url,
            is_primary
          )
        ),
        profiles!orders_buyer_id_fkey (
          id,
          name,
          email
        ),
        seller:profiles!orders_seller_id_fkey (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by buyer or seller
    if (type === 'buyer') {
      query = query.eq('buyer_id', user.id)
    } else if (type === 'seller') {
      query = query.eq('seller_id', user.id)
    } else {
      // Show both buyer and seller orders
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ orders: [] })
    }

    // Transform data for frontend
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount || order.agreed_price,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      confirmedAt: order.confirmed_at,
      completedAt: order.completed_at,
      listing: order.car_listings ? {
        id: order.car_listings.id,
        title: order.car_listings.title,
        slug: order.car_listings.slug,
        price: order.car_listings.price_cash,
        image: order.car_listings.car_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url ||
               order.car_listings.car_images?.[0]?.image_url,
      } : null,
      buyer: order.profiles,
      seller: order.seller,
      isBuyer: order.buyer_id === user.id,
    }))

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ orders: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, sellerId, agreedPrice, notes } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: user.id,
        seller_id: sellerId,
        car_listing_id: listingId,
        agreed_price: agreedPrice,
        total_amount: agreedPrice,
        status: 'pending',
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create notification for seller
    await supabase
      .from('notifications')
      .insert({
        user_id: sellerId,
        type: 'order',
        title: 'Pesanan Baru',
        message: `Anda memiliki pesanan baru #${orderNumber}`,
        action_url: `/dashboard/orders/${order.id}`,
        data: { order_id: order.id, order_number: orderNumber },
      })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status, notes } = body

    // Verify user is involved in this order
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id')
      .eq('id', orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order
    const updateData: Record<string, unknown> = { status }
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    if (notes) {
      updateData.notes = notes
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
