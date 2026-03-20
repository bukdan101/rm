import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const results: string[] = []

    // Check if data already exists
    const { count: brandCount } = await supabaseAdmin
      .from('brands')
      .select('*', { count: 'exact', head: true })

    if (brandCount && brandCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already has data',
        counts: { brands: brandCount }
      })
    }

    // Seed Provinces
    const { error: provinceError } = await supabaseAdmin.from('provinces').insert([
      { id: '11111111-1111-1111-1111-111111111001', name: 'DKI Jakarta', code: 'DKI', is_active: true },
      { id: '11111111-1111-1111-1111-111111111002', name: 'Jawa Barat', code: 'JBR', is_active: true },
      { id: '11111111-1111-1111-1111-111111111003', name: 'Jawa Tengah', code: 'JTG', is_active: true },
      { id: '11111111-1111-1111-1111-111111111004', name: 'Jawa Timur', code: 'JTM', is_active: true },
      { id: '11111111-1111-1111-1111-111111111005', name: 'Banten', code: 'BNT', is_active: true },
    ])
    if (provinceError) {
      results.push(`✗ Provinces error: ${provinceError.message}`)
    } else {
      results.push('✓ Provinces inserted')
    }

    // Seed Cities
    const { error: cityError } = await supabaseAdmin.from('cities').insert([
      { id: '22222222-2222-2222-2222-222222222001', province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Selatan', type: 'kota', is_active: true },
      { id: '22222222-2222-2222-2222-222222222002', province_id: '11111111-1111-1111-1111-111111111001', name: 'Jakarta Pusat', type: 'kota', is_active: true },
      { id: '22222222-2222-2222-2222-222222222005', province_id: '11111111-1111-1111-1111-111111111002', name: 'Bandung', type: 'kota', is_active: true },
      { id: '22222222-2222-2222-2222-222222222011', province_id: '11111111-1111-1111-1111-111111111004', name: 'Surabaya', type: 'kota', is_active: true },
    ])
    if (!cityError) results.push('✓ Cities inserted')

    // Seed Brands
    const { error: brandError } = await supabaseAdmin.from('brands').insert([
      { id: '33333333-3333-3333-3333-333333333001', name: 'Toyota', slug: 'toyota', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Toyota_logo_2019-10-09.svg/100px-Toyota_logo_2019-10-09.svg.png', country: 'Japan', is_popular: true, display_order: 1 },
      { id: '33333333-3333-3333-3333-333333333002', name: 'Honda', slug: 'honda', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo_2016.svg/100px-Honda_logo_2016.svg.png', country: 'Japan', is_popular: true, display_order: 2 },
      { id: '33333333-3333-3333-3333-333333333003', name: 'Mitsubishi', slug: 'mitsubishi', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mitsubishi_logo.svg/100px-Mitsubishi_logo.svg.png', country: 'Japan', is_popular: true, display_order: 3 },
      { id: '33333333-3333-3333-3333-333333333004', name: 'Suzuki', slug: 'suzuki', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Suzuki_logo_2.svg/100px-Suzuki_logo_2.svg.png', country: 'Japan', is_popular: true, display_order: 4 },
    ])
    if (!brandError) results.push('✓ Brands inserted')

    // Seed Car Models
    const { error: modelError } = await supabaseAdmin.from('car_models').insert([
      { id: '44444444-4444-4444-4444-444444444001', brand_id: '33333333-3333-3333-3333-333333333001', name: 'Avanza', slug: 'avanza', body_type: 'mpv', is_popular: true, display_order: 1 },
      { id: '44444444-4444-4444-4444-444444444002', brand_id: '33333333-3333-3333-3333-333333333001', name: 'Innova', slug: 'innova', body_type: 'mpv', is_popular: true, display_order: 2 },
      { id: '44444444-4444-4444-4444-444444444003', brand_id: '33333333-3333-3333-3333-333333333001', name: 'Fortuner', slug: 'fortuner', body_type: 'suv', is_popular: true, display_order: 3 },
      { id: '44444444-4444-4444-4444-444444444011', brand_id: '33333333-3333-3333-3333-333333333002', name: 'CR-V', slug: 'cr-v', body_type: 'suv', is_popular: true, display_order: 1 },
      { id: '44444444-4444-4444-4444-444444444012', brand_id: '33333333-3333-3333-3333-333333333002', name: 'HR-V', slug: 'hr-v', body_type: 'suv', is_popular: true, display_order: 2 },
      { id: '44444444-4444-4444-4444-444444444016', brand_id: '33333333-3333-3333-3333-333333333003', name: 'Xpander', slug: 'xpander', body_type: 'mpv', is_popular: true, display_order: 1 },
    ])
    if (!modelError) results.push('✓ Car Models inserted')

    // Seed Car Variants
    const { error: variantError } = await supabaseAdmin.from('car_variants').insert([
      { id: '55555555-5555-5555-5555-555555555002', model_id: '44444444-4444-4444-4444-444444444001', name: '1.3 E CVT', engine_capacity: 1.3, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 230000000 },
      { id: '55555555-5555-5555-5555-555555555006', model_id: '44444444-4444-4444-4444-444444444002', name: '2.0 V AT', engine_capacity: 2.0, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 375000000 },
      { id: '55555555-5555-5555-5555-555555555009', model_id: '44444444-4444-4444-4444-444444444003', name: '2.8 GR-S AT', engine_capacity: 2.8, transmission: 'automatic', fuel_type: 'diesel', seat_count: 7, price_new: 620000000 },
      { id: '55555555-5555-5555-5555-555555555012', model_id: '44444444-4444-4444-4444-444444444011', name: '1.5 Turbo CVT', engine_capacity: 1.5, transmission: 'automatic', fuel_type: 'bensin', seat_count: 5, price_new: 520000000 },
      { id: '55555555-5555-5555-5555-555555555014', model_id: '44444444-4444-4444-4444-444444444012', name: '1.5 S CVT', engine_capacity: 1.5, transmission: 'automatic', fuel_type: 'bensin', seat_count: 5, price_new: 380000000 },
      { id: '55555555-5555-5555-5555-555555555016', model_id: '44444444-4444-4444-4444-444444444016', name: 'Exceed AT', engine_capacity: 1.5, transmission: 'automatic', fuel_type: 'bensin', seat_count: 7, price_new: 320000000 },
    ])
    if (!variantError) results.push('✓ Car Variants inserted')

    // Seed Car Colors
    const { error: colorError } = await supabaseAdmin.from('car_colors').insert([
      { id: '66666666-6666-6666-6666-666666666001', name: 'Putih', hex_code: '#FFFFFF', is_metallic: false, is_popular: true },
      { id: '66666666-6666-6666-6666-666666666002', name: 'Hitam', hex_code: '#000000', is_metallic: false, is_popular: true },
      { id: '66666666-6666-6666-6666-666666666003', name: 'Silver', hex_code: '#C0C0C0', is_metallic: true, is_popular: true },
      { id: '66666666-6666-6666-6666-666666666004', name: 'Abu-abu', hex_code: '#808080', is_metallic: true, is_popular: true },
      { id: '66666666-6666-6666-6666-666666666005', name: 'Merah', hex_code: '#FF0000', is_metallic: false, is_popular: true },
      { id: '66666666-6666-6666-6666-666666666006', name: 'Biru', hex_code: '#0000FF', is_metallic: true, is_popular: false },
    ])
    if (!colorError) results.push('✓ Car Colors inserted')

    // Seed Inspection Categories
    const { error: catError } = await supabaseAdmin.from('inspection_categories').insert([
      { id: '77777777-7777-7777-7777-777777777001', name: 'Eksterior', description: 'Pemeriksaan kondisi eksterior', icon: 'car', display_order: 1, total_items: 20 },
      { id: '77777777-7777-7777-7777-777777777002', name: 'Interior', description: 'Pemeriksaan kondisi interior', icon: 'seat', display_order: 2, total_items: 20 },
      { id: '77777777-7777-7777-7777-777777777003', name: 'Mesin', description: 'Pemeriksaan kondisi mesin', icon: 'engine', display_order: 3, total_items: 25 },
      { id: '77777777-7777-7777-7777-777777777004', name: 'Transmisi', description: 'Pemeriksaan sistem transmisi', icon: 'cog', display_order: 4, total_items: 10 },
      { id: '77777777-7777-7777-7777-777777777005', name: 'Rangka & Suspensi', description: 'Pemeriksaan rangka dan suspensi', icon: 'wrench', display_order: 5, total_items: 15 },
      { id: '77777777-7777-7777-7777-777777777006', name: 'Rem', description: 'Pemeriksaan sistem rem', icon: 'disc', display_order: 6, total_items: 10 },
    ])
    if (!catError) results.push('✓ Inspection Categories inserted')

    // Seed Inspection Items
    const { error: itemError } = await supabaseAdmin.from('inspection_items').insert([
      { id: '88888888-8888-8888-8888-888888888001', category_id: '77777777-7777-7777-7777-777777777001', name: 'Cat Body', description: 'Kondisi cat body', display_order: 1, is_critical: true },
      { id: '88888888-8888-8888-8888-888888888002', category_id: '77777777-7777-7777-7777-777777777001', name: 'Panel Depan', description: 'Kondisi panel depan', display_order: 2, is_critical: false },
      { id: '88888888-8888-8888-8888-888888888003', category_id: '77777777-7777-7777-7777-777777777001', name: 'Kaca Depan', description: 'Kondisi kaca depan', display_order: 3, is_critical: true },
      { id: '88888888-8888-8888-8888-888888888021', category_id: '77777777-7777-7777-7777-777777777002', name: 'Dashboard', description: 'Kondisi dashboard', display_order: 1, is_critical: false },
      { id: '88888888-8888-8888-8888-888888888022', category_id: '77777777-7777-7777-7777-777777777002', name: 'AC', description: 'Fungsi AC', display_order: 2, is_critical: true },
      { id: '88888888-8888-8888-8888-888888888031', category_id: '77777777-7777-7777-7777-777777777003', name: 'Mesin Start', description: 'Fungsi starter', display_order: 1, is_critical: true },
      { id: '88888888-8888-8888-8888-888888888032', category_id: '77777777-7777-7777-7777-777777777003', name: 'Oli Mesin', description: 'Kondisi oli', display_order: 2, is_critical: true },
    ])
    if (!itemError) results.push('✓ Inspection Items inserted')

    // Seed Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      { id: '99999999-9999-9999-9999-999999999001', email: 'demo@carmarket.id', full_name: 'Demo Seller', role: 'seller', is_verified: true }
    ])
    if (!profileError) results.push('✓ Profile inserted')

    // Seed Car Listings
    const { error: listingError } = await supabaseAdmin.from('car_listings').insert([
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', listing_number: 'CL-2024001', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333001', model_id: '44444444-4444-4444-4444-444444444001', variant_id: '55555555-5555-5555-5555-555555555002', year: 2022, exterior_color_id: '66666666-6666-6666-6666-666666666001', fuel: 'bensin', transmission: 'automatic', body_type: 'mpv', mileage: 25000, transaction_type: 'jual', condition: 'bekas', price_cash: 225000000, city: 'Jakarta Selatan', province: 'DKI Jakarta', status: 'active', title: 'Toyota Avanza 1.3 E CVT 2022 - Kondisi Prima', description: 'Mobil satu tangan, service resmi. Kondisi mulus.', slug: 'toyota-avanza-2022', published_at: new Date().toISOString() },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', listing_number: 'CL-2024002', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333002', model_id: '44444444-4444-4444-4444-444444444011', variant_id: '55555555-5555-5555-5555-555555555012', year: 2021, exterior_color_id: '66666666-6666-6666-6666-666666666002', fuel: 'bensin', transmission: 'automatic', body_type: 'suv', mileage: 18000, transaction_type: 'jual', condition: 'bekas', price_cash: 490000000, city: 'Bandung', province: 'Jawa Barat', status: 'active', title: 'Honda CR-V 1.5 Turbo 2021 - Low KM', description: 'Full option, low KM, kondisi seperti baru.', slug: 'honda-crv-2021', published_at: new Date().toISOString() },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', listing_number: 'CL-2024003', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333003', model_id: '44444444-4444-4444-4444-444444444016', variant_id: '55555555-5555-5555-5555-555555555016', year: 2023, exterior_color_id: '66666666-6666-6666-6666-666666666003', fuel: 'bensin', transmission: 'automatic', body_type: 'mpv', mileage: 5000, transaction_type: 'jual', condition: 'baru', price_cash: 315000000, city: 'Surabaya', province: 'Jawa Timur', status: 'active', title: 'Mitsubishi Xpander Exceed 2023', description: 'Unit baru, DP ringan, bisa kredit.', slug: 'mitsubishi-xpander-2023', published_at: new Date().toISOString() },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', listing_number: 'CL-2024004', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333001', model_id: '44444444-4444-4444-4444-444444444002', variant_id: '55555555-5555-5555-5555-555555555006', year: 2020, exterior_color_id: '66666666-6666-6666-6666-666666666004', fuel: 'bensin', transmission: 'automatic', body_type: 'mpv', mileage: 45000, transaction_type: 'jual', condition: 'bekas', price_cash: 350000000, city: 'Semarang', province: 'Jawa Tengah', status: 'active', title: 'Toyota Innova 2.0 V AT 2020', description: 'Innova AT, kondisi terawat.', slug: 'toyota-innova-2020', published_at: new Date().toISOString() },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', listing_number: 'CL-2024005', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333002', model_id: '44444444-4444-4444-4444-444444444012', variant_id: '55555555-5555-5555-5555-555555555014', year: 2022, exterior_color_id: '66666666-6666-6666-6666-666666666005', fuel: 'bensin', transmission: 'automatic', body_type: 'suv', mileage: 12000, transaction_type: 'jual', condition: 'bekas', price_cash: 365000000, city: 'Jakarta Pusat', province: 'DKI Jakarta', status: 'active', title: 'Honda HR-V 1.5 S CVT 2022', description: 'Tampilan sporty, fitur lengkap.', slug: 'honda-hrv-2022', published_at: new Date().toISOString() },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', listing_number: 'CL-2024006', user_id: '99999999-9999-9999-9999-999999999001', brand_id: '33333333-3333-3333-3333-333333333001', model_id: '44444444-4444-4444-4444-444444444003', variant_id: '55555555-5555-5555-5555-555555555009', year: 2021, exterior_color_id: '66666666-6666-6666-6666-666666666006', fuel: 'diesel', transmission: 'automatic', body_type: 'suv', mileage: 35000, transaction_type: 'jual', condition: 'bekas', price_cash: 580000000, city: 'Tangerang', province: 'Banten', status: 'active', title: 'Toyota Fortuner 2.8 GR-S AT 2021', description: 'Fortuner Diesel GR-S, 4WD.', slug: 'toyota-fortuner-2021', published_at: new Date().toISOString() },
    ])
    if (!listingError) results.push('✓ Car Listings inserted')

    // Seed Car Images
    const { error: imageError } = await supabaseAdmin.from('car_images').insert([
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', is_primary: true, display_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', image_url: 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=800', is_primary: true, display_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', image_url: 'https://images.unsplash.com/photo-1541506638840-5b3a70a18f5e?w=800', is_primary: true, display_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', is_primary: true, display_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', is_primary: true, display_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', is_primary: true, display_order: 1 },
    ])
    if (!imageError) results.push('✓ Car Images inserted')

    // Seed Car Features
    const { error: featureError } = await supabaseAdmin.from('car_features').insert([
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', rear_camera: true, push_start: true, abs: true, airbag: true, bluetooth: true },
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', sunroof: true, cruise_control: true, rear_camera: true, keyless_start: true, push_start: true, abs: true, airbag: true, bluetooth: true, apple_carplay: true, android_auto: true },
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', rear_camera: true, push_start: true, abs: true, airbag: true, bluetooth: true, apple_carplay: true, android_auto: true },
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', abs: true, airbag: true, bluetooth: true },
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', sunroof: true, cruise_control: true, rear_camera: true, keyless_start: true, push_start: true, abs: true, airbag: true, bluetooth: true, apple_carplay: true, android_auto: true },
      { car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', sunroof: true, cruise_control: true, rear_camera: true, keyless_start: true, push_start: true, abs: true, airbag: true, bluetooth: true, apple_carplay: true, android_auto: true },
    ])
    if (!featureError) results.push('✓ Car Features inserted')

    // Seed Inspections
    const { error: inspectionError } = await supabaseAdmin.from('car_inspections').insert([
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccc01', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', inspector_name: 'Inspector Demo', inspection_place: 'Bengkel Jakarta', inspection_date: '2024-01-15', total_points: 160, passed_points: 152, failed_points: 8, inspection_score: 95.00, accident_free: true, flood_free: true, risk_level: 'low', overall_grade: 'A', recommended: true, status: 'completed' },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccc02', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', inspector_name: 'Inspector Demo', inspection_place: 'Bengkel Bandung', inspection_date: '2024-01-10', total_points: 160, passed_points: 148, failed_points: 12, inspection_score: 92.50, accident_free: true, flood_free: true, risk_level: 'low', overall_grade: 'A-', recommended: true, status: 'completed' },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccc03', car_listing_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', inspector_name: 'Inspector Demo', inspection_place: 'Bengkel Tangerang', inspection_date: '2024-01-12', total_points: 160, passed_points: 155, failed_points: 5, inspection_score: 96.88, accident_free: true, flood_free: true, risk_level: 'low', overall_grade: 'A+', recommended: true, status: 'completed' },
    ])
    if (!inspectionError) results.push('✓ Inspections inserted')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
