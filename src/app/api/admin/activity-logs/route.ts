import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || ''
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (action && action !== 'all') {
      where.action = { contains: action }
    }

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error in admin activity logs API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, action, entity_type, entity_id, description, metadata, ip_address, user_agent } = body

    const log = await db.activityLog.create({
      data: {
        user_id: user_id || null,
        action,
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        description: description || null,
        // metadata is String? in schema - must JSON.stringify if object
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
      },
    })

    return NextResponse.json({ success: true, data: log })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
