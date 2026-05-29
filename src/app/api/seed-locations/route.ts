import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v5 as uuidv5 } from 'uuid'

// Namespace UUID for generating deterministic UUIDs
const PROVINCE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID namespace for DNS
const CITY_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8' // UUID namespace for URL

const supabase = getSupabaseAdmin()

// Generate deterministic UUID from string
function generateUUID(str: string, namespace: string): string {
  return uuidv5(str, namespace)
}

// Parse regency name to extract type and clean name
function parseRegencyName(fullName: string): { type: 'kota' | 'kabupaten'; name: string } {
  if (fullName.startsWith('Kota ')) {
    return { type: 'kota', name: fullName.replace('Kota ', '') }
  } else if (fullName.startsWith('Kabupaten ')) {
    return { type: 'kabupaten', name: fullName.replace('Kabupaten ', '') }
  }
  // Default to kabupaten if no prefix
  return { type: 'kabupaten', name: fullName }
}

export async function GET() {
  console.log('=== Starting location seed process ===')

  try {
    // Dynamic import for idn-area-data (server-side only)
    const { getProvinces, getRegencies } = await import('idn-area-data')

    // Step 1: Get all provinces from idn-area-data
    console.log('Step 1: Fetching provinces...')
    const provincesData = await getProvinces() as Array<{ code: string; name: string }>
    console.log(`Found ${provincesData.length} provinces`)

    // Step 2: Clear existing data (optional - comment out if you want to keep existing)
    console.log('Step 2: Clearing existing location data...')
    await supabase.from('cities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('provinces').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Step 3: Insert provinces
    console.log('Step 3: Inserting provinces...')
    const provinceMap: Record<string, string> = {} // code -> UUID

    for (const province of provincesData) {
      const provinceId = generateUUID(`province-${province.code}`, PROVINCE_NAMESPACE)
      provinceMap[province.code] = provinceId

      const { error } = await supabase
        .from('provinces')
        .insert({
          id: provinceId,
          code: province.code,
          name: province.name,
          is_active: true,
        })

      if (error) {
        console.error(`Error inserting province ${province.name}:`, error.message)
      }
    }
    console.log(`Inserted ${Object.keys(provinceMap).length} provinces`)

    // Step 4: Get and insert regencies/cities
    console.log('Step 4: Fetching regencies...')
    const regenciesData = await getRegencies() as Array<{ 
      code: string
      province_code: string
      name: string 
    }>
    console.log(`Found ${regenciesData.length} regencies`)

    let citiesInserted = 0
    const batchSize = 100
    const cityBatches: Array<{
      id: string
      province_id: string
      name: string
      type: 'kota' | 'kabupaten'
      is_active: boolean
    }> = []

    for (const regency of regenciesData) {
      const cityId = generateUUID(`city-${regency.code}`, CITY_NAMESPACE)
      const provinceId = provinceMap[regency.province_code]
      
      if (!provinceId) {
        console.warn(`Province not found for regency ${regency.name} (${regency.province_code})`)
        continue
      }

      const { type, name } = parseRegencyName(regency.name)

      cityBatches.push({
        id: cityId,
        province_id: provinceId,
        name: name,
        type: type,
        is_active: true,
      })

      // Insert in batches
      if (cityBatches.length >= batchSize) {
        const { error } = await supabase.from('cities').insert(cityBatches)
        if (error) {
          console.error('Error inserting cities batch:', error.message)
        } else {
          citiesInserted += cityBatches.length
        }
        cityBatches.length = 0
      }
    }

    // Insert remaining cities
    if (cityBatches.length > 0) {
      const { error } = await supabase.from('cities').insert(cityBatches)
      if (error) {
        console.error('Error inserting final cities batch:', error.message)
      } else {
        citiesInserted += cityBatches.length
      }
    }

    console.log(`Inserted ${citiesInserted} cities/regencies`)

    // Step 5: Verify data
    const { count: provinceCount } = await supabase
      .from('provinces')
      .select('*', { count: 'exact', head: true })

    const { count: cityCount } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true })

    console.log('=== Location seed completed ===')

    return NextResponse.json({
      success: true,
      message: 'Location data seeded successfully!',
      data: {
        provinces: provincesData.length,
        provincesInserted: provinceCount || 0,
        regencies: regenciesData.length,
        citiesInserted: cityCount,
      }
    })
  } catch (error) {
    console.error('Location seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
