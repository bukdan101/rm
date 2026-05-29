import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('inspection_items')
      .select('*')
      .order('display_order')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    // Group by category
    const grouped: Record<string, typeof data> = {}
    for (const item of data) {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    }

    return NextResponse.json({
      success: true,
      data,
      grouped
    })
  } catch (error) {
    console.error('Error fetching inspection items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection items' },
      { status: 500 }
    )
  }
}
