import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Filter params
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (action) {
      where.action = action
    }

    if (dateFrom) {
      where.created_at = { ...((where.created_at as Record<string, unknown>) || {}), gte: new Date(dateFrom) }
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      where.created_at = { ...((where.created_at as Record<string, unknown>) || {}), lte: toDate }
    }

    if (search) {
      where.description = { contains: search }
    }

    // Fetch activity logs with count
    const [logs, count] = await Promise.all([
      db.activityLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ])

    // If no logs, return empty result
    if (!logs || logs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // Get unique user IDs to fetch profiles
    const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))] as string[]

    // Fetch profiles for user names
    let profilesMap = new Map<string, { full_name: string | null; email: string | null }>()

    if (userIds.length > 0) {
      const profiles = await db.profile.findMany({
        where: { id: { in: userIds } },
        select: { id: true, full_name: true, email: true },
      })

      profiles.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          email: profile.email,
        })
      })
    }

    // Enrich logs with user data
    const enrichedLogs = logs.map(log => {
      const userProfile = log.user_id ? profilesMap.get(log.user_id) : null
      return {
        ...log,
        user_name: userProfile?.full_name || null,
        user_email: userProfile?.email || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedLogs,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error('Error in admin activity API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
