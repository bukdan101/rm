import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not found')
  process.exit(1)
}

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1,
  connect_timeout: 10,
})

async function checkAndSetup() {
  try {
    console.log('🔄 Connecting to Supabase...')
    
    // Check existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log('\n📋 Existing tables:')
    if (tables.length === 0) {
      console.log('  (No tables found - need to run schema)')
    } else {
      tables.forEach((t: any) => console.log(`  - ${t.table_name}`))
    }

    // Check if car_listings exists
    const hasListings = tables.some((t: any) => t.table_name === 'car_listings')
    
    if (!hasListings) {
      console.log('\n⚠️  car_listings table not found!')
      console.log('\n📌 Please run the SQL schema in Supabase SQL Editor:')
      console.log('   1. Go to https://supabase.com/dashboard')
      console.log('   2. Select your project')
      console.log('   3. Click "SQL Editor" in the sidebar')
      console.log('   4. Copy the contents of supabase/schema-complete.sql')
      console.log('   5. Paste and click "Run"')
      console.log('\n   File location: supabase/schema-complete.sql')
    } else {
      console.log('\n✅ Database is ready!')
      
      // Count records
      try {
        const count = await sql`SELECT COUNT(*) as count FROM car_listings`
        console.log(`   car_listings: ${(count[0] as any)?.count} records`)
      } catch (e) {
        console.log('   Could not count records')
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error)
  } finally {
    await sql.end()
  }
}

checkAndSetup()
