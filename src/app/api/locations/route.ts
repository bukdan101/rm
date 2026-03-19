import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (type === 'provinces') {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    if (type === 'cities') {
      const provinceId = searchParams.get('province_id')
      
      let query = supabase
        .from('cities')
        .select(`
          *,
          province:provinces(id, name)
        `)
        .eq('is_active', true)
        .order('name')

      if (provinceId) {
        query = query.eq('province_id', provinceId)
      }

      const { data, error } = await query

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    if (type === 'districts') {
      const cityId = searchParams.get('city_id')
      
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    // Return all locations grouped by province
    const { data: provinces, error: provincesError } = await supabase
      .from('provinces')
      .select(`
        *,
        cities:cities(id, name, type, latitude, longitude)
      `)
      .eq('is_active', true)
      .order('name')

    if (provincesError) throw provincesError

    return NextResponse.json({ success: true, data: provinces })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
