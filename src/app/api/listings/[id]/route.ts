import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
    const settings = await db.tokenSetting.findFirst({
      where: { is_active: true }
    })
    
    if (!settings) {
      return {
        marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
        tokenValue: DEFAULT_TOKEN_VALUE
      }
    }

    const marketplaceCosts: Record<string, number> = {
      marketplace_umum: settings.listing_normal_tokens,
      dealer_marketplace: settings.listing_dealer_tokens,
      chat_platform: settings.dealer_contact_tokens,
      public: settings.listing_normal_tokens,
      dealer: settings.listing_dealer_tokens,
      both: settings.listing_normal_tokens + settings.listing_dealer_tokens
    }
    const tokenValue = settings.token_price_base

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
    const listing = await db.carListing.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        deleted_at: null
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true } },
        model: { select: { id: true, name: true, slug: true, body_type: true } },
        variant: { select: { id: true, name: true, transmission: true, fuel_type: true } },
        exteriorColor: { select: { id: true, name: true, hex_code: true } },
        interiorColor: { select: { id: true, name: true, hex_code: true } },
        images: { select: { id: true, image_url: true, is_primary: true, display_order: true }, orderBy: { display_order: 'asc' } },
        documents: true,
        features: true
      }
    })

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Listing tidak ditemukan'
      }, { status: 404 })
    }

    // Get seller info
    let seller = null
    if (listing.user_id) {
      seller = await db.profile.findUnique({
        where: { id: listing.user_id },
        select: { id: true, full_name: true, phone: true, avatar_url: true, is_verified: true }
      })
    }

    // Get dealer info if listing belongs to dealer
    let dealer = null
    if (listing.dealer_id) {
      dealer = await db.dealer.findUnique({
        where: { id: listing.dealer_id },
        select: {
          id: true, name: true, slug: true, logo_url: true, cover_url: true, description: true,
          phone: true, email: true, website: true,
          address: true, verified: true, rating: true, review_count: true, subscription_tier: true
        }
      })
    }

    // Get inspection if exists
    const inspection = await db.carInspection.findFirst({
      where: { car_listing_id: listing.id },
      orderBy: { created_at: 'desc' },
      include: {
        results: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                display_order: true,
                inspectionCategory: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    })

    // Group inspection results by category
    let inspectionByCategory = null
    let inspectionStats = null
    if (inspection && inspection.results) {
      const grouped: Record<string, any[]> = {}
      for (const result of inspection.results) {
        const category = (result.item as any)?.inspectionCategory?.name || 'Lainnya'
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
    await db.carListing.update({
      where: { id: listing.id },
      data: { view_count: (listing.view_count || 0) + 1 }
    })

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
    const currentListing = await db.carListing.findFirst({
      where: { id, deleted_at: null }
    })
    
    if (!currentListing) {
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
        const userCredits = await db.userCredit.findUnique({
          where: { user_id: userId }
        })
        
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
        await db.userCredit.update({
          where: { user_id: userId },
          data: {
            balance: newBalance,
            total_spent: (userCredits?.total_spent || 0) + additionalCost
          }
        })
        
        // Record transaction
        await db.creditTransaction.create({
          data: {
            id: uuidv4(),
            user_id: userId,
            type: 'spend',
            amount: -additionalCost,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: `Upgraded listing visibility: ${oldVisibility} → ${newVisibility}`,
            reference_type: 'listing_upgrade',
            reference_id: id
          }
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
    const updateData: any = {}
    
    // Add fields from body
    const allowedFields = [
      'title', 'description', 'price_cash', 'price_negotiable',
      'mileage', 'condition', 'transmission', 'fuel', 'body_type',
      'city', 'province', 'status', 'visibility',
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
      updateData.sold_at = new Date()
    }
    
    // Update the listing
    const updatedListing = await db.carListing.update({
      where: { id },
      data: updateData
    })
    
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
    const currentListing = await db.carListing.findFirst({
      where: { id, deleted_at: null }
    })
    
    if (!currentListing) {
      return NextResponse.json({
        success: false,
        error: 'Listing tidak ditemukan'
      }, { status: 404 })
    }
    
    // Soft delete by setting deleted_at
    await db.carListing.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: 'deleted'
      }
    })
    
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
