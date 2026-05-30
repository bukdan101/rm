import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.carColor.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colors' },
      { status: 500 }
    )
  }
}
