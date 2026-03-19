import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const results: string[] = []
    
    // Check brands count
    const { count: existingBrands } = await supabaseAdmin
      .from('brands')
      .select('*', { count: 'exact', head: true })
    
    if (existingBrands && existingBrands > 0) {
      return NextResponse.json({
        success: true,
        message: 'Already seeded',
        brands: existingBrands
      })
    }

    // Insert brands without specifying columns that might not exist
    const brands = [
      { name: 'Toyota' },
      { name: 'Honda' },
      { name: 'Mitsubishi' },
      { name: 'Suzuki' },
      { name: 'Daihatsu' },
    ]
    const { data: insertedBrands, error: brandErr } = await supabaseAdmin
      .from('brands')
      .insert(brands)
      .select()
    if (brandErr) results.push('Brands err: ' + brandErr.message)
    else results.push('Brands: ' + insertedBrands?.length)

    // Insert car models
    if (insertedBrands && insertedBrands.length > 0) {
      const models = [
        { brand_id: insertedBrands[0].id, name: 'Avanza' },
        { brand_id: insertedBrands[0].id, name: 'Innova' },
        { brand_id: insertedBrands[0].id, name: 'Fortuner' },
        { brand_id: insertedBrands[1].id, name: 'Jazz' },
        { brand_id: insertedBrands[1].id, name: 'CR-V' },
        { brand_id: insertedBrands[2].id, name: 'Xpander' },
      ]
      const { data: insertedModels, error: modelErr } = await supabaseAdmin
        .from('car_models')
        .insert(models)
        .select()
      if (modelErr) results.push('Models err: ' + modelErr.message)
      else results.push('Models: ' + insertedModels?.length)

      // Insert car colors
      const colors = [
        { name: 'Putih', hex_code: '#FFFFFF' },
        { name: 'Hitam', hex_code: '#000000' },
        { name: 'Silver', hex_code: '#C0C0C0' },
      ]
      const { data: insertedColors, error: colorErr } = await supabaseAdmin
        .from('car_colors')
        .insert(colors)
        .select()
      if (colorErr) results.push('Colors err: ' + colorErr.message)
      else results.push('Colors: ' + insertedColors?.length)

      // Insert listings
      if (insertedModels && insertedModels.length > 0 && insertedColors && insertedColors.length > 0) {
        const listings = [
          { 
            brand_id: insertedBrands[0].id, 
            model_id: insertedModels[0].id,
            title: 'Toyota Avanza 2022',
            price_cash: 225000000,
            year: 2022,
            status: 'active'
          },
          { 
            brand_id: insertedBrands[1].id, 
            model_id: insertedModels[3].id,
            title: 'Honda CR-V 2021',
            price_cash: 490000000,
            year: 2021,
            status: 'active'
          },
        ]
        const { data: insertedListings, error: listErr } = await supabaseAdmin
          .from('car_listings')
          .insert(listings)
          .select()
        if (listErr) results.push('Listings err: ' + listErr.message)
        else results.push('Listings: ' + insertedListings?.length)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
