import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')

    const where: Record<string, unknown> = {}
    if (categoryId) {
      where.category_id = parseInt(categoryId)
    }

    const data = await db.inspectionItem.findMany({
      where,
      include: {
        inspectionCategory: {
          select: { id: true, name: true },
        },
      },
      orderBy: { display_order: 'asc' },
    })

    // Group by category name
    const grouped: Record<string, typeof data> = {}
    for (const item of data) {
      const category = item.inspectionCategory?.name || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    }

    return NextResponse.json({
      success: true,
      data,
      grouped,
    })
  } catch (error) {
    console.error('Error fetching inspection items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection items' },
      { status: 500 }
    )
  }
}
