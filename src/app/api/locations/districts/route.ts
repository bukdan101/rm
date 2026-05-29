import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('city_id')

    let query = supabase
      .from('districts')
      .select('id, city_id, name, code')
      .eq('is_active', true)
      .order('name')

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    const { data, error } = await query

    if (error) throw error

    // If no data in database, return empty for now
    // In production, you would seed this data from idn-area-data
    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch districts',
    }, { status: 500 })
  }
}
