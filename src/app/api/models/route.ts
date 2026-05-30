import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brand_id')

    const where: Record<string, unknown> = {}
    if (brandId) {
      where.brand_id = parseInt(brandId)
    }

    const data = await db.carModel.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
