import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/banners - Fetch banners by position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    
    // Build query - select only columns that exist
    let query = supabase
      .from('banners')
      .select('id, title, image_url, target_url, position, impressions, clicks, created_at')
      .order('created_at', { ascending: false })
    
    // Filter by position if provided
    if (position) {
      query = query.eq('position', position)
    }
    
    const { data, error } = await query
    
    if (error) {
      // If table doesn't exist or other error, return empty array
      console.error('Error fetching banners:', error)
      return NextResponse.json({
        success: true,
        banners: []
      })
    }
    
    // Increment impressions for banners when position is specified
    if (position && data && data.length > 0) {
      const randomBanner = data[Math.floor(Math.random() * data.length)]
      
      // Increment impression (fire and forget)
      supabase
        .from('banners')
        .update({ 
          impressions: (randomBanner.impressions || 0) + 1 
        })
        .eq('id', randomBanner.id)
        .then(() => {})
        .catch(() => {})
    }
    
    return NextResponse.json({
      success: true,
      banners: data || []
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({
      success: true,
      banners: []
    })
  }
}

// POST /api/banners - Create new banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('banners')
      .insert({
        title: body.title,
        image_url: body.imageUrl,
        target_url: body.targetUrl,
        position: body.position,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      banner: data
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
