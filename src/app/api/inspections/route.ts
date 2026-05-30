import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const carListingId = searchParams.get('car_listing_id')

    if (!carListingId) {
      return NextResponse.json(
        { success: false, error: 'car_listing_id is required' },
        { status: 400 }
      )
    }

    const data = await db.carInspection.findUnique({
      where: { car_listing_id },
      include: {
        results: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                display_order: true,
                inspectionCategory: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    })

    if (!data) {
      return NextResponse.json({ success: true, data: null })
    }

    // Group results by category
    const grouped: Record<string, typeof data.results> = {}
    if (data.results) {
      for (const result of data.results) {
        const category = result.item?.inspectionCategory?.name || 'Other'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(result)
      }
    }

    // Calculate statistics
    const stats = {
      total: data.results?.length || 0,
      baik: data.results?.filter(r => r.status === 'baik').length || 0,
      sedang: data.results?.filter(r => r.status === 'sedang').length || 0,
      perlu_perbaikan: data.results?.filter(r => r.status === 'perlu_perbaikan').length || 0,
      istimewa: data.results?.filter(r => r.status === 'istimewa').length || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        results_by_category: grouped,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching inspection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create inspection
    const inspection = await db.carInspection.create({
      data: {
        car_listing_id: body.car_listing_id,
        inspector_name: body.inspector_name,
        inspection_place: body.inspection_place,
        inspection_date: body.inspection_date ? new Date(body.inspection_date) : new Date(),
        total_points: body.total_points || 160,
        passed_points: body.passed_points,
        accident_free: body.accident_free ?? true,
        flood_free: body.flood_free ?? true,
        fire_free: body.fire_free ?? true,
        risk_level: body.risk_level || 'low',
      },
    })

    // If results are provided, insert them
    if (body.results && body.results.length > 0) {
      const resultsToInsert = body.results.map((r: { item_id: number; status: string; notes?: string; image_url?: string }) => ({
        inspection_id: inspection.id,
        item_id: r.item_id,
        status: r.status || 'baik',
        notes: r.notes || null,
        image_url: r.image_url || null,
      }))

      await db.inspectionResult.createMany({
        data: resultsToInsert,
      })
    } else {
      // Create default results for all inspection items
      const items = await db.inspectionItem.findMany({
        select: { id: true },
      })

      if (items && items.length > 0) {
        const defaultResults = items.map(item => ({
          inspection_id: inspection.id,
          item_id: item.id,
          status: 'baik',
        }))

        await db.inspectionResult.createMany({
          data: defaultResults,
        })
      }
    }

    return NextResponse.json({ success: true, data: inspection })
  } catch (error) {
    console.error('Error creating inspection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create inspection' },
      { status: 500 }
    )
  }
}
