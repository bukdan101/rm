import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  autoRejectOffersForListing, 
  handleStatusChange, 
  handleVisibilityChange 
} from '@/lib/dealer-offer-service'
import { v4 as uuidv4 } from 'uuid'

// Default fallback values (used if database fetch fails)
const DEFAULT_MARKETPLACE_COSTS: Record<string, number> = {
  marketplace_umum: 3,
  dealer_marketplace: 5,
  chat_platform: 4,
  public: 3,
  dealer: 5,
  both: 8
}

const DEFAULT_TOKEN_VALUE = 10000

// Calculate token cost for a visibility type
function calculateVisibilityCost(
  visibility: string,
  marketplaceCosts: Record<string, number>
): number {
  if (visibility === 'both') {
    return (marketplaceCosts['marketplace_umum'] || 3) + (marketplaceCosts['dealer_marketplace'] || 5)
  } else if (visibility === 'public') {
    return marketplaceCosts['marketplace_umum'] || marketplaceCosts['public'] || 3
  } else if (visibility === 'dealer_marketplace') {
    return marketplaceCosts['dealer_marketplace'] || marketplaceCosts['dealer'] || 5
  }
  return 0
}

// Fetch token settings from database
async function getTokenSettings(): Promise<{
  marketplaceCosts: Record<string, number>
  tokenValue: number
}> {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('token_settings')
      .select('key, tokens, is_active, category')
      .eq('is_active', true)
    
    if (error || !settings) {
      return {
        marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
        tokenValue: DEFAULT_TOKEN_VALUE
      }
    }

    const marketplaceCosts: Record<string, number> = { ...DEFAULT_MARKETPLACE_COSTS }
    let tokenValue = DEFAULT_TOKEN_VALUE

    settings.forEach((row: any) => {
      if (row.category === 'listing') {
        marketplaceCosts[row.key] = row.tokens
      } else if (row.key === 'token_value_rupiah') {
        tokenValue = row.tokens
      }
    })

    return { marketplaceCosts, tokenValue }
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return {
      marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
      tokenValue: DEFAULT_TOKEN_VALUE
    }
  }
}

// GET - Get listing detail by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get listing by ID or slug
    const { data: listing, error } = await supabaseAdmin
      .from('car_listings')
      .select(`
        *,
        brand:brands(id, name, slug, logo_url),
        model:car_models(id, name, slug, body_type),
        variant:car_variants(id, name, transmission, fuel_type),
        exterior_color:car_colors!car_listings_exterior_color_id_fkey(id, name, hex_code),
        interior_color:car_colors!car_listings_interior_color_id_fkey(id, name, hex_code),
        images:car_images(id, image_url, is_primary, display_order),
        documents:car_documents(*),
        features:car_features(*)
      `)
      .or(`slug.eq.${id},id.eq.${id}`)
      .is('deleted_at', null)
      .single()

    if (error || !listing) {
      console.error('Listing fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'Listing tidak ditemukan'
      }, { status: 404 })
    }

    // Get seller info
    let seller = null
    if (listing.seller_id) {
      const { data: sellerData } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone, avatar_url, is_verified, city, province')
        .eq('id', listing.seller_id)
        .single()
      seller = sellerData
    }

    // Get dealer info if listing belongs to dealer
    let dealer = null
    if (listing.dealer_id) {
      const { data: dealerData } = await supabaseAdmin
        .from('dealers')
        .select(`
          id, name, slug, logo_url, cover_url, description,
          phone, whatsapp, email, website, instagram,
          address, verified, rating, review_count, subscription_tier
        `)
        .eq('id', listing.dealer_id)
        .single()
      dealer = dealerData
    }

    // Get inspection if exists
    const { data: inspection } = await supabaseAdmin
      .from('car_inspections')
      .select(`
        id,
        inspector_name,
        inspection_place,
        inspection_date,
        total_points,
        passed_points,
        accident_free,
        flood_free,
        fire_free,
        risk_level,
        overall_score,
        status,
        created_at,
        results:inspection_results(
          id,
          status,
          notes,
          image_url,
          item:inspection_items(id, category, name, description, display_order)
        )
      `)
      .eq('car_listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Group inspection results by category
    let inspectionByCategory = null
    let inspectionStats = null
    if (inspection && inspection.results) {
      const grouped: Record<string, any[]> = {}
      for (const result of inspection.results) {
        const category = result.item?.category || 'Lainnya'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(result)
      }
      inspectionByCategory = grouped

      // Calculate stats
      const total = inspection.results.length
      const passed = inspection.results.filter((r: any) => r.status === 'baik' || r.status === 'istimewa').length
      const needRepair = inspection.results.filter((r: any) => r.status === 'perlu_perbaikan').length
      const notRelated = inspection.results.filter((r: any) => r.status === 'tidak_berkaitan').length

      inspectionStats = {
        total,
        passed,
        needRepair,
        notRelated,
        passedPercentage: total > 0 ? Math.round((passed / total) * 100) : 0
      }
    }

    // Increment view count
    await supabaseAdmin
      .from('car_listings')
      .update({ view_count: (listing.view_count || 0) + 1 })
      .eq('id', listing.id)

    // Sort images by display_order
    const sortedImages = listing.images?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || []

    return NextResponse.json({
      success: true,
      listing: {
        ...listing,
        images: sortedImages,
        seller,
        dealer,
        inspection: inspection ? {
          ...inspection,
          results_by_category: inspectionByCategory,
          stats: inspectionStats
        } : null
      }
    })
  } catch (error: any) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT - Update listing (including status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get current listing data to compare changes
    const { data: currentListing, error: fetchError } = await supabaseAdmin
      .from('car_listings')
      .select('id, status, visibility, user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !currentListing) {
      return NextResponse.json({
        success: false,
        error: 'Listing tidak ditemukan'
      }, { status: 404 })
    }
    
    const oldStatus = currentListing.status
    const oldVisibility = currentListing.visibility || 'public'
    const newStatus = body.status
    const newVisibility = body.visibility
    const userId = currentListing.user_id
    
    // Check if visibility is being upgraded (requires additional tokens)
    let tokenChargeResult = null
    if (newVisibility && newVisibility !== oldVisibility && userId) {
      const { marketplaceCosts, tokenValue } = await getTokenSettings()
      
      const oldCost = calculateVisibilityCost(oldVisibility, marketplaceCosts)
      const newCost = calculateVisibilityCost(newVisibility, marketplaceCosts)
      const additionalCost = newCost - oldCost
      
      // Only charge if upgrading (new cost > old cost)
      if (additionalCost > 0) {
        // Check user's credit balance
        const { data: userCredits, error: creditsError } = await supabaseAdmin
          .from('user_credits')
          .select('balance, total_spent')
          .eq('user_id', userId)
          .single()
        
        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error('Error fetching user credits:', creditsError)
        }
        
        const currentBalance = userCredits?.balance || 0
        
        if (currentBalance < additionalCost) {
          return NextResponse.json({
            success: false,
            error: 'Insufficient token balance for visibility upgrade',
            required: additionalCost,
            required_rupiah: additionalCost * tokenValue,
            available: currentBalance,
            available_rupiah: currentBalance * tokenValue
          }, { status: 400 })
        }
        
        // Deduct tokens
        const newBalance = currentBalance - additionalCost
        const { error: updateError } = await supabaseAdmin
          .from('user_credits')
          .update({
            balance: newBalance,
            total_spent: (userCredits?.total_spent || 0) + additionalCost,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
        
        if (updateError) {
          console.error('Error deducting tokens:', updateError)
          return NextResponse.json({
            success: false,
            error: 'Failed to process token payment'
          }, { status: 500 })
        }
        
        // Record transaction
        await supabaseAdmin
          .from('credit_transactions')
          .insert({
            id: uuidv4(),
            user_id: userId,
            type: 'spend',
            amount: -additionalCost,
            balance_after: newBalance,
            description: `Upgraded listing visibility: ${oldVisibility} → ${newVisibility}`,
            reference_type: 'listing_upgrade',
            reference_id: id
          })
        
        tokenChargeResult = {
          charged: additionalCost,
          new_balance: newBalance,
          upgrade: `${oldVisibility} → ${newVisibility}`
        }
      }
      // Note: No refund for downgrading visibility
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Add fields from body
    const allowedFields = [
      'title', 'description', 'price_cash', 'price_negotiable',
      'mileage', 'condition', 'transmission', 'fuel', 'body_type',
      'city', 'province', 'phone', 'whatsapp', 'status', 'visibility',
      'brand_id', 'model_id', 'variant_id', 'exterior_color_id',
      'year', 'engine_capacity', 'seat_count', 'vin_number', 'plate_number'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Handle status-specific fields
    if (newStatus === 'sold') {
      updateData.sold_at = new Date().toISOString()
    }
    
    // Update the listing
    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('car_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating listing:', updateError)
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 })
    }
    
    // Handle auto-rejection of dealer offers if status changed
    let autoRejectResult = null
    if (newStatus && newStatus !== oldStatus) {
      autoRejectResult = await handleStatusChange(id, newStatus)
    }
    
    // Handle auto-rejection if visibility changed away from dealer marketplace
    let visibilityRejectResult = null
    if (newVisibility && newVisibility !== oldVisibility) {
      visibilityRejectResult = await handleVisibilityChange(id, oldVisibility, newVisibility)
    }
    
    return NextResponse.json({
      success: true,
      listing: updatedListing,
      tokenCharge: tokenChargeResult,
      autoRejectResult: autoRejectResult || visibilityRejectResult || undefined
    })
  } catch (error: any) {
    console.error('Error updating listing:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// DELETE - Soft delete listing (set deleted_at)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get current listing data
    const { data: currentListing, error: fetchError } = await supabaseAdmin
      .from('car_listings')
      .select('id, status, visibility, user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !currentListing) {
      return NextResponse.json({
        success: false,
        error: 'Listing tidak ditemukan'
      }, { status: 404 })
    }
    
    // Soft delete by setting deleted_at
    const { error: deleteError } = await supabaseAdmin
      .from('car_listings')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting listing:', deleteError)
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 })
    }
    
    // Auto-reject all pending dealer offers
    const autoRejectResult = await autoRejectOffersForListing(id, 'listing_deleted')
    
    return NextResponse.json({
      success: true,
      message: 'Listing berhasil dihapus',
      autoRejectResult
    })
  } catch (error: any) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
