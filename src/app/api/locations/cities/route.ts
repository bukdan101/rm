import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('province_id')

    let query = supabase
      .from('cities')
      .select('id, province_id, name, type')
      .eq('is_active', true)
      .order('name')

    if (provinceId) {
      query = query.eq('province_id', provinceId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cities',
    }, { status: 500 })
  }
}
