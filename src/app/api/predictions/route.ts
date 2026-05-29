import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import ZAI from 'z-ai-web-dev-sdk'

// Initialize VLM for image analysis
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// Analyze car image with VLM
async function analyzeCarImage(imageUrl: string, photoType: string) {
  const zai = await getZAI()
  
  const prompts: Record<string, string> = {
    exterior_front: `Analyze this front exterior car photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Visible damages (scratches, dents, cracks, rust)
3. Paint condition
4. Headlight condition
5. Bumper condition
6. Grille condition
7. Any modifications
8. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "paint_condition": "...", "headlights": "...", "bumper": "...", "modifications": [], "overall_notes": "..."}`,
    
    exterior_rear: `Analyze this rear exterior car photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Visible damages (scratches, dents, cracks, rust)
3. Tail light condition
4. Bumper condition
5. Exhaust condition
6. Any modifications
7. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "tail_lights": "...", "bumper": "...", "exhaust": "...", "modifications": [], "overall_notes": "..."}`,
    
    exterior_side_left: `Analyze this left side exterior car photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Visible damages (scratches, dents, rust)
3. Door condition
4. Fender condition
5. Wheel/tire condition
6. Window condition
7. Mirror condition
8. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "doors": "...", "fender": "...", "wheels": "...", "windows": "...", "mirror": "...", "overall_notes": "..."}`,
    
    exterior_side_right: `Analyze this right side exterior car photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Visible damages (scratches, dents, rust)
3. Door condition
4. Fender condition
5. Wheel/tire condition
6. Window condition
7. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "doors": "...", "fender": "...", "wheels": "...", "windows": "...", "overall_notes": "..."}`,
    
    interior_dashboard: `Analyze this interior dashboard photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Dashboard condition (cracks, fading, scratches)
3. Steering wheel condition
4. Instrument cluster condition
5. Center console condition
6. AC vents condition
7. Any modifications (stereo, gauges, etc)
8. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "dashboard": "...", "steering_wheel": "...", "instrument_cluster": "...", "center_console": "...", "ac_vents": "...", "modifications": [], "overall_notes": "..."}`,
    
    interior_seats: `Analyze this interior seats photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Seat upholstery condition (leather/fabric)
3. Wear patterns
4. Tears or damages
5. Stains
6. Seat adjustment condition
7. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "damages": [], "condition_score": X, "upholstery_type": "...", "wear_level": "...", "tears": [], "stains": [], "overall_notes": "..."}`,
    
    engine: `Analyze this engine bay photo. Identify:
1. Overall condition (excellent/good/fair/poor)
2. Visible leaks (oil, coolant, etc)
3. Rust or corrosion
4. Belt condition
5. Hose condition
6. Modifications or upgrades
7. General cleanliness
8. Estimated condition score (1-10)

Return as JSON: {"condition": "...", "leaks": [], "rust_areas": [], "belt_condition": "...", "hose_condition": "...", "modifications": [], "cleanliness": "...", "condition_score": X, "overall_notes": "..."}`,
    
    odometer: `Analyze this odometer/photo. Extract:
1. Current mileage/kilometer reading
2. Display condition
3. Any signs of tampering

Return as JSON: {"mileage": X, "unit": "km/miles", "display_condition": "...", "tampering_signs": [], "confidence": "high/medium/low"}`
  }
  
  const prompt = prompts[photoType] || prompts.exterior_front
  
  try {
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    })
    
    const content = response.choices[0]?.message?.content || '{}'
    
    // Try to parse JSON from the response
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
      const jsonStr = jsonMatch[1] || content
      return JSON.parse(jsonStr)
    } catch {
      return { raw_response: content, parse_error: true }
    }
  } catch (error) {
    console.error('VLM analysis error:', error)
    return { error: 'Failed to analyze image', details: String(error) }
  }
}

// GET - Get prediction by ID or list predictions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')
    const dealerId = searchParams.get('dealer_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (id) {
      // Get single prediction with all details
      const { data, error } = await supabase
        .from('ai_predictions')
        .select(`
          *,
          brands:brand_id(id, name),
          models:model_id(id, name),
          variants:variant_id(id, name),
          prediction_photos(*),
          prediction_factors(*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, data })
    }
    
    // List predictions
    let query = supabase
      .from('ai_predictions')
      .select(`
        *,
        brands:brand_id(id, name),
        models:model_id(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (userId) query = query.eq('user_id', userId)
    if (dealerId) query = query.eq('dealer_id', dealerId)
    if (status) query = query.eq('status', status)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}

// POST - Create new prediction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // User info
      user_id,
      dealer_id,
      
      // Vehicle data
      brand_id,
      model_id,
      variant_id,
      year,
      transmission,
      fuel_type,
      mileage,
      exterior_color_id,
      interior_color_id,
      
      // Location
      province_id,
      city_id,
      location_text,
      
      // Purchase info
      purchase_price,
      purchase_year,
      purchase_from,
      
      // Photos with URLs
      photos,
      
      // Inspection ID if already completed
      inspection_id
    } = body
    
    // Validate required fields
    if (!brand_id || !model_id || !year) {
      return NextResponse.json(
        { success: false, error: 'Brand, model, and year are required' },
        { status: 400 }
      )
    }
    
    if (!photos || photos.length < 5) {
      return NextResponse.json(
        { success: false, error: 'At least 5 photos are required for accurate prediction' },
        { status: 400 }
      )
    }
    
    // Create prediction record
    const { data: prediction, error: predictionError } = await supabase
      .from('ai_predictions')
      .insert({
        user_id,
        dealer_id,
        brand_id,
        model_id,
        variant_id,
        year,
        transmission,
        fuel_type,
        mileage,
        exterior_color_id,
        interior_color_id,
        province_id,
        city_id,
        location_text,
        purchase_price,
        purchase_year,
        purchase_from,
        inspection_id,
        status: 'processing'
      })
      .select()
      .single()
    
    if (predictionError) throw predictionError
    
    // Analyze photos with VLM
    const photoAnalyses = []
    let totalConditionScore = 0
    const allDamages: any[] = []
    
    for (const photo of photos) {
      const analysis = await analyzeCarImage(photo.url, photo.type)
      
      // Save photo analysis
      await supabase
        .from('prediction_photos')
        .insert({
          prediction_id: prediction.id,
          photo_type: photo.type,
          photo_url: photo.url,
          vlm_analyzed: true,
          vlm_analysis: analysis,
          vlm_condition_score: analysis.condition_score || null,
          vlm_detections: analysis.damages || []
        })
      
      photoAnalyses.push({
        type: photo.type,
        analysis
      })
      
      if (analysis.condition_score) {
        totalConditionScore += analysis.condition_score
      }
      
      if (analysis.damages && Array.isArray(analysis.damages)) {
        allDamages.push(...analysis.damages.map((d: string) => ({ photo: photo.type, damage: d })))
      }
    }
    
    // Calculate average condition score
    const avgConditionScore = photos.length > 0 ? totalConditionScore / photos.length : 5
    const conditionGrade = getConditionGrade(avgConditionScore)
    
    // Get inspection data if available
    let inspectionData = null
    if (inspection_id) {
      const { data: insp } = await supabase
        .from('car_inspections')
        .select('*')
        .eq('id', inspection_id)
        .single()
      inspectionData = insp
    }
    
    // Get market data
    const marketData = await getMarketData(brand_id, model_id, variant_id, year, mileage)
    
    // Get seller trust data
    const sellerTrust = await getSellerTrustData(user_id, dealer_id)
    
    // Calculate final prediction
    const predictionResult = calculatePricePrediction({
      year,
      mileage,
      conditionScore: avgConditionScore,
      conditionGrade,
      photoAnalyses,
      damages: allDamages,
      inspectionData,
      marketData,
      sellerTrust,
      province_id
    })
    
    // Save prediction factors
    await savePredictionFactors(prediction.id, predictionResult.factors)
    
    // Update prediction with results
    const { data: updatedPrediction, error: updateError } = await supabase
      .from('ai_predictions')
      .update({
        condition_score: avgConditionScore,
        condition_grade: conditionGrade,
        exterior_grade: photoAnalyses.find(p => p.type.includes('exterior'))?.analysis?.condition || null,
        interior_grade: photoAnalyses.find(p => p.type.includes('interior'))?.analysis?.condition || null,
        vlm_analysis: photoAnalyses,
        vlm_condition_score: avgConditionScore,
        vlm_damages: allDamages,
        vlm_confidence: predictionResult.vlm_confidence,
        inspection_score: inspectionData?.passed_points || null,
        inspection_grade: inspectionData?.overall_grade || null,
        inspection_items_total: inspectionData?.total_points || null,
        inspection_items_passed: inspectionData?.passed_points || null,
        inspection_items_failed: inspectionData?.failed_points || null,
        market_avg_price: marketData.avgPrice,
        market_low_price: marketData.lowPrice,
        market_high_price: marketData.highPrice,
        market_median_price: marketData.medianPrice,
        market_listings_analyzed: marketData.listingsCount,
        market_trend: marketData.trend,
        market_trend_percentage: marketData.trendPercentage,
        market_data_json: marketData,
        seller_type: dealer_id ? 'dealer' : 'user',
        seller_rating: sellerTrust.rating,
        seller_trust_score: sellerTrust.trustScore,
        seller_verified: sellerTrust.verified,
        seller_total_transactions: sellerTrust.totalTransactions,
        seller_trust_adjustment: sellerTrust.adjustment,
        predicted_price_low: predictionResult.priceLow,
        predicted_price_high: predictionResult.priceHigh,
        predicted_price_recommended: predictionResult.priceRecommended,
        prediction_confidence: predictionResult.confidence,
        prediction_factors: predictionResult.factors,
        quick_sale_price: predictionResult.quickSalePrice,
        optimal_price: predictionResult.optimalPrice,
        status: 'completed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days validity
      })
      .eq('id', prediction.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return NextResponse.json({
      success: true,
      data: updatedPrediction
    })
  } catch (error) {
    console.error('Error creating prediction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create prediction', details: String(error) },
      { status: 500 }
    )
  }
}

// Helper functions
function getConditionGrade(score: number): string {
  if (score >= 9.5) return 'A+'
  if (score >= 9.0) return 'A'
  if (score >= 8.5) return 'B+'
  if (score >= 8.0) return 'B'
  if (score >= 7.0) return 'C'
  if (score >= 6.0) return 'D'
  return 'E'
}

async function getMarketData(brandId: string, modelId: string, variantId: string | null, year: number, mileage: number | null) {
  // Get listings from last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  
  let query = supabase
    .from('car_listings')
    .select('price_cash, mileage, year, condition, created_at')
    .eq('brand_id', brandId)
    .eq('model_id', modelId)
    .in('status', ['active', 'sold'])
    .gte('created_at', ninetyDaysAgo)
  
  if (variantId) {
    query = query.eq('variant_id', variantId)
  }
  
  const { data: listings, error } = await query
  
  if (error || !listings || listings.length === 0) {
    // Return default market data based on brand/model
    return {
      avgPrice: null,
      lowPrice: null,
      highPrice: null,
      medianPrice: null,
      listingsCount: 0,
      trend: 'stable',
      trendPercentage: 0,
      source: 'estimated'
    }
  }
  
  const prices = listings
    .filter(l => l.price_cash)
    .map(l => l.price_cash)
    .sort((a, b) => a - b)
  
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const lowPrice = prices[0] || 0
  const highPrice = prices[prices.length - 1] || 0
  const medianPrice = prices[Math.floor(prices.length / 2)] || 0
  
  // Calculate trend (compare last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  
  const recentListings = listings.filter(l => new Date(l.created_at) > thirtyDaysAgo)
  const olderListings = listings.filter(l => {
    const date = new Date(l.created_at)
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  })
  
  const recentAvg = recentListings.length > 0 
    ? recentListings.filter(l => l.price_cash).reduce((sum, l) => sum + (l.price_cash || 0), 0) / recentListings.length 
    : avgPrice
  const olderAvg = olderListings.length > 0 
    ? olderListings.filter(l => l.price_cash).reduce((sum, l) => sum + (l.price_cash || 0), 0) / olderListings.length 
    : avgPrice
  
  const trendPercentage = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
  const trend = trendPercentage > 2 ? 'rising' : trendPercentage < -2 ? 'falling' : 'stable'
  
  return {
    avgPrice,
    lowPrice,
    highPrice,
    medianPrice,
    listingsCount: listings.length,
    trend,
    trendPercentage,
    source: 'actual'
  }
}

async function getSellerTrustData(userId: string | null, dealerId: string | null) {
  if (dealerId) {
    const { data: dealer } = await supabase
      .from('dealers')
      .select('rating, review_count, total_listings, verified')
      .eq('id', dealerId)
      .single()
    
    const rating = dealer?.rating || 0
    const reviewCount = dealer?.review_count || 0
    const verified = dealer?.verified || false
    
    // Calculate trust score (0-100)
    let trustScore = 0
    trustScore += rating * 10 // Max 50 points from rating (5*10)
    trustScore += Math.min(reviewCount * 2, 20) // Max 20 points from reviews
    trustScore += verified ? 20 : 0 // 20 points for verification
    trustScore += Math.min((dealer?.total_listings || 0) * 0.5, 10) // Max 10 points from listings
    
    // Calculate adjustment percentage
    let adjustment = 0
    if (rating >= 4.5) adjustment += 5
    if (verified) adjustment += 3
    if (reviewCount >= 50) adjustment += 2
    
    return {
      rating,
      trustScore,
      verified,
      totalTransactions: dealer?.total_listings || 0,
      adjustment
    }
  } else if (userId) {
    const { data: user } = await supabase
      .from('profiles')
      .select('email_verified, phone_verified')
      .eq('id', userId)
      .single()
    
    const { data: userListings } = await supabase
      .from('car_listings')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'sold')
    
    const soldCount = userListings?.length || 0
    const verified = user?.email_verified && user?.phone_verified
    
    // Calculate trust score
    let trustScore = 0
    trustScore += verified ? 30 : 0
    trustScore += Math.min(soldCount * 10, 40)
    trustScore += 30 // Base score for registered user
    
    let adjustment = 0
    if (verified) adjustment += 2
    if (soldCount >= 3) adjustment += 1
    
    return {
      rating: null,
      trustScore,
      verified,
      totalTransactions: soldCount,
      adjustment
    }
  }
  
  return {
    rating: null,
    trustScore: 0,
    verified: false,
    totalTransactions: 0,
    adjustment: 0
  }
}

function calculatePricePrediction(params: {
  year: number
  mileage: number | null
  conditionScore: number
  conditionGrade: string
  photoAnalyses: any[]
  damages: any[]
  inspectionData: any
  marketData: any
  sellerTrust: any
  province_id: string | null
}) {
  const { year, mileage, conditionScore, conditionGrade, damages, inspectionData, marketData, sellerTrust } = params
  
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - year
  
  // Base price from market data
  let basePrice = marketData.avgPrice || marketData.medianPrice || 0
  
  // If no market data, we need to estimate (this would typically come from price guides)
  if (!basePrice) {
    // This is a fallback - in production you'd want actual price guides
    basePrice = 200000000 // Default fallback
  }
  
  // Factor adjustments
  const factors: any[] = []
  
  // 1. Condition adjustment (-20% to +10%)
  const conditionAdjustment = calculateConditionAdjustment(conditionScore, conditionGrade)
  factors.push({
    category: 'condition',
    name: 'Vehicle Condition',
    value: conditionGrade,
    impact_type: conditionAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: conditionAdjustment,
    description: `Condition grade ${conditionGrade} based on ${Math.round(conditionScore * 10)}/100 inspection`
  })
  
  // 2. Mileage adjustment
  const mileageAdjustment = calculateMileageAdjustment(mileage, vehicleAge)
  factors.push({
    category: 'vehicle',
    name: 'Mileage',
    value: mileage ? `${mileage.toLocaleString()} km` : 'Unknown',
    impact_type: mileageAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: mileageAdjustment,
    description: mileage ? `Average annual usage: ${Math.round((mileage / (vehicleAge || 1)))} km/year` : 'Mileage not provided'
  })
  
  // 3. Damage adjustment
  const damageAdjustment = calculateDamageAdjustment(damages)
  if (damages.length > 0) {
    factors.push({
      category: 'condition',
      name: 'Detected Damages',
      value: `${damages.length} issues`,
      impact_type: 'negative',
      impact_percentage: damageAdjustment,
      description: damages.map(d => d.damage).join(', ')
    })
  }
  
  // 4. Inspection adjustment (if available)
  let inspectionAdjustment = 0
  if (inspectionData) {
    inspectionAdjustment = calculateInspectionAdjustment(inspectionData)
    factors.push({
      category: 'inspection',
      name: 'Inspection Score',
      value: `${inspectionData.passed_points}/${inspectionData.total_points}`,
      impact_type: inspectionAdjustment >= 0 ? 'positive' : 'negative',
      impact_percentage: inspectionAdjustment,
      description: `Grade: ${inspectionData.overall_grade}, Risk: ${inspectionData.risk_level}`
    })
  }
  
  // 5. Market trend adjustment
  const marketTrendAdjustment = marketData.trend === 'rising' ? 3 : marketData.trend === 'falling' ? -3 : 0
  factors.push({
    category: 'market',
    name: 'Market Trend',
    value: marketData.trend,
    impact_type: marketTrendAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: marketTrendAdjustment,
    description: `Prices ${marketData.trend} ${Math.abs(marketData.trendPercentage).toFixed(1)}% in last 30 days`
  })
  
  // 6. Seller trust adjustment
  if (sellerTrust.adjustment > 0) {
    factors.push({
      category: 'seller',
      name: 'Seller Rating',
      value: sellerTrust.rating ? `${sellerTrust.rating}/5` : 'Verified',
      impact_type: 'positive',
      impact_percentage: sellerTrust.adjustment,
      description: `Trust score: ${sellerTrust.trustScore}/100, Verified: ${sellerTrust.verified}`
    })
  }
  
  // Calculate total adjustment
  const totalAdjustment = conditionAdjustment + mileageAdjustment + damageAdjustment + inspectionAdjustment + marketTrendAdjustment + sellerTrust.adjustment
  
  // Calculate predicted prices
  const adjustmentMultiplier = 1 + (totalAdjustment / 100)
  const priceRecommended = Math.round(basePrice * adjustmentMultiplier)
  
  // Price range (±10%)
  const priceLow = Math.round(priceRecommended * 0.90)
  const priceHigh = Math.round(priceRecommended * 1.10)
  
  // Quick sale price (15% below recommended)
  const quickSalePrice = Math.round(priceRecommended * 0.85)
  
  // Optimal price (5% above recommended)
  const optimalPrice = Math.round(priceRecommended * 1.05)
  
  // Calculate confidence
  let confidence = 70 // Base confidence
  if (marketData.source === 'actual') confidence += 10
  if (inspectionData) confidence += 10
  if (params.photoAnalyses.length >= 7) confidence += 5
  confidence = Math.min(confidence, 95)
  
  return {
    priceLow,
    priceHigh,
    priceRecommended,
    quickSalePrice,
    optimalPrice,
    confidence,
    vlm_confidence: Math.min(conditionScore * 10, 95),
    factors
  }
}

function calculateConditionAdjustment(score: number, grade: string): number {
  const adjustments: Record<string, number> = {
    'A+': 10,
    'A': 8,
    'B+': 5,
    'B': 2,
    'C': -5,
    'D': -10,
    'E': -20
  }
  return adjustments[grade] || 0
}

function calculateMileageAdjustment(mileage: number | null, age: number): number {
  if (!mileage) return -2 // Penalty for unknown mileage
  
  const annualMileage = mileage / (age || 1)
  
  if (annualMileage < 10000) return 5 // Low mileage bonus
  if (annualMileage < 15000) return 2 // Below average
  if (annualMileage < 20000) return 0 // Average
  if (annualMileage < 25000) return -3 // Above average
  return -8 // High mileage penalty
}

function calculateDamageAdjustment(damages: any[]): number {
  if (damages.length === 0) return 0
  
  // Each damage reduces price by 1-3%
  return Math.min(damages.length * -2, -15)
}

function calculateInspectionAdjustment(inspection: any): number {
  const score = (inspection.passed_points / inspection.total_points) * 100
  
  if (score >= 95) return 8
  if (score >= 90) return 5
  if (score >= 85) return 3
  if (score >= 80) return 1
  if (score >= 70) return -3
  if (score >= 60) return -8
  return -15
}

async function savePredictionFactors(predictionId: string, factors: any[]) {
  const insertData = factors.map(f => ({
    prediction_id: predictionId,
    factor_category: f.category,
    factor_name: f.name,
    factor_value: f.value,
    impact_type: f.impact_type,
    impact_percentage: f.impact_percentage,
    impact_amount: null, // Could calculate based on base price
    weight: 1,
    score: null,
    description: f.description
  }))
  
  await supabase
    .from('prediction_factors')
    .insert(insertData)
}
