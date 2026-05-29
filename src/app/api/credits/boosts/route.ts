import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get active boosts for a listing or user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const listing_id = searchParams.get('listing_id')
    
    if (listing_id) {
      // Get boosts for specific listing
      const { data: boosts, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost:boost_features(*)
        `)
        .eq('listing_id', listing_id)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({ boosts })
    }
    
    // Get all boosts for user's listings
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    // Get user's listings
    let listingQuery = supabase
      .from('car_listings')
      .select('id')
    
    if (dealer) {
      listingQuery = listingQuery.eq('dealer_id', dealer.id)
    } else {
      listingQuery = listingQuery.eq('user_id', user.id)
    }
    
    const { data: listings } = await listingQuery
    
    if (!listings || listings.length === 0) {
      return NextResponse.json({ boosts: [] })
    }
    
    const listingIds = listings.map(l => l.id)
    
    const { data: boosts, error } = await supabase
      .from('listing_boosts')
      .select(`
        *,
        boost:boost_features(*),
        listing:car_listings(id, title, slug)
      `)
      .in('listing_id', listingIds)
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ boosts })
  } catch (error) {
    console.error('Error fetching boosts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new boost for a listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { listing_id, boost_feature_id, auto_renew = false } = body
    
    if (!listing_id || !boost_feature_id) {
      return NextResponse.json({ error: 'Listing ID and boost feature ID are required' }, { status: 400 })
    }
    
    // Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .select('id, user_id, dealer_id')
      .eq('id', listing_id)
      .single()
    
    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    const isOwner = (dealer && listing.dealer_id === dealer.id) || 
                    (!dealer && listing.user_id === user.id)
    
    if (!isOwner) {
      return NextResponse.json({ error: 'You can only boost your own listings' }, { status: 403 })
    }
    
    // Get boost feature
    const { data: boostFeature, error: featureError } = await supabase
      .from('boost_features')
      .select('*')
      .eq('id', boost_feature_id)
      .eq('is_active', true)
      .single()
    
    if (featureError || !boostFeature) {
      return NextResponse.json({ error: 'Boost feature not found' }, { status: 404 })
    }
    
    // Check if same boost is already active
    const { data: existingBoost } = await supabase
      .from('listing_boosts')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('boost_feature_id', boost_feature_id)
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .single()
    
    if (existingBoost) {
      return NextResponse.json({ error: 'This boost is already active for this listing' }, { status: 400 })
    }
    
    // Get user credits
    let creditQuery = supabase
      .from('user_credits')
      .select('*')
    
    if (dealer) {
      creditQuery = creditQuery.eq('dealer_id', dealer.id)
    } else {
      creditQuery = creditQuery.eq('user_id', user.id)
    }
    
    const { data: userCredit, error: creditError } = await creditQuery.single()
    
    if (creditError || !userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }
    
    // Check balance
    if (userCredit.balance < boostFeature.credit_cost) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: boostFeature.credit_cost,
        current: userCredit.balance
      }, { status: 400 })
    }
    
    // Deduct credits
    const newBalance = userCredit.balance - boostFeature.credit_cost
    
    const { error: updateCreditError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_spent: userCredit.total_spent + boostFeature.credit_cost
      })
      .eq('id', userCredit.id)
    
    if (updateCreditError) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }
    
    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_credit_id: userCredit.id,
        type: 'usage',
        amount: -boostFeature.credit_cost,
        balance_before: userCredit.balance,
        balance_after: newBalance,
        description: `Boost ${boostFeature.name} for listing`,
        reference_type: 'boost'
      })
      .select()
      .single()
    
    if (transactionError) {
      // Rollback credit update
      await supabase
        .from('user_credits')
        .update({ balance: userCredit.balance })
        .eq('id', userCredit.id)
      
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
    }
    
    // Create boost
    const ends_at = new Date(Date.now() + boostFeature.duration_days * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: boost, error: boostError } = await supabase
      .from('listing_boosts')
      .insert({
        listing_id,
        boost_feature_id,
        user_credit_id: userCredit.id,
        transaction_id: transaction.id,
        credits_spent: boostFeature.credit_cost,
        ends_at,
        auto_renew
      })
      .select(`
        *,
        boost:boost_features(*)
      `)
      .single()
    
    if (boostError) {
      // Rollback
      await supabase
        .from('user_credits')
        .update({ balance: userCredit.balance })
        .eq('id', userCredit.id)
      
      await supabase
        .from('credit_transactions')
        .delete()
        .eq('id', transaction.id)
      
      return NextResponse.json({ error: 'Failed to create boost' }, { status: 500 })
    }
    
    // Log usage
    await supabase
      .from('credit_usage_log')
      .insert({
        user_credit_id: userCredit.id,
        listing_id,
        action: 'boost_listing',
        credits_used: boostFeature.credit_cost,
        details: { boost_name: boostFeature.name, duration_days: boostFeature.duration_days }
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
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const boost_id = searchParams.get('id')
    
    if (!boost_id) {
      return NextResponse.json({ error: 'Boost ID is required' }, { status: 400 })
    }
    
    // Get boost
    const { data: boost, error: boostError } = await supabase
      .from('listing_boosts')
      .select(`
        *,
        listing:car_listings(user_id, dealer_id)
      `)
      .eq('id', boost_id)
      .single()
    
    if (boostError || !boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }
    
    // Check ownership
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    const isOwner = (dealer && boost.listing.dealer_id === dealer.id) || 
                    (!dealer && boost.listing.user_id === user.id)
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Deactivate boost
    const { error: updateError } = await supabase
      .from('listing_boosts')
      .update({ is_active: false, auto_renew: false })
      .eq('id', boost_id)
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Calculate remaining days for potential refund
    const now = new Date()
    const endsAt = new Date(boost.ends_at)
    const startedAt = new Date(boost.started_at)
    const totalDays = boost.boost_feature_id ? 
      (await supabase.from('boost_features').select('duration_days').eq('id', boost.boost_feature_id).single())?.data?.duration_days || 0 : 0
    
    const totalMs = totalDays * 24 * 60 * 60 * 1000
    const usedMs = now.getTime() - startedAt.getTime()
    const usedRatio = usedMs / totalMs
    
    // Refund proportional credits (if more than 50% remaining)
    const remainingRatio = 1 - usedRatio
    if (remainingRatio > 0.5 && boost.user_credit_id) {
      const refundCredits = Math.floor(boost.credits_spent * remainingRatio)
      
      if (refundCredits > 0) {
        // Get current balance
        const { data: userCredit } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('id', boost.user_credit_id)
          .single()
        
        if (userCredit) {
          const newBalance = userCredit.balance + refundCredits
          
          await supabase
            .from('user_credits')
            .update({ balance: newBalance })
            .eq('id', boost.user_credit_id)
          
          await supabase
            .from('credit_transactions')
            .insert({
              user_credit_id: boost.user_credit_id,
              type: 'refund',
              amount: refundCredits,
              balance_before: userCredit.balance,
              balance_after: newBalance,
              description: `Refund for cancelled boost`,
              reference_id: boost.id,
              reference_type: 'boost'
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
