import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  // Return the schema content for manual execution
  try {
    const schemaPath = join(process.cwd(), 'supabase', 'schema-dealer-registration.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    return NextResponse.json({
      success: true,
      schema: schemaSQL,
      message: 'Copy this SQL and run it in Supabase SQL Editor',
      instructions: [
        '1. Go to Supabase Dashboard (https://supabase.com/dashboard)',
        '2. Select your project',
        '3. Navigate to SQL Editor',
        '4. Create a new query',
        '5. Paste the schema SQL below',
        '6. Click Run to execute'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to read schema file',
    }, { status: 500 })
  }
}
