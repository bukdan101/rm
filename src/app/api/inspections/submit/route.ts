import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

// POST - Submit self inspection with AI analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const { 
      car_listing_id, 
      user_id, 
      booking_id,
      purchase_price,
      results,
      accident_free,
      flood_free,
      fire_free,
      odometer_tampered
    } = body

    // Calculate inspection score
    const statusWeights: Record<string, number> = {
      'istimewa': 100,
      'baik': 80,
      'sedang': 60,
      'perlu_perbaikan': 40
    }

    let totalScore = 0
    let totalItems = results.length

    for (const result of results) {
      totalScore += statusWeights[result.status] || 80
    }

    const inspectionScore = totalItems > 0 ? Math.round((totalScore / totalItems) * 100) / 100 : 0

    // Determine overall grade
    let overallGrade = 'B'
    if (inspectionScore >= 95) overallGrade = 'A+'
    else if (inspectionScore >= 90) overallGrade = 'A'
    else if (inspectionScore >= 85) overallGrade = 'B+'
    else if (inspectionScore >= 75) overallGrade = 'B'
    else if (inspectionScore >= 65) overallGrade = 'C'
    else if (inspectionScore >= 50) overallGrade = 'D'
    else overallGrade = 'E'

    // Determine risk level
    let riskLevel = 'low'
    const criticalFailures = results.filter((r: { is_critical?: boolean; status: string }) => 
      r.is_critical && r.status === 'perlu_perbaikan'
    ).length
    if (criticalFailures >= 3) riskLevel = 'very_high'
    else if (criticalFailures >= 2) riskLevel = 'high'
    else if (criticalFailures >= 1 || inspectionScore < 70) riskLevel = 'medium'

    // Generate inspection number
    const inspectionNumber = `INSP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Get car listing details for AI price estimation
    const { data: listing } = await supabase
      .from('car_listings')
      .select(`
        *,
        brands(name),
        car_models(name),
        car_variants(name, year_start)
      `)
      .eq('id', car_listing_id)
      .single()

    // AI Price Estimation (simplified algorithm)
    // In production, this would call an ML model or external API
    const basePrice = purchase_price || listing?.price || 0
    const conditionMultiplier = inspectionScore / 100
    
    // Market factors
    const year = listing?.year || 2020
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    const depreciationRate = 0.1 // 10% per year
    const ageFactor = Math.max(0.3, 1 - (age * depreciationRate))
    
    // Calculate price range
    const marketMultiplier = 0.85 + (Math.random() * 0.3) // Simulated market variation
    const aiPriceMin = Math.round(basePrice * conditionMultiplier * ageFactor * marketMultiplier * 0.95)
    const aiPriceMax = Math.round(basePrice * conditionMultiplier * ageFactor * marketMultiplier * 1.15)
    const aiPriceRecommended = Math.round((aiPriceMin + aiPriceMax) / 2)

    // Calculate profit margin
    const profitMargin = purchase_price > 0 
      ? Math.round(((aiPriceRecommended - purchase_price) / purchase_price) * 10000) / 100 
      : 0

    // Determine demand level
    let demandLevel = 'medium'
    if (inspectionScore >= 85 && listing?.vehicle_condition === 'baru') {
      demandLevel = 'high'
    } else if (inspectionScore < 65 || age > 10) {
      demandLevel = 'low'
    }

    // Days to sell estimate
    let daysToSell = 30
    if (demandLevel === 'high') daysToSell = 7
    else if (demandLevel === 'low') daysToSell = 60
    else if (inspectionScore >= 80) daysToSell = 14
    else if (inspectionScore >= 70) daysToSell = 21

    // Create inspection record
    const { data: inspection, error: inspectionError } = await adminClient
      .from('car_inspections')
      .insert({
        car_listing_id,
        inspector_id: user_id,
        inspector_name: 'Self Inspection',
        inspection_place: 'Self Assessment',
        inspection_date: new Date().toISOString(),
        total_points: totalItems,
        passed_points: results.filter((r: { status: string }) => r.status === 'baik' || r.status === 'istimewa').length,
        failed_points: results.filter((r: { status: string }) => r.status === 'perlu_perbaikan').length,
        inspection_score: inspectionScore,
        accident_free: accident_free ?? true,
        flood_free: flood_free ?? true,
        fire_free: fire_free ?? true,
        odometer_tampered: odometer_tampered ?? false,
        risk_level: riskLevel,
        overall_grade: overallGrade,
        recommended: riskLevel !== 'very_high',
        status: 'completed',
        booking_id,
        inspection_type: 'self',
        purchase_price,
        ai_price_min: aiPriceMin,
        ai_price_max: aiPriceMax,
        ai_price_recommended: aiPriceRecommended,
        ai_profit_margin: profitMargin,
        ai_demand_level: demandLevel,
        days_to_sell_estimate: daysToSell,
        has_certificate: false
      })
      .select()
      .single()

    if (inspectionError) throw inspectionError

    // Insert inspection results
    if (results && results.length > 0) {
      const resultsToInsert = results.map((r: { item_id: number; status: string; notes?: string }) => ({
        inspection_id: inspection.id,
        item_id: r.item_id,
        status: r.status || 'baik',
        notes: r.notes || null
      }))

      const { error: resultsError } = await adminClient
        .from('inspection_results')
        .insert(resultsToInsert)

      if (resultsError) throw resultsError
    }

    // Update booking status if exists
    if (booking_id) {
      await adminClient
        .from('inspection_bookings')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id)
    }

    // Create AI analysis log
    await adminClient
      .from('ai_price_analysis')
      .insert({
        inspection_id: inspection.id,
        car_listing_id,
        purchase_price,
        estimated_price_min: aiPriceMin,
        estimated_price_max: aiPriceMax,
        recommended_price: aiPriceRecommended,
        market_average_price: aiPriceRecommended,
        condition_score: inspectionScore,
        market_demand: demandLevel,
        days_to_sell_estimate: daysToSell,
        profit_margin_percent: profitMargin,
        recommendation: generateRecommendation(inspectionScore, riskLevel, demandLevel)
      })

    return NextResponse.json({ 
      success: true, 
      data: {
        inspection,
        ai_analysis: {
          price_min: aiPriceMin,
          price_max: aiPriceMax,
          price_recommended: aiPriceRecommended,
          profit_margin: profitMargin,
          demand_level: demandLevel,
          days_to_sell: daysToSell,
          score: inspectionScore,
          grade: overallGrade,
          risk_level: riskLevel
        }
      }
    })
  } catch (error) {
    console.error('Error submitting inspection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inspection' },
      { status: 500 }
    )
  }
}

function generateRecommendation(score: number, risk: string, demand: string): string {
  const recommendations = []
  
  if (score >= 90) {
    recommendations.push('Kondisi kendaraan sangat baik dan siap dijual.')
  } else if (score >= 75) {
    recommendations.push('Kondisi kendaraan baik, beberapa perbaikan minor disarankan.')
  } else if (score >= 60) {
    recommendations.push('Kendaraan memerlukan beberapa perbaikan sebelum dijual.')
  } else {
    recommendations.push('Kendaraan memerlukan perbaikan signifikan.')
  }
  
  if (risk === 'high' || risk === 'very_high') {
    recommendations.push('Terdapat risiko tinggi, pertimbangkan perbaikan sebelum menjual.')
  }
  
  if (demand === 'high') {
    recommendations.push('Permintaan pasar tinggi, harga dapat ditawarkan lebih tinggi.')
  } else if (demand === 'low') {
    recommendations.push('Permintaan pasar rendah, pertimbangkan harga kompetitif.')
  }
  
  return recommendations.join(' ')
}
