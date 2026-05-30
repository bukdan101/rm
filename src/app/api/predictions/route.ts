import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import ZAI from 'z-ai-web-dev-sdk'
import { errorResponse } from '@/lib/api-utils'

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

Return as JSON: {"mileage": X, "unit": "km/miles", "display_condition": "...", "tampering_signs": [], "confidence": "high/medium/low"}`,
  }

  const prompt = prompts[photoType] || prompts.exterior_front

  try {
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const content = response.choices[0]?.message?.content || '{}'

    try {
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
      const data = await db.aiPrediction.findUnique({
        where: { id },
        include: {
          photos: true,
          factors: true,
        },
      })

      return NextResponse.json({ success: true, data })
    }

    // List predictions
    const where: Record<string, unknown> = {}
    if (userId) where.user_id = userId
    if (dealerId) where.dealer_id = dealerId
    if (status) where.status = status

    const [data, count] = await Promise.all([
      db.aiPrediction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.aiPrediction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return errorResponse('Failed to fetch predictions', 500)
  }
}

// POST - Create new prediction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
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
      photos,
      inspection_id,
    } = body

    // Validate required fields
    if (!brand_id || !model_id || !year) {
      return errorResponse('Brand, model, and year are required', 400)
    }

    if (!photos || photos.length < 5) {
      return errorResponse('At least 5 photos are required for accurate prediction', 400)
    }

    // Create prediction record
    const prediction = await db.aiPrediction.create({
      data: {
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
        status: 'processing',
      },
    })

    // Analyze photos with VLM
    const photoAnalyses: Array<{ type: string; analysis: Record<string, unknown> }> = []
    let totalConditionScore = 0
    const allDamages: Array<{ photo: string; damage: string }> = []

    for (const photo of photos) {
      const analysis = await analyzeCarImage(photo.url, photo.type)

      // Save photo analysis
      await db.predictionPhoto.create({
        data: {
          prediction_id: prediction.id,
          photo_type: photo.type,
          photo_url: photo.url,
          vlm_analyzed: true,
          vlm_analysis: analysis,
          vlm_condition_score: (analysis as Record<string, unknown>).condition_score as number || null,
          vlm_detections: (analysis as Record<string, unknown>).damages as string[] || [],
        },
      })

      photoAnalyses.push({
        type: photo.type,
        analysis,
      })

      if ((analysis as Record<string, unknown>).condition_score) {
        totalConditionScore += (analysis as Record<string, unknown>).condition_score as number
      }

      if ((analysis as Record<string, unknown>).damages && Array.isArray((analysis as Record<string, unknown>).damages)) {
        allDamages.push(
          ...((analysis as Record<string, unknown>).damages as string[]).map((d: string) => ({
            photo: photo.type,
            damage: d,
          }))
        )
      }
    }

    // Calculate average condition score
    const avgConditionScore = photos.length > 0 ? totalConditionScore / photos.length : 5
    const conditionGrade = getConditionGrade(avgConditionScore)

    // Get inspection data if available
    let inspectionData: Record<string, unknown> | null = null
    if (inspection_id) {
      const insp = await db.carInspection.findUnique({
        where: { id: inspection_id },
      })
      inspectionData = insp as unknown as Record<string, unknown>
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
      province_id,
    })

    // Save prediction factors
    await savePredictionFactors(prediction.id, predictionResult.factors)

    // Update prediction with results
    const updatedPrediction = await db.aiPrediction.update({
      where: { id: prediction.id },
      data: {
        condition_score: avgConditionScore,
        condition_grade: conditionGrade,
        exterior_grade: photoAnalyses.find(p => p.type.includes('exterior'))?.analysis?.condition as string || null,
        interior_grade: photoAnalyses.find(p => p.type.includes('interior'))?.analysis?.condition as string || null,
        vlm_analysis: photoAnalyses as unknown as string,
        vlm_condition_score: avgConditionScore,
        vlm_damages: allDamages as unknown as string,
        vlm_confidence: predictionResult.vlm_confidence,
        inspection_score: (inspectionData?.passed_points as number) || (inspectionData?.inspection_score as number) || null,
        inspection_grade: inspectionData?.overall_grade as string || null,
        inspection_items_total: inspectionData?.total_points as number || null,
        inspection_items_passed: inspectionData?.passed_points as number || null,
        inspection_items_failed: inspectionData?.failed_points as number || null,
        market_avg_price: marketData.avgPrice,
        market_low_price: marketData.lowPrice,
        market_high_price: marketData.highPrice,
        market_median_price: marketData.medianPrice,
        market_listings_analyzed: marketData.listingsCount,
        market_trend: marketData.trend,
        market_trend_percentage: marketData.trendPercentage,
        market_data_json: marketData as unknown as string,
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
        prediction_factors: predictionResult.factors as unknown as string,
        quick_sale_price: predictionResult.quickSalePrice,
        optimal_price: predictionResult.optimalPrice,
        status: 'completed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPrediction,
    })
  } catch (error) {
    console.error('Error creating prediction:', error)
    return errorResponse('Failed to create prediction', 500)
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

async function getMarketData(
  brandId: number,
  modelId: number,
  _variantId: number | null,
  year: number,
  _mileage: number | null
) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const where: Record<string, unknown> = {
    brand_id: brandId,
    status: { in: ['active', 'sold'] },
    created_at: { gte: ninetyDaysAgo },
  }

  const listings = await db.carListing.findMany({
    where,
    select: { price_cash: true, mileage: true, year: true, created_at: true },
  })

  if (!listings || listings.length === 0) {
    return {
      avgPrice: null,
      lowPrice: null,
      highPrice: null,
      medianPrice: null,
      listingsCount: 0,
      trend: 'stable',
      trendPercentage: 0,
      source: 'estimated',
    }
  }

  const prices = listings
    .filter(l => l.price_cash)
    .map(l => l.price_cash!)
    .sort((a, b) => a - b)

  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const lowPrice = prices[0] || 0
  const highPrice = prices[prices.length - 1] || 0
  const medianPrice = prices[Math.floor(prices.length / 2)] || 0

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
    source: 'actual',
  }
}

async function getSellerTrustData(
  userId: string | null,
  dealerId: string | null
) {
  if (dealerId) {
    const dealer = await db.dealer.findUnique({
      where: { id: dealerId },
      select: { rating: true, review_count: true, total_listings: true, verified: true },
    })

    const rating = dealer?.rating || 0
    const reviewCount = dealer?.review_count || 0
    const verified = dealer?.verified || false

    let trustScore = 0
    trustScore += rating * 10
    trustScore += Math.min(reviewCount * 2, 20)
    trustScore += verified ? 20 : 0
    trustScore += Math.min((dealer?.total_listings || 0) * 0.5, 10)

    let adjustment = 0
    if (rating >= 4.5) adjustment += 5
    if (verified) adjustment += 3
    if (reviewCount >= 50) adjustment += 2

    return {
      rating,
      trustScore,
      verified,
      totalTransactions: dealer?.total_listings || 0,
      adjustment,
    }
  } else if (userId) {
    const user = await db.profile.findUnique({
      where: { id: userId },
      select: { is_verified: true },
    })

    const userListings = await db.carListing.findMany({
      where: { user_id: userId, status: 'sold' },
      select: { id: true },
    })

    const soldCount = userListings.length
    const verified = user?.is_verified || false

    let trustScore = 0
    trustScore += verified ? 30 : 0
    trustScore += Math.min(soldCount * 10, 40)
    trustScore += 30

    let adjustment = 0
    if (verified) adjustment += 2
    if (soldCount >= 3) adjustment += 1

    return {
      rating: null,
      trustScore,
      verified,
      totalTransactions: soldCount,
      adjustment,
    }
  }

  return {
    rating: null,
    trustScore: 0,
    verified: false,
    totalTransactions: 0,
    adjustment: 0,
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

  let basePrice = marketData.avgPrice || marketData.medianPrice || 0

  if (!basePrice) {
    basePrice = 200000000
  }

  const factors: any[] = []

  const conditionAdjustment = calculateConditionAdjustment(conditionScore, conditionGrade)
  factors.push({
    category: 'condition',
    name: 'Vehicle Condition',
    value: conditionGrade,
    impact_type: conditionAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: conditionAdjustment,
    description: `Condition grade ${conditionGrade} based on ${Math.round(conditionScore * 10)}/100 inspection`,
  })

  const mileageAdjustment = calculateMileageAdjustment(mileage, vehicleAge)
  factors.push({
    category: 'vehicle',
    name: 'Mileage',
    value: mileage ? `${mileage.toLocaleString()} km` : 'Unknown',
    impact_type: mileageAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: mileageAdjustment,
    description: mileage ? `Average annual usage: ${Math.round(mileage / (vehicleAge || 1))} km/year` : 'Mileage not provided',
  })

  const damageAdjustment = calculateDamageAdjustment(damages)
  if (damages.length > 0) {
    factors.push({
      category: 'condition',
      name: 'Detected Damages',
      value: `${damages.length} issues`,
      impact_type: 'negative',
      impact_percentage: damageAdjustment,
      description: damages.map((d: any) => d.damage).join(', '),
    })
  }

  let inspectionAdjustment = 0
  if (inspectionData) {
    inspectionAdjustment = calculateInspectionAdjustment(inspectionData)
    factors.push({
      category: 'inspection',
      name: 'Inspection Score',
      value: `${inspectionData.passed_points || inspectionData.inspection_score}/${inspectionData.total_points}`,
      impact_type: inspectionAdjustment >= 0 ? 'positive' : 'negative',
      impact_percentage: inspectionAdjustment,
      description: `Grade: ${inspectionData.overall_grade}, Risk: ${inspectionData.risk_level}`,
    })
  }

  const marketTrendAdjustment = marketData.trend === 'rising' ? 3 : marketData.trend === 'falling' ? -3 : 0
  factors.push({
    category: 'market',
    name: 'Market Trend',
    value: marketData.trend,
    impact_type: marketTrendAdjustment >= 0 ? 'positive' : 'negative',
    impact_percentage: marketTrendAdjustment,
    description: `Prices ${marketData.trend} ${Math.abs(marketData.trendPercentage).toFixed(1)}% in last 30 days`,
  })

  if (sellerTrust.adjustment > 0) {
    factors.push({
      category: 'seller',
      name: 'Seller Rating',
      value: sellerTrust.rating ? `${sellerTrust.rating}/5` : 'Verified',
      impact_type: 'positive',
      impact_percentage: sellerTrust.adjustment,
      description: `Trust score: ${sellerTrust.trustScore}/100, Verified: ${sellerTrust.verified}`,
    })
  }

  const totalAdjustment = conditionAdjustment + mileageAdjustment + damageAdjustment + inspectionAdjustment + marketTrendAdjustment + sellerTrust.adjustment

  const adjustmentMultiplier = 1 + totalAdjustment / 100
  const priceRecommended = Math.round(basePrice * adjustmentMultiplier)

  const priceLow = Math.round(priceRecommended * 0.90)
  const priceHigh = Math.round(priceRecommended * 1.10)
  const quickSalePrice = Math.round(priceRecommended * 0.85)
  const optimalPrice = Math.round(priceRecommended * 1.05)

  let confidence = 70
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
    factors,
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
    'E': -20,
  }
  return adjustments[grade] || 0
}

function calculateMileageAdjustment(mileage: number | null, age: number): number {
  if (!mileage) return -2
  const annualMileage = mileage / (age || 1)
  if (annualMileage < 10000) return 5
  if (annualMileage < 15000) return 2
  if (annualMileage < 20000) return 0
  if (annualMileage < 25000) return -3
  return -8
}

function calculateDamageAdjustment(damages: any[]): number {
  if (damages.length === 0) return 0
  return Math.min(damages.length * -2, -15)
}

function calculateInspectionAdjustment(inspection: any): number {
  const passedPoints = inspection.passed_points ?? inspection.inspection_score ?? 0
  const totalPoints = inspection.total_points ?? 160
  const score = (passedPoints / totalPoints) * 100

  if (score >= 95) return 8
  if (score >= 90) return 5
  if (score >= 85) return 3
  if (score >= 80) return 1
  if (score >= 70) return -3
  if (score >= 60) return -8
  return -15
}

async function savePredictionFactors(
  predictionId: string,
  factors: any[]
) {
  const insertData = factors.map(f => ({
    prediction_id: predictionId,
    factor_category: f.category,
    factor_name: f.name,
    factor_value: f.value,
    impact_type: f.impact_type,
    impact_percentage: f.impact_percentage,
    impact_amount: null,
    weight: 1,
    score: null,
    description: f.description,
  }))

  await db.predictionFactor.createMany({
    data: insertData,
  })
}
