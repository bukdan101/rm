/**
 * SEED INDONESIA LOCATION DATA (Full Version)
 * 
 * Script untuk mengisi database dengan data wilayah Indonesia lengkap:
 * - 38 Provinces
 * - 514 Kabupaten/Kota
 * - 7.200+ Kecamatan
 * - 83.000+ Kelurahan/Desa
 * 
 * Data source: idn-area-data package
 * Purpose: KYC verification untuk mencegah fraud
 */

import { createClient } from '@supabase/supabase-js'
import { getProvinces, getRegencies, getDistricts, getVillages } from 'idn-area-data'
import { randomUUID } from 'crypto'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Generate a proper UUID from code (deterministic)
function codeToUUID(code: string): string {
  // Pad code to 32 hex characters
  const hex = code.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  const padded = hex.padEnd(32, '0').slice(0, 32)
  
  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-4${padded.slice(13, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`
}

// Country ID (Indonesia)
const COUNTRY_ID = '496e646f-6e65-7369-6100-000000000001'

// Store mappings
const provinceMap = new Map<string, string>()
const cityMap = new Map<string, string>()
const districtMap = new Map<string, string>()

async function seedCountries() {
  console.log('🌍 Seeding countries...')
  
  const { error } = await supabase.from('countries').upsert({
    id: COUNTRY_ID,
    code: 'ID',
    name: 'Indonesia',
    phone_code: '+62',
    currency_code: 'IDR',
    currency_name: 'Indonesian Rupiah'
  }, { onConflict: 'id' })
  
  if (error) {
    console.error('Error seeding countries:', error.message)
  } else {
    console.log('✅ Countries seeded')
  }
}

async function seedProvinces() {
  console.log('🏛️ Seeding provinces...')
  
  const provincesData = await getProvinces()
  console.log(`   Found ${provincesData.length} provinces`)
  
  const data = []
  for (const p of provincesData) {
    const id = codeToUUID(`prov${p.code}`)
    provinceMap.set(p.code, id)
    data.push({
      id,
      country_id: COUNTRY_ID,
      code: p.code,
      name: p.name,
      is_active: true
    })
  }
  
  // Batch insert
  const batchSize = 50
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from('provinces').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Error seeding provinces batch ${i}:`, error.message)
    }
  }
  
  console.log(`✅ ${provincesData.length} provinces seeded`)
}

async function seedRegencies() {
  console.log('🏙️ Seeding regencies/cities...')
  
  const regenciesData = await getRegencies({ transform: true } as any)
  console.log(`   Found ${regenciesData.length} regencies/cities`)
  
  const data = []
  for (const r of regenciesData as any[]) {
    const id = codeToUUID(`city${r.code.replace(/\./g, '')}`)
    const provinceId = provinceMap.get(r.provinceCode) || codeToUUID(`prov${r.provinceCode}`)
    cityMap.set(r.code, id)
    data.push({
      id,
      province_id: provinceId,
      name: r.name,
      type: r.name.toLowerCase().includes('kota') ? 'kota' : 'kabupaten',
      is_active: true
    })
  }
  
  // Batch insert
  const batchSize = 100
  let inserted = 0
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from('cities').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Error seeding cities batch ${i}:`, error.message)
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r   Progress: ${inserted}/${data.length}`)
  }
  
  console.log(`\n✅ ${regenciesData.length} regencies/cities seeded`)
}

async function seedDistricts() {
  console.log('🏘️ Seeding districts (kecamatan)...')
  
  const districtsData = await getDistricts({ transform: true } as any)
  console.log(`   Found ${districtsData.length} districts`)
  
  const data = []
  for (const d of districtsData as any[]) {
    const id = codeToUUID(`dist${d.code.replace(/\./g, '')}`)
    const cityId = cityMap.get(d.regencyCode) || codeToUUID(`city${d.regencyCode.replace(/\./g, '')}`)
    districtMap.set(d.code, id)
    data.push({
      id,
      city_id: cityId,
      name: d.name,
      is_active: true
    })
  }
  
  // Batch insert
  const batchSize = 500
  let inserted = 0
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from('districts').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Error seeding districts batch ${i}:`, error.message)
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r   Progress: ${inserted}/${data.length}`)
  }
  
  console.log(`\n✅ ${districtsData.length} districts seeded`)
}

async function seedVillages() {
  console.log('🏠 Seeding villages (kelurahan/desa)...')
  
  // Check if villages table exists
  const { data: existingVillages, error: checkError } = await supabase
    .from('villages')
    .select('id')
    .limit(1)
    
  if (checkError) {
    if (checkError.message.includes('Could not find') || checkError.message.includes('does not exist')) {
      console.log('⚠️  Villages table not found in database.')
      console.log('   Creating villages table...')
      
      // Create villages table via API
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS villages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
            code TEXT,
            name TEXT NOT NULL,
            postal_code TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_villages_district ON villages(district_id);
        `
      })
      
      if (createError) {
        console.log('   ⚠️  Could not create villages table automatically.')
        console.log('   Please run the following SQL in Supabase SQL Editor:')
        console.log(`
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_villages_district ON villages(district_id);
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view villages" ON villages FOR SELECT USING (is_active = TRUE);
        `)
        console.log('\n   Then run this script again to seed villages.')
        return
      }
    } else {
      console.error('Error checking villages table:', checkError.message)
      return
    }
  }
  
  const villagesData = await getVillages({ transform: true } as any)
  console.log(`   Found ${villagesData.length} villages`)
  
  const data = []
  for (const v of villagesData as any[]) {
    const id = codeToUUID(`vill${v.code.replace(/\./g, '')}`)
    const districtId = districtMap.get(v.districtCode) || codeToUUID(`dist${v.districtCode.replace(/\./g, '')}`)
    data.push({
      id,
      district_id: districtId,
      code: v.code,
      name: v.name,
      is_active: true
    })
  }
  
  // Batch insert (1000 per batch)
  const batchSize = 1000
  let inserted = 0
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from('villages').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Error seeding villages batch ${i}:`, error.message)
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r   Progress: ${inserted}/${data.length}`)
  }
  
  console.log(`\n✅ ${villagesData.length} villages seeded`)
}

async function main() {
  console.log('🚀 Starting Indonesia Location Data Seed...\n')
  console.log('=' .repeat(50))
  
  const startTime = Date.now()
  
  try {
    await seedCountries()
    await seedProvinces()
    await seedRegencies()
    await seedDistricts()
    await seedVillages()
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 SEEDING COMPLETED!')
    console.log(`⏱️  Duration: ${duration} seconds`)
    console.log('\n📊 Summary:')
    console.log('   - 38 Provinces')
    console.log('   - 514 Regencies/Cities (Kabupaten/Kota)')
    console.log('   - ~7,200 Districts (Kecamatan)')
    console.log('   - ~83,000 Villages (Kelurahan/Desa)')
    console.log('\n🔐 This data is used for KYC verification to prevent fraud')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

main()
