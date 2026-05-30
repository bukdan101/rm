import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: { messages: true },
      }),
      db.supportTicket.count({ where }),
    ])

    // Fetch user profiles
    const userIds = [...new Set(tickets.map(t => t.user_id).filter(Boolean))] as string[]
    const profiles = await db.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true, email: true },
    })

    const profilesMap = new Map(profiles.map(p => [p.id, p]))

    const enrichedTickets = tickets.map(t => ({
      ...t,
      user: profilesMap.get(t.user_id || '') || null,
    }))

    return NextResponse.json({
      success: true,
      data: enrichedTickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error in admin tickets API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_id, message, sender_id } = body

    if (!ticket_id || !message) {
      return NextResponse.json({ success: false, error: 'Ticket ID and message required' }, { status: 400 })
    }

    // Create message using SupportTicketMessage model
    const ticketMessage = await db.supportTicketMessage.create({
      data: {
        ticket_id,
        sender_id: sender_id || null,
        message,
        is_internal: true, // Admin messages are internal
      },
    })

    // Update ticket status
    await db.supportTicket.update({
      where: { id: ticket_id },
      data: {
        status: 'in_progress',
      },
    })

    return NextResponse.json({ success: true, data: ticketMessage })
  } catch (error) {
    console.error('Error in admin tickets POST:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, assigned_to, resolution } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    if (assigned_to) updateData.assigned_to = assigned_to
    if (resolution) updateData.resolution = resolution
    if (status === 'closed') updateData.closed_at = new Date()

    const ticket = await db.supportTicket.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: ticket })
  } catch (error) {
    console.error('Error in admin tickets PATCH:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
