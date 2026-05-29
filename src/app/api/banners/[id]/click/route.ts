import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/banners/[id]/click - Track banner click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get current click count
    const { data: banner, error: fetchError } = await supabase
      .from('banners')
      .select('clicks')
      .eq('id', id)
      .single()
    
    if (fetchError || !banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 })
    }
    
    // Increment click count
    const { error: updateError } = await supabase
      .from('banners')
      .update({ 
        clicks: (banner.clicks || 0) + 1 
      })
      .eq('id', id)
    
    if (updateError) throw updateError
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ success: false, error: 'Failed to track click' }, { status: 500 })
  }
}
