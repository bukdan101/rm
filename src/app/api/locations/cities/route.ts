import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('province_id')

    const where: Record<string, unknown> = { is_active: true }
    if (provinceId) {
      where.province_id = provinceId
    }

    const data = await db.city.findMany({
      where,
      select: { id: true, province_id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
