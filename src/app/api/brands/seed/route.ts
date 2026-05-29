import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const brandsData = [
  { name: 'Toyota', slug: 'toyota', logo_url: '/brands/toyota.png' },
  { name: 'Honda', slug: 'honda', logo_url: '/brands/honda.png' },
  { name: 'BMW', slug: 'bmw', logo_url: '/brands/bmw.png' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', logo_url: '/brands/mercedes-benz.png' },
  { name: 'Hyundai', slug: 'hyundai', logo_url: '/brands/hyundai.png' },
  { name: 'Mitsubishi', slug: 'mitsubishi', logo_url: '/brands/mitsubishi.png' },
  { name: 'Suzuki', slug: 'suzuki', logo_url: '/brands/suzuki.png' },
  { name: 'Daihatsu', slug: 'daihatsu', logo_url: '/brands/daihatsu.png' },
  { name: 'Nissan', slug: 'nissan', logo_url: '/brands/nissan.png' },
  { name: 'Mazda', slug: 'mazda', logo_url: '/brands/mazda.png' },
  { name: 'Ford', slug: 'ford', logo_url: '/brands/ford.png' },
  { name: 'Wuling', slug: 'wuling', logo_url: '/brands/wuling.png' },
  { name: 'Audi', slug: 'audi', logo_url: '/brands/audi.png' },
  { name: 'Lexus', slug: 'lexus', logo_url: '/brands/lexus.png' },
  { name: 'Chery', slug: 'chery', logo_url: '/brands/chery.png' },
  { name: 'BYD', slug: 'byd', logo_url: '/brands/byd.png' },
  { name: 'Kia', slug: 'kia', logo_url: '/brands/kia.png' },
  { name: 'Volkswagen', slug: 'volkswagen', logo_url: '/brands/volkswagen.png' },
  { name: 'MINI', slug: 'mini', logo_url: '/brands/mini.png' },
  { name: 'Porsche', slug: 'porsche', logo_url: '/brands/porsche.png' },
  { name: 'Land Rover', slug: 'land-rover', logo_url: '/brands/land-rover.png' },
  { name: 'Jeep', slug: 'jeep', logo_url: '/brands/jeep.png' },
  { name: 'GAC', slug: 'gac', logo_url: '/brands/gac.png' },
  { name: 'Geely', slug: 'geely', logo_url: '/brands/geely.png' },
  { name: 'Chevrolet', slug: 'chevrolet', logo_url: '/brands/chevrolet.png' },
  { name: 'GWM', slug: 'gwm', logo_url: '/brands/gwm.svg' },
  { name: 'MG', slug: 'mg', logo_url: '/brands/mg.png' },
  { name: 'Subaru', slug: 'subaru', logo_url: '/brands/subaru.png' },
  { name: 'Isuzu', slug: 'isuzu', logo_url: '/brands/isuzu.png' },
  { name: 'Peugeot', slug: 'peugeot', logo_url: '/brands/peugeot.png' },
  { name: 'Ferrari', slug: 'ferrari', logo_url: '/brands/ferrari.png' },
  { name: 'Tesla', slug: 'tesla', logo_url: '/brands/tesla.png' },
  { name: 'Maxus', slug: 'maxus', logo_url: '/brands/maxus.png' },
  { name: 'Citroen', slug: 'citroen', logo_url: '/brands/citroen.png' },
]

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Supabase admin not configured' }, { status: 500 })
    }

    // Upsert all brands (insert or update on conflict)
    const { data, error } = await supabaseAdmin
      .from('brands')
      .upsert(brandsData, { onConflict: 'slug' })
      .select()

    if (error) {
      console.error('Error upserting brands:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, brands: data, count: data?.length })
  } catch (error) {
    console.error('Error seeding brands:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed brands' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed brands',
    endpoint: '/api/brands/seed'
  })
}
