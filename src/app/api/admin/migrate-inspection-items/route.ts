import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabase = getSupabaseAdmin()

export async function GET() {
  try {
    // Check if image_url column exists
    const { data, error } = await supabase
      .from('inspection_items')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    const hasImageUrl = data && data.length > 0 && 'image_url' in data[0]
    
    return NextResponse.json({ 
      success: true, 
      has_image_url_column: hasImageUrl,
      sample_columns: data && data.length > 0 ? Object.keys(data[0]) : []
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Check failed' 
    }, { status: 500 })
  }
}
