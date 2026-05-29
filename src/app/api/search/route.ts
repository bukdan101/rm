import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return successResponse({ data: { brands: [], models: [], listings: [] } })
    }

    // Search brands
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .limit(5)

    // Search models
    const { data: models } = await supabase
      .from('car_models')
      .select(`
        id,
        name,
        brand:brands(id, name)
      `)
      .ilike('name', `%${q}%`)
      .limit(5)

    // Search listings
    const { data: listings } = await supabase
      .from('car_listings')
      .select(`
        id,
        year,
        price,
        location_city,
        vehicle_condition,
        brand:brands(name),
        model:car_models(name),
        images:car_images(image_url, is_primary)
      `)
      .or(`title.ilike.%${q}%,location_city.ilike.%${q}%`)
      .eq('status', 'active')
      .limit(5)

    return successResponse({
      data: {
        brands: brands || [],
        models: models || [],
        listings: listings || []
      }
    })
  } catch (error) {
    console.error('Error searching:', error)
    return errorResponse('Failed to search', 500)
  }
}
