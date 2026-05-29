import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment view count
    const { error } = await supabase.rpc('increment_view_count', { listing_id: id })

    // If RPC doesn't exist, use direct update
    if (error) {
      // Get current view count
      const { data: listing } = await supabase
        .from('car_listings')
        .select('view_count')
        .eq('id', id)
        .single()

      if (listing) {
        await supabase
          .from('car_listings')
          .update({ view_count: (listing.view_count || 0) + 1 })
          .eq('id', id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json({ success: true }) // Don't fail silently
  }
}
