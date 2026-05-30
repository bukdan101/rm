import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ orders: [] })
    }

    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'buyer' or 'seller'

    const where: Record<string, unknown> = {}

    // Filter by buyer or seller
    if (type === 'buyer') {
      where.buyer_id = userId
    } else if (type === 'seller') {
      where.seller_id = userId
    } else {
      where.OR = [{ buyer_id: userId }, { seller_id: userId }]
    }

    if (status) {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            price_cash: true,
            images: {
              select: { image_url: true, is_primary: true },
              orderBy: { display_order: 'asc' },
            },
          },
        },
        buyer: {
          select: { id: true, full_name: true, email: true },
        },
        seller: {
          select: { id: true, full_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    // Transform data for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount || order.agreed_price,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      confirmedAt: order.confirmed_at,
      completedAt: order.completed_at,
      listing: order.listing
        ? {
            id: order.listing.id,
            title: order.listing.title,
            slug: order.listing.slug,
            price: order.listing.price_cash,
            image: order.listing.images?.find(img => img.is_primary)?.image_url ||
              order.listing.images?.[0]?.image_url,
          }
        : null,
      buyer: order.buyer
        ? { ...order.buyer, name: order.buyer.full_name || 'Unknown' }
        : null,
      seller: order.seller
        ? { ...order.seller, name: order.seller.full_name || 'Unknown' }
        : null,
      isBuyer: order.buyer_id === userId,
    }))

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ orders: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { listingId, sellerId, agreedPrice, notes, buyerId } = body

    if (!buyerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await db.order.create({
      data: {
        order_number: orderNumber,
        buyer_id: buyerId,
        seller_id: sellerId,
        car_listing_id: listingId,
        agreed_price: agreedPrice,
        total_amount: agreedPrice,
        status: 'pending',
        notes,
      },
    })

    // Create notification for seller
    if (sellerId) {
      await db.notification.create({
        data: {
          user_id: sellerId,
          type: 'order',
          title: 'Pesanan Baru',
          message: `Anda memiliki pesanan baru #${orderNumber}`,
          action_url: `/dashboard/orders/${order.id}`,
          data: JSON.stringify({ order_id: order.id, order_number: orderNumber }),
        },
      })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status, notes, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is involved in this order
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyer_id: true, seller_id: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order
    const updateData: Record<string, unknown> = { status }

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date()
    } else if (status === 'completed') {
      updateData.completed_at = new Date()
    }

    if (notes) {
      updateData.notes = notes
    }

    await db.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
