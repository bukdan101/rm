import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { brands: [], models: [], listings: [] } })
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
        price_cash,
        city,
        condition,
        brand:brands(name),
        model:car_models(name),
        images:car_images(image_url, is_primary)
      `)
      .or(`description.ilike.%${q}%,city.ilike.%${q}%`)
      .eq('status', 'available')
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        brands: brands || [],
        models: models || [],
        listings: listings || []
      }
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    )
  }
}
