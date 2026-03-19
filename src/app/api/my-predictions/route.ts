import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
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
    const { data: aiAnalysis, error: aiError } = await supabase
      .from('ai_price_analysis')
      .select(`
        id,
        estimated_price_min,
        estimated_price_max,
        recommended_price,
        condition_score,
        market_demand,
        days_to_sell_estimate,
        profit_margin_percent,
        created_at,
        car_listing_id,
        car_listings (
          id,
          year,
          price_cash,
          user_id,
          brand_id,
          model_id,
          variant_id,
          brands ( name ),
          car_models ( name ),
          car_variants ( name )
        ),
        car_inspections (
          overall_grade,
          inspection_score
        )
      `)
      .order('created_at', { ascending: false })

    if (aiError) {
      console.error('Error fetching AI analysis:', aiError)
    }

    // Process AI analysis results - only include user's own listings
    if (aiAnalysis && aiAnalysis.length > 0) {
      for (const analysis of aiAnalysis) {
        const listing = analysis.car_listings as {
          id?: string
          year?: number
          price_cash?: number
          user_id?: string
          brand_id?: string
          model_id?: string
          variant_id?: string
          brands?: { name: string }
          car_models?: { name: string }
          car_variants?: { name: string }
        } | null

        // Only include predictions for user's own listings
        if (listing && listing.user_id === user.id) {
          const inspection = Array.isArray(analysis.car_inspections) 
            ? analysis.car_inspections[0] 
            : analysis.car_inspections as { overall_grade?: string; inspection_score?: number } | null
          
          predictions.push({
            id: analysis.id,
            year: listing.year || new Date().getFullYear(),
            predicted_price_min: analysis.estimated_price_min || 0,
            predicted_price_max: analysis.estimated_price_max || 0,
            confidence_score: analysis.condition_score || 0,
            inspection_grade: inspection?.overall_grade || null,
            inspection_score: inspection?.inspection_score || null,
            status: 'completed',
            created_at: analysis.created_at,
            expires_at: null,
            listing_created: true, // Already has a listing
            brand: listing.brands || null,
            model: listing.car_models || null,
            variant: listing.car_variants || null
          })
        }
      }
    }

    // 2. Also fetch user's listings without inspections and create sample predictions
    const { data: userListings, error: listingsError } = await supabase
      .from('car_listings')
      .select(`
        id,
        year,
        price_cash,
        created_at,
        brand:brands(name),
        model:car_models(name),
        variant:car_variants(name)
      `)
      .eq('user_id', user.id)
      .not('status', 'eq', 'deleted')
      .order('created_at', { ascending: false })

    if (listingsError) {
      console.error('Error fetching user listings:', listingsError)
    }

    // Create sample predictions for listings without inspections
    if (userListings && userListings.length > 0) {
      // Get listing IDs that already have AI analysis
      const analyzedListingIds = new Set(
        (aiAnalysis || [])
          .map((a: { car_listing_id?: string }) => a.car_listing_id)
          .filter(Boolean)
      )

      for (const listing of userListings) {
        // Skip if already has AI analysis
        if (analyzedListingIds.has(listing.id)) continue

        const basePrice = listing.price_cash || 0
        
        // Generate sample prediction based on listing price (simulated AI prediction)
        // In real scenario, this would call an actual AI model
        const variancePercent = 0.1 + (Math.random() * 0.1) // 10-20% variance
        const predicted_price_min = Math.round(basePrice * (1 - variancePercent))
        const predicted_price_max = Math.round(basePrice * (1 + variancePercent))
        const confidence_score = 70 + Math.round(Math.random() * 20) // 70-90% confidence

        predictions.push({
          id: `listing-${listing.id}`,
          year: listing.year || new Date().getFullYear(),
          predicted_price_min,
          predicted_price_max,
          confidence_score,
          inspection_grade: null,
          inspection_score: null,
          status: 'sample', // Mark as sample prediction
          created_at: listing.created_at,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          listing_created: true,
          brand: listing.brand as { name: string } | null,
          model: listing.model as { name: string } | null,
          variant: listing.variant as { name: string } | null
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
