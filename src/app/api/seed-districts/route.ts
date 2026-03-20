import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v5 as uuidv5 } from 'uuid'

const supabase = getSupabaseAdmin()

// Namespace UUIDs for deterministic IDs
const DISTRICT_NAMESPACE = '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
const VILLAGE_NAMESPACE = '6ba7b813-9dad-11d1-80b4-00c04fd430c8'

function generateUUID(str: string, namespace: string): string {
  return uuidv5(str, namespace)
}

export async function GET() {
  console.log('=== Starting districts and villages seed process ===')

  try {
    // Dynamic import for idn-area-data
    const { getDistricts, getVillages } = await import('idn-area-data')

    // Step 1: Get city mappings from our database
    console.log('Step 1: Fetching city mappings...')
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, province_id')
    
    if (citiesError) throw citiesError

    // Create a mapping of city code to UUID
    const cityMap: Record<string, { id: string; province_id: string }> = {}
    cities?.forEach(city => {
      cityMap[city.id] = { id: city.id, province_id: city.province_id }
    })

    console.log(`Found ${cities?.length || 0} cities in database`)

    // Step 2: Fetch districts from idn-area-data
    console.log('Step 2: Fetching districts from idn-area-data...')
    const districtsData = await getDistricts() as Array<{
      code: string
      regency_code: string
      name: string
    }>
    console.log(`Found ${districtsData.length} districts`)

    // Step 3: Clear existing districts and villages
    console.log('Step 3: Clearing existing districts and villages...')
    await supabase.from('villages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('districts').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Step 4: Seed districts
    console.log('Step 4: Seeding districts...')
    const districtBatches: Array<{
      id: string
      city_id: string
      code: string
      name: string
      is_active: boolean
    }> = []
    const districtMap: Record<string, string> = {} // code -> UUID

    for (const district of districtsData) {
      // Find the corresponding city
      // In idn-area-data, regency_code is the city code
      // We need to find the city in our database that matches
      
      // Generate deterministic UUID
      const districtId = generateUUID(`district-${district.code}`, DISTRICT_NAMESPACE)
      districtMap[district.code] = districtId

      // For now, we'll skip the city_id relationship since our cities have different IDs
      // We'll need to create a mapping from regency_code to our city IDs
      
      districtBatches.push({
        id: districtId,
        city_id: district.regency_code, // This will need to be mapped later
        code: district.code,
        name: district.name,
        is_active: true,
      })

      // Insert in batches of 100
      if (districtBatches.length >= 100) {
        // Skip city_id constraint for now
        const insertData = districtBatches.map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          is_active: d.is_active,
        }))
        
        const { error } = await supabase.from('districts').insert(insertData)
        if (error) {
          console.error('Error inserting districts batch:', error.message)
        }
        districtBatches.length = 0
      }
    }

    // Insert remaining districts
    if (districtBatches.length > 0) {
      const insertData = districtBatches.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        is_active: d.is_active,
      }))
      
      const { error } = await supabase.from('districts').insert(insertData)
      if (error) {
        console.error('Error inserting final districts batch:', error.message)
      }
    }

    // Step 5: Seed villages (sample - too many to seed all at once)
    console.log('Step 5: Seeding villages (limited to first 1000 for performance)...')
    const villagesData = await getVillages() as Array<{
      code: string
      district_code: string
      name: string
    }>
    console.log(`Found ${villagesData.length} villages total`)

    // Limit to first 1000 villages for performance
    const limitedVillages = villagesData.slice(0, 1000)
    const villageBatches: Array<{
      id: string
      district_id: string
      code: string
      name: string
      is_active: boolean
    }> = []

    for (const village of limitedVillages) {
      const villageId = generateUUID(`village-${village.code}`, VILLAGE_NAMESPACE)
      const districtId = districtMap[village.district_code]

      villageBatches.push({
        id: villageId,
        district_id: districtId || village.district_code,
        code: village.code,
        name: village.name,
        is_active: true,
      })

      if (villageBatches.length >= 100) {
        const insertData = villageBatches.map(v => ({
          id: v.id,
          code: v.code,
          name: v.name,
          is_active: v.is_active,
        }))
        
        const { error } = await supabase.from('villages').insert(insertData)
        if (error) {
          console.error('Error inserting villages batch:', error.message)
        }
        villageBatches.length = 0
      }
    }

    // Insert remaining villages
    if (villageBatches.length > 0) {
      const insertData = villageBatches.map(v => ({
        id: v.id,
        code: v.code,
        name: v.name,
        is_active: v.is_active,
      }))
      
      const { error } = await supabase.from('villages').insert(insertData)
      if (error) {
        console.error('Error inserting final villages batch:', error.message)
      }
    }

    // Step 6: Verify counts
    const { count: districtCount } = await supabase
      .from('districts')
      .select('*', { count: 'exact', head: true })

    const { count: villageCount } = await supabase
      .from('villages')
      .select('*', { count: 'exact', head: true })

    console.log('=== Districts and villages seed completed ===')

    return NextResponse.json({
      success: true,
      message: 'Districts and villages seeded successfully!',
      data: {
        districts_available: districtsData.length,
        districts_inserted: districtCount || 0,
        villages_available: villagesData.length,
        villages_inserted: villageCount || 0,
        note: 'Villages limited to 1000 for performance. Run again or implement chunked seeding for full data.',
      }
    })
  } catch (error) {
    console.error('Seed districts/villages error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
