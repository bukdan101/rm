import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment')
  process.exit(1)
}

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1,
})

async function runSchema() {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema-complete.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')

    console.log('Executing schema...')
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT '))

    let successCount = 0
    let skipCount = 0

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement + ';')
          successCount++
          if (successCount % 10 === 0) {
            console.log(`✓ Executed ${successCount} statements...`)
          }
        } catch (err: any) {
          // Ignore "already exists" and "does not exist" errors
          const msg = err.message || ''
          if (msg.includes('already exists') || msg.includes('does not exist') || msg.includes('must be owner')) {
            skipCount++
          } else {
            console.error('✗ Error:', msg.substring(0, 200))
          }
        }
      }
    }

    console.log(`\n✅ Schema execution completed! (${successCount} success, ${skipCount} skipped)`)
    
    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log('\n📋 Tables in database:')
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`))

    // Count records in key tables
    console.log('\n📊 Record counts:')
    const countQueries = [
      'brands', 'car_models', 'car_variants', 'car_colors',
      'car_listings', 'car_images', 'car_features', 'car_inspections',
      'provinces', 'cities', 'inspection_categories', 'inspection_items'
    ]
    
    for (const table of countQueries) {
      try {
        const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`  - ${table}: ${(result[0] as any)?.count || 0} records`)
      } catch {
        console.log(`  - ${table}: table not found`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

runSchema()
