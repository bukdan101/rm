import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check connection
    const { error: connectionError } = await supabase
      .from('brands')
      .select('id')
      .limit(1)

    if (connectionError && !connectionError.message.includes('does not exist')) {
      return NextResponse.json({
        connected: false,
        brands: 0,
        models: 0,
        listings: 0,
        images: 0,
        provinces: 0,
        cities: 0,
        error: connectionError.message
      })
    }

    // Get counts
    const { count: brands } = await supabase.from('brands').select('*', { count: 'exact', head: true })
    const { count: models } = await supabase.from('car_models').select('*', { count: 'exact', head: true })
    const { count: listings } = await supabase.from('car_listings').select('*', { count: 'exact', head: true })
    const { count: images } = await supabase.from('car_images').select('*', { count: 'exact', head: true })
    const { count: provinces } = await supabase.from('provinces').select('*', { count: 'exact', head: true })
    const { count: cities } = await supabase.from('cities').select('*', { count: 'exact', head: true })

    return NextResponse.json({
      connected: true,
      brands: brands || 0,
      models: models || 0,
      listings: listings || 0,
      images: images || 0,
      provinces: provinces || 0,
      cities: cities || 0,
      error: null
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      brands: 0,
      models: 0,
      listings: 0,
      images: 0,
      provinces: 0,
      cities: 0,
      error: String(error)
    })
  }
}
