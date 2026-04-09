import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('car_colors')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colors' },
      { status: 500 }
    )
  }
}
