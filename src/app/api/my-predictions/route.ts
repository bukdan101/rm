import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const predictions: Array<{
      id: string
      year: number
      predicted_price_min: number
      predicted_price_max: number
      confidence_score: number
      inspection_grade: string | null
      inspection_score: number | null
      status: string
      created_at: string
      expires_at: string | null
      listing_created: boolean
      brand: { name: string } | null
      model: { name: string } | null
      variant: { name: string } | null
    }> = []

    // 1. Fetch AI price analysis from inspections
    const aiAnalysis = await db.aiPriceAnalysis.findMany({
      where: {
        listing: {
          user_id: userId,
        },
      },
      select: {
        id: true,
        estimated_price_min: true,
        estimated_price_max: true,
        recommended_price: true,
        condition_score: true,
        market_demand: true,
        days_to_sell_estimate: true,
        profit_margin_percent: true,
        created_at: true,
        car_listing_id: true,
        listing: {
          select: {
            id: true,
            year: true,
            price_cash: true,
            user_id: true,
            brand_id: true,
            model_id: true,
            variant_id: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
            variant: { select: { name: true } },
            inspection: {
              select: { overall_grade: true, inspection_score: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Process AI analysis results
    if (aiAnalysis && aiAnalysis.length > 0) {
      for (const analysis of aiAnalysis) {
        const listing = analysis.listing
        if (!listing) continue

        const inspection = listing.inspection

        predictions.push({
          id: analysis.id,
          year: listing.year || new Date().getFullYear(),
          predicted_price_min: analysis.estimated_price_min || 0,
          predicted_price_max: analysis.estimated_price_max || 0,
          confidence_score: analysis.condition_score || 0,
          inspection_grade: inspection?.overall_grade || null,
          inspection_score: inspection?.inspection_score || null,
          status: 'completed',
          created_at: analysis.created_at.toISOString(),
          expires_at: null,
          listing_created: true,
          brand: listing.brand,
          model: listing.model,
          variant: listing.variant,
        })
      }
    }

    // 2. Also fetch user's listings without inspections and create sample predictions
    const userListings = await db.carListing.findMany({
      where: {
        user_id: userId,
        status: { not: 'deleted' },
      },
      select: {
        id: true,
        year: true,
        price_cash: true,
        created_at: true,
        brand: { select: { name: true } },
        model: { select: { name: true } },
        variant: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    // Create sample predictions for listings without inspections
    if (userListings && userListings.length > 0) {
      // Get listing IDs that already have AI analysis
      const analyzedListingIds = new Set(
        aiAnalysis.map(a => a.car_listing_id).filter(Boolean)
      )

      for (const listing of userListings) {
        // Skip if already has AI analysis
        if (analyzedListingIds.has(listing.id)) continue

        const basePrice = listing.price_cash || 0

        const variancePercent = 0.1 + Math.random() * 0.1
        const predicted_price_min = Math.round(basePrice * (1 - variancePercent))
        const predicted_price_max = Math.round(basePrice * (1 + variancePercent))
        const confidence_score = 70 + Math.round(Math.random() * 20)

        predictions.push({
          id: `listing-${listing.id}`,
          year: listing.year || new Date().getFullYear(),
          predicted_price_min,
          predicted_price_max,
          confidence_score,
          inspection_grade: null,
          inspection_score: null,
          status: 'sample',
          created_at: listing.created_at.toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          listing_created: true,
          brand: listing.brand,
          model: listing.model,
          variant: listing.variant,
        })
      }
    }

    // Sort by created_at descending
    predictions.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      predictions,
    })
  } catch (error) {
    console.error('My predictions error:', error)
    return NextResponse.json({ success: true, predictions: [] })
  }
}
