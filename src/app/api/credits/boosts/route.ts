import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get active boosts for a listing or user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const listing_id = searchParams.get('listing_id')
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    if (listing_id) {
      // Get boosts for specific listing
      const boosts = await db.listingBoost.findMany({
        where: {
          listing_id,
          is_active: true,
          expires_at: { gt: new Date() }
        },
        include: {
          boost_feature: true
        }
      })
      
      return NextResponse.json({ boosts })
    }
    
    // Get user's listings
    const listings = await db.carListing.findMany({
      where: { user_id: userId },
      select: { id: true }
    })
    
    // Also check dealer listings
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId }
    })
    
    let dealerListings: { id: string }[] = []
    if (dealer) {
      dealerListings = await db.carListing.findMany({
        where: { dealer_id: dealer.id },
        select: { id: true }
      })
    }
    
    const allListings = [...listings, ...dealerListings]
    const listingIds = allListings.map(l => l.id)
    
    if (listingIds.length === 0) {
      return NextResponse.json({ boosts: [] })
    }
    
    const boosts = await db.listingBoost.findMany({
      where: {
        listing_id: { in: listingIds },
        is_active: true,
        expires_at: { gt: new Date() }
      },
      include: {
        boost_feature: true,
        listing: { select: { id: true, title: true, slug: true } }
      },
      orderBy: { expires_at: 'asc' }
    })
    
    return NextResponse.json({ boosts })
  } catch (error) {
    console.error('Error fetching boosts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new boost for a listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, boost_feature_id, userId } = body
    
    if (!listing_id || !boost_feature_id || !userId) {
      return NextResponse.json({ error: 'Listing ID, boost feature ID, and user ID are required' }, { status: 400 })
    }
    
    // Verify listing ownership
    const listing = await db.carListing.findUnique({
      where: { id: listing_id }
    })
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId }
    })
    
    const isOwner = (dealer && listing.dealer_id === dealer.id) || 
                    (!dealer && listing.user_id === userId)
    
    if (!isOwner) {
      return NextResponse.json({ error: 'You can only boost your own listings' }, { status: 403 })
    }
    
    // Get boost feature
    const boostFeature = await db.boostFeature.findFirst({
      where: { id: boost_feature_id, is_active: true }
    })
    
    if (!boostFeature) {
      return NextResponse.json({ error: 'Boost feature not found' }, { status: 404 })
    }
    
    // Check if same boost is already active
    const existingBoost = await db.listingBoost.findFirst({
      where: {
        listing_id,
        boost_feature_id,
        is_active: true,
        expires_at: { gt: new Date() }
      }
    })
    
    if (existingBoost) {
      return NextResponse.json({ error: 'This boost is already active for this listing' }, { status: 400 })
    }
    
    // Get user credits
    let userCredit = await db.userCredit.findUnique({
      where: { user_id: userId }
    })
    
    if (dealer && !userCredit) {
      // Try by dealer_id
      userCredit = await db.userCredit.findFirst({
        where: { dealer_id: dealer.id }
      })
    }
    
    if (!userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }
    
    // Check balance (boostFeature.credits, not credit_cost)
    if (userCredit.balance < boostFeature.credits) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: boostFeature.credits,
        current: userCredit.balance
      }, { status: 400 })
    }
    
    // Deduct credits
    const newBalance = userCredit.balance - boostFeature.credits
    
    await db.userCredit.update({
      where: { id: userCredit.id },
      data: {
        balance: newBalance,
        total_spent: userCredit.total_spent + boostFeature.credits,
        last_usage_at: new Date()
      }
    })
    
    // Record transaction
    const transaction = await db.creditTransaction.create({
      data: {
        user_credit_id: userCredit.id,
        user_id: userId,
        type: 'usage',
        amount: -boostFeature.credits,
        balance_before: userCredit.balance,
        balance_after: newBalance,
        description: `Boost ${boostFeature.name} for listing`,
        reference_type: 'boost',
        reference_id: boost_feature_id,
      }
    })
    
    // Create boost (expires_at, not ends_at)
    const expires_at = new Date(Date.now() + boostFeature.duration_days * 24 * 60 * 60 * 1000)
    const starts_at = new Date()
    
    const boost = await db.listingBoost.create({
      data: {
        listing_id,
        boost_feature_id,
        user_id: userId,
        dealer_id: dealer?.id || null,
        credits_spent: boostFeature.credits,
        starts_at,
        expires_at,
      },
      include: {
        boost_feature: true
      }
    })
    
    // Log usage (user_id, not user_credit_id; tokens_used, not credits_used; marketplace_type, not action)
    await db.creditUsageLog.create({
      data: {
        user_id: userId,
        listing_id,
        marketplace_type: 'boost_listing',
        tokens_used: boostFeature.credits,
        duration_days: boostFeature.duration_days,
      }
    })
    
    return NextResponse.json({
      boost,
      new_balance: newBalance
    })
  } catch (error) {
    console.error('Error creating boost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Cancel a boost
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const boost_id = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (!boost_id) {
      return NextResponse.json({ error: 'Boost ID is required' }, { status: 400 })
    }
    
    // Get boost
    const boost = await db.listingBoost.findUnique({
      where: { id: boost_id },
      include: {
        listing: { select: { user_id: true, dealer_id: true } }
      }
    })
    
    if (!boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }
    
    // Check ownership
    let isOwner = false
    if (userId) {
      const dealer = await db.dealer.findFirst({
        where: { owner_id: userId }
      })
      isOwner = (dealer && boost.listing.dealer_id === dealer.id) || 
                (!dealer && boost.listing.user_id === userId)
    }
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Deactivate boost
    await db.listingBoost.update({
      where: { id: boost_id },
      data: { is_active: false }
    })
    
    // Calculate remaining days for potential refund
    const now = new Date()
    const expiresAt = new Date(boost.expires_at!)
    const startedAt = boost.starts_at ? new Date(boost.starts_at) : new Date(boost.created_at)
    
    // Get boost feature for duration
    let totalDays = 7
    if (boost.boost_feature_id) {
      const feature = await db.boostFeature.findUnique({
        where: { id: boost.boost_feature_id }
      })
      totalDays = feature?.duration_days || 7
    }
    
    const totalMs = totalDays * 24 * 60 * 60 * 1000
    const usedMs = now.getTime() - startedAt.getTime()
    const usedRatio = usedMs / totalMs
    
    // Refund proportional credits (if more than 50% remaining)
    const remainingRatio = 1 - usedRatio
    if (remainingRatio > 0.5 && boost.user_id) {
      const refundCredits = Math.floor(boost.credits_spent * remainingRatio)
      
      if (refundCredits > 0) {
        // Get current balance
        const userCredit = await db.userCredit.findFirst({
          where: { user_id: boost.user_id }
        })
        
        if (userCredit) {
          const newBalance = userCredit.balance + refundCredits
          
          await db.userCredit.update({
            where: { id: userCredit.id },
            data: { balance: newBalance }
          })
          
          await db.creditTransaction.create({
            data: {
              user_credit_id: userCredit.id,
              user_id: boost.user_id,
              type: 'refund',
              amount: refundCredits,
              balance_before: userCredit.balance,
              balance_after: newBalance,
              description: `Refund for cancelled boost`,
              reference_id: boost.id,
              reference_type: 'boost'
            }
          })
        }
      }
    }
    
    return NextResponse.json({ message: 'Boost cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling boost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
