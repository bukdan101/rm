import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    const search = searchParams.get('search')
    const cityId = searchParams.get('city_id')
    const verified = searchParams.get('verified')

    let query = supabase
      .from('dealers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (cityId) {
      query = query.eq('city_id', cityId)
    }
    
    if (verified === 'true') {
      query = query.eq('verified', true)
    }

    query = query
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching dealers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealers' },
      { status: 500 }
    )
  }
}
