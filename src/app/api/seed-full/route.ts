import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const results: string[] = []
    const errors: string[] = []

    // Check if brands already exist
    const { count: brandCount } = await supabaseAdmin
      .from('brands')
      .select('*', { count: 'exact', head: true })

    if (brandCount && brandCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Data already seeded',
        brandCount
      })
    }

    // 1. Seed Countries
    await supabaseAdmin.from('countries').insert([
      { id: 'country-id', code: 'ID', name: 'Indonesia', phone_code: '+62', currency_code: 'IDR', currency_name: 'Rupiah', is_active: true }
    ]).then(({ error }) => error ? errors.push('Countries: ' + error.message) : results.push('✓ Countries (1)'))

    // 2. Seed Provinces
    await supabaseAdmin.from('provinces').insert([
      { id: 'prov-01', country_id: 'country-id', code: 'DKI', name: 'DKI Jakarta', is_active: true },
      { id: 'prov-02', country_id: 'country-id', code: 'JBR', name: 'Jawa Barat', is_active: true },
      { id: 'prov-03', country_id: 'country-id', code: 'JTG', name: 'Jawa Tengah', is_active: true },
      { id: 'prov-04', country_id: 'country-id', code: 'JTM', name: 'Jawa Timur', is_active: true },
      { id: 'prov-05', country_id: 'country-id', code: 'BNT', name: 'Banten', is_active: true }
    ]).then(({ error }) => error ? errors.push('Provinces: ' + error.message) : results.push('✓ Provinces (5)'))

    // 3. Seed Cities
    await supabaseAdmin.from('cities').insert([
      { id: 'city-001', province_id: 'prov-01', name: 'Jakarta Selatan', type: 'kota', is_active: true },
      { id: 'city-002', province_id: 'prov-01', name: 'Jakarta Pusat', type: 'kota', is_active: true },
      { id: 'city-003', province_id: 'prov-02', name: 'Bandung', type: 'kota', is_active: true },
      { id: 'city-004', province_id: 'prov-03', name: 'Semarang', type: 'kota', is_active: true },
      { id: 'city-005', province_id: 'prov-04', name: 'Surabaya', type: 'kota', is_active: true },
      { id: 'city-006', province_id: 'prov-05', name: 'Tangerang', type: 'kota', is_active: true }
    ]).then(({ error }) => error ? errors.push('Cities: ' + error.message) : results.push('✓ Cities (6)'))

    // 4. Seed Brands
    await supabaseAdmin.from('brands').insert([
      { id: 'brand-001', name: 'Toyota', slug: 'toyota', country: 'Japan', is_popular: true, display_order: 1 },
      { id: 'brand-002', name: 'Honda', slug: 'honda', country: 'Japan', is_popular: true, display_order: 2 },
      { id: 'brand-003', name: 'Mitsubishi', slug: 'mitsubishi', country: 'Japan', is_popular: true, display_order: 3 },
      { id: 'brand-004', name: 'Suzuki', slug: 'suzuki', country: 'Japan', is_popular: true, display_order: 4 },
      { id: 'brand-005', name: 'Daihatsu', slug: 'daihatsu', country: 'Japan', is_popular: true, display_order: 5 },
      { id: 'brand-006', name: 'BMW', slug: 'bmw', country: 'Germany', is_popular: true, display_order: 6 }
    ]).then(({ error }) => error ? errors.push('Brands: ' + error.message) : results.push('✓ Brands (6)'))

    // 5. Seed Car Models
    await supabaseAdmin.from('car_models').insert([
      { id: 'model-001', brand_id: 'brand-001', name: 'Avanza', slug: 'avanza', body_type: 'mpv', is_popular: true, display_order: 1 },
      { id: 'model-002', brand_id: 'brand-001', name: 'Innova', slug: 'innova', body_type: 'mpv', is_popular: true, display_order: 2 },
      { id: 'model-003', brand_id: 'brand-001', name: 'Fortuner', slug: 'fortuner', body_type: 'suv', is_popular: true, display_order: 3 },
      { id: 'model-004', brand_id: 'brand-002', name: 'Jazz', slug: 'jazz', body_type: 'hatchback', is_popular: true, display_order: 1 },
      { id: 'model-005', brand_id: 'brand-002', name: 'CR-V', slug: 'cr-v', body_type: 'suv', is_popular: true, display_order: 2 },
      { id: 'model-006', brand_id: 'brand-003', name: 'Xpander', slug: 'xpander', body_type: 'mpv', is_popular: true, display_order: 1 }
    ]).then(({ error }) => error ? errors.push('Car Models: ' + error.message) : results.push('✓ Car Models (6)'))

    // 6. Seed Car Variants
    await supabaseAdmin.from('car_variants').insert([
      { id: 'variant-001', model_id: 'model-001', name: '1.3 E MT', engine_capacity: 1298, transmission: 'manual', fuel_type: 'bensin', seat_count: 7, price_new: 215000000 },
      { id: 'variant-002', model_id: 'model-001', name: '1.5 G CVT', engine_capacity: 1496, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 260000000 },
      { id: 'variant-003', model_id: 'model-002', name: '2.0 V AT', engine_capacity: 1998, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 375000000 },
      { id: 'variant-004', model_id: 'model-003', name: '2.8 GR-S AT', engine_capacity: 2755, transmission: 'automatic', fuel_type: 'diesel', seat_count: 7, price_new: 620000000 },
      { id: 'variant-005', model_id: 'model-005', name: '1.5 Turbo CVT', engine_capacity: 1498, transmission: 'automatic', fuel_type: 'bensin', seat_count: 5, price_new: 520000000 },
      { id: 'variant-006', model_id: 'model-006', name: 'Exceed AT', engine_capacity: 1499, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 320000000 }
    ]).then(({ error }) => error ? errors.push('Car Variants: ' + error.message) : results.push('✓ Car Variants (6)'))

    // 7. Seed Car Colors
    await supabaseAdmin.from('car_colors').insert([
      { id: 'color-001', name: 'Putih', hex_code: '#FFFFFF', is_metallic: false, is_popular: true },
      { id: 'color-002', name: 'Hitam', hex_code: '#000000', is_metallic: false, is_popular: true },
      { id: 'color-003', name: 'Silver', hex_code: '#C0C0C0', is_metallic: true, is_popular: true },
      { id: 'color-004', name: 'Abu-abu', hex_code: '#808080', is_metallic: true, is_popular: true },
      { id: 'color-005', name: 'Merah', hex_code: '#FF0000', is_metallic: false, is_popular: true }
    ]).then(({ error }) => error ? errors.push('Car Colors: ' + error.message) : results.push('✓ Car Colors (5)'))

    // 8. Seed Inspection Categories
    await supabaseAdmin.from('inspection_categories').insert([
      { id: 'cat-001', name: 'Eksterior', description: 'Pemeriksaan eksterior', icon: 'car', display_order: 1, total_items: 20 },
      { id: 'cat-002', name: 'Interior', description: 'Pemeriksaan interior', icon: 'seat', display_order: 2, total_items: 20 },
      { id: 'cat-003', name: 'Mesin', description: 'Pemeriksaan mesin', icon: 'engine', display_order: 3, total_items: 25 },
      { id: 'cat-004', name: 'Rem', description: 'Pemeriksaan rem', icon: 'disc', display_order: 4, total_items: 10 },
      { id: 'cat-005', name: 'Dokumen', description: 'Verifikasi dokumen', icon: 'file', display_order: 5, total_items: 8 }
    ]).then(({ error }) => error ? errors.push('Inspection Categories: ' + error.message) : results.push('✓ Inspection Categories (5)'))

    // 9. Seed Inspection Items
    await supabaseAdmin.from('inspection_items').insert([
      { category_id: 'cat-001', name: 'Cat Body', description: 'Kondisi cat', display_order: 1, is_critical: true },
      { category_id: 'cat-001', name: 'Kaca Depan', description: 'Kondisi kaca', display_order: 2, is_critical: true },
      { category_id: 'cat-002', name: 'AC', description: 'Fungsi AC', display_order: 1, is_critical: true },
      { category_id: 'cat-003', name: 'Mesin Start', description: 'Starter mesin', display_order: 1, is_critical: true },
      { category_id: 'cat-004', name: 'Rem Depan', description: 'Rem depan', display_order: 1, is_critical: true },
      { category_id: 'cat-005', name: 'STNK', description: 'STNK', display_order: 1, is_critical: true }
    ]).then(({ error }) => error ? errors.push('Inspection Items: ' + error.message) : results.push('✓ Inspection Items (6)'))

    return NextResponse.json({
      success: true,
      message: 'Master data seeded!',
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
