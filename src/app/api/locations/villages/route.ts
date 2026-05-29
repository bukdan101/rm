import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const districtId = searchParams.get('district_id')

    let query = supabase
      .from('villages')
      .select('id, district_id, name, postal_code')
      .eq('is_active', true)
      .order('name')

    if (districtId) {
      query = query.eq('district_id', districtId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch villages',
    }, { status: 500 })
  }
}
