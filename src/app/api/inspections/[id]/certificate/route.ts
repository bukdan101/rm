import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get inspection with car listing details
    const inspection = await db.carInspection.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            year: true,
            mileage: true,
            fuel: true,
            transmission: true,
            body_type: true,
            price_cash: true,
            city: true,
            province: true,
            brand: { select: { id: true, name: true } },
            model: { select: { id: true, name: true } },
            images: { select: { image_url: true, is_primary: true } }
          }
        }
      }
    })

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Get all inspection results with item details
    const results = await db.inspectionResult.findMany({
      where: { inspection_id: id },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            display_order: true,
            is_critical: true,
            category_id: true
          }
        }
      },
      orderBy: {
        item: { display_order: 'asc' }
      }
    })

    // Get categories ordered by display_order
    const categories = await db.inspectionCategory.findMany({
      orderBy: { display_order: 'asc' }
    })

    // Group results by category
    const categoryMap: Record<string, any> = {}
    for (const cat of categories) {
      categoryMap[cat.id] = {
        ...cat,
        items: [],
        passed: 0,
        failed: 0
      }
    }

    for (const result of results) {
      const catId = result.item?.category_id
      if (catId && categoryMap[catId]) {
        categoryMap[catId].items.push({
          id: result.id,
          name: result.item?.name,
          description: result.item?.description,
          display_order: result.item?.display_order,
          status: result.status,
          is_critical: result.item?.is_critical,
          notes: result.notes,
          severity: result.severity
        })
        if (result.status === 'baik') {
          categoryMap[catId].passed++
        } else {
          categoryMap[catId].failed++
        }
      }
    }

    // Calculate category scores
    const categoryScores = Object.values(categoryMap).map((cat: any) => ({
      ...cat,
      score: cat.items.length > 0 ? Math.round((cat.passed / cat.items.length) * 100) : 0
    }))

    return NextResponse.json({
      inspection,
      categories: categoryScores,
      summary: {
        total_items: results?.length || 0,
        passed: inspection.passed_points || results?.filter(r => r.status === 'baik').length || 0,
        failed: inspection.failed_points || results?.filter(r => r.status !== 'baik').length || 0,
        score: inspection.inspection_score,
        grade: inspection.overall_grade
      }
    })
  } catch (error) {
    console.error('Certificate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
