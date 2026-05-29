import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return errorResponse('Car IDs required', 400)
    }

    const carIds = ids.split(',').filter(Boolean)

    if (carIds.length === 0 || carIds.length > 4) {
      return errorResponse('Please provide 1-4 car IDs', 400)
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
        .in('listing_id', listingIds)
      
      const dataWithInspections = data.map(listing => ({
        ...listing,
        inspection: inspections?.find(i => i.listing_id === listing.id) || null
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
    return errorResponse('Failed to fetch comparison data', 500)
  }
}
