import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('provinces')
      .select('id, code, name')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch provinces',
    }, { status: 500 })
  }
}
