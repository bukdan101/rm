import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (type === 'provinces') {
      const data = await db.province.findMany({
        where: { is_active: true },
        orderBy: { name: 'asc' }
      })
      return NextResponse.json({ success: true, data })
    }

    if (type === 'cities') {
      const provinceId = searchParams.get('province_id')

      const data = await db.city.findMany({
        where: {
          is_active: true,
          ...(provinceId ? { province_id: provinceId } : {})
        },
        include: {
          province: { select: { id: true, name: true } }
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({ success: true, data })
    }

    if (type === 'districts') {
      const cityId = searchParams.get('city_id')

      const data = await db.district.findMany({
        where: {
          is_active: true,
          ...(cityId ? { city_id: cityId } : {})
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({ success: true, data })
    }

    // Return all locations grouped by province
    const data = await db.province.findMany({
      where: { is_active: true },
      include: {
        cities: { select: { id: true, name: true, type: true, latitude: true, longitude: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
