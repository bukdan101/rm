import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: brands } = await supabaseAdmin.from('brands').select('id').limit(1)
    const { data: models } = await supabaseAdmin.from('car_models').select('id').limit(1)

    if (!brands?.length || !models?.length) {
      return NextResponse.json({ error: 'Need brands and models first' }, { status: 400 })
    }

    const listing = {
      brand_id: brands[0].id,
      model_id: models[0].id,
      status: 'active'
    }

    const { data, error } = await supabaseAdmin
      .from('car_listings')
      .insert([listing])
      .select()

    if (error) {
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
