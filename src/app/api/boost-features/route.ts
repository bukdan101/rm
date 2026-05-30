import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch boost features
export async function GET(request: NextRequest) {
  try {
    const data = await db.boostFeature.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    })

    return NextResponse.json({ features: data })
  } catch (error) {
    console.error('Error fetching boost features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
