import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { success: false, error: 'Car IDs required' },
        { status: 400 }
      )
    }

    const carIds = ids.split(',').filter(Boolean)

    if (carIds.length === 0 || carIds.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Please provide 1-4 car IDs' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('car_listings')
      .select(`
        *,
        brand:brands(*),
        model:car_models(*),
        variant:car_variants(*),
        exterior_color:car_colors(*),
        images:car_images(*),
        features:car_features(*),
        rental_prices:car_rental_prices(*)
      `)
      .in('id', carIds)

    if (error) throw error

    // Get inspection data separately
    if (data && data.length > 0) {
      const listingIds = data.map(l => l.id)
      const { data: inspections } = await supabase
        .from('car_inspections')
        .select('*')
        .in('car_listing_id', listingIds)
      
      const dataWithInspections = data.map(listing => ({
        ...listing,
        inspection: inspections?.find(i => i.car_listing_id === listing.id) || null
      }))
      
      return NextResponse.json({
        success: true,
        data: dataWithInspections
      })
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching compare data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comparison data' },
      { status: 500 }
    )
  }
}
