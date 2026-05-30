import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const districtId = searchParams.get('district_id')

    const where: Record<string, unknown> = { is_active: true }
    if (districtId) {
      where.district_id = districtId
    }

    const data = await db.village.findMany({
      where,
      select: { id: true, district_id: true, name: true, postal_code: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch villages' },
      { status: 500 }
    )
  }
}
