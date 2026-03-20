import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
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

    // Build query - fetch activity logs
    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString())
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      query = query.lte('created_at', toDate.toISOString())
    }

    if (search) {
      query = query.ilike('description', `%${search}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: logs, count, error } = await query

    if (error) {
      console.error('Error fetching activity logs:', error)
      throw error
    }

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
    const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))]

    // Fetch profiles for user names
    let profilesMap = new Map<string, { full_name: string | null; email: string | null }>()
    
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (!profileError && profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, {
            full_name: profile.full_name,
            email: profile.email,
          })
        })
      }
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
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
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
