import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('city_id')

    const where: Record<string, unknown> = { is_active: true }
    if (cityId) {
      where.city_id = cityId
    }

    const data = await db.district.findMany({
      where,
      select: { id: true, city_id: true, name: true, postal_code: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    )
  }
}
