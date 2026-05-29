import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get inspection with car listing details
    const { data: inspection, error: inspError } = await supabase
      .from('car_inspections')
      .select(`
        *,
        car_listings(
          id, title, year, mileage, fuel, transmission, body_type,
          price_cash, city, province,
          brands(id, name),
          car_models(id, name),
          car_images(image_url, is_primary)
        )
      `)
      .eq('id', id)
      .single()

    if (inspError || !inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Get all inspection results with item details
    const { data: results, error: resultsError } = await supabase
      .from('inspection_results')
      .select(`
        id, status, notes, severity,
        inspection_items(
          id, name, description, display_order, is_critical,
          category_id
        )
      `)
      .eq('inspection_id', id)
      .order('inspection_items(display_order)')

    if (resultsError) {
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    // Get categories
    const { data: categories } = await supabase
      .from('inspection_categories')
      .select('*')
      .order('display_order')

    // Group results by category
    const categoryMap: Record<string, any> = {}
    for (const cat of categories || []) {
      categoryMap[cat.id] = {
        ...cat,
        items: [],
        passed: 0,
        failed: 0
      }
    }

    for (const result of results || []) {
      const catId = result.inspection_items?.category_id
      if (catId && categoryMap[catId]) {
        categoryMap[catId].items.push({
          id: result.id,
          name: result.inspection_items?.name,
          description: result.inspection_items?.description,
          display_order: result.inspection_items?.display_order,
          status: result.status,
          is_critical: result.inspection_items?.is_critical,
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
