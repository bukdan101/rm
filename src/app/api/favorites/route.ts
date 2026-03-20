import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      // Return empty if no user - demo mode
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const { data, error } = await supabase
      .from('car_favorites')
      .select(`
        *,
        listing:car_listings(
          *,
          brand:brands(*),
          model:car_models(*),
          images:car_images(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, car_listing_id, notes } = body

    const { data, error } = await supabase
      .from('car_favorites')
      .insert({
        user_id,
        car_listing_id,
        notes
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Already in favorites' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const listingId = searchParams.get('listing_id')

    if (!userId || !listingId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Listing ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('car_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('car_listing_id', listingId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
