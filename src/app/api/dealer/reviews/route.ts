import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch reviews for a dealer with rating distribution
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const dealerId = searchParams.get('dealer_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating') // Filter by specific rating
    const sortBy = searchParams.get('sort_by') || 'newest' // newest, oldest, highest, lowest

    if (!dealerId) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      )
    }

    // Build query for reviews
    let query = supabase
      .from('dealer_reviews')
      .select(`
        id,
        rating,
        comment,
        user_id,
        dealer_id,
        helpful_count,
        created_at,
        user:profiles!dealer_reviews_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: sortBy === 'oldest' })

    // Apply rating filter
    if (rating) {
      query = query.eq('rating', parseInt(rating))
    }

    // Apply sorting
    if (sortBy === 'highest') {
      query = query.order('rating', { ascending: false })
    } else if (sortBy === 'lowest') {
      query = query.order('rating', { ascending: true })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: reviews, error, count } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Get rating distribution
    const { data: ratingData, error: ratingError } = await supabase
      .rpc('get_dealer_rating_distribution', { p_dealer_id: dealerId })
      .catch(async () => {
        // If RPC doesn't exist, calculate manually
        const { data: allReviews } = await supabase
          .from('dealer_reviews')
          .select('rating')
          .eq('dealer_id', dealerId)

        const distribution = {
          rating_5: 0,
          rating_4: 0,
          rating_3: 0,
          rating_2: 0,
          rating_1: 0,
          total_reviews: allReviews?.length || 0,
          average_rating: 0
        }

        allReviews?.forEach(review => {
          const r = review.rating
          if (r === 5) distribution.rating_5++
          else if (r === 4) distribution.rating_4++
          else if (r === 3) distribution.rating_3++
          else if (r === 2) distribution.rating_2++
          else if (r === 1) distribution.rating_1++
        })

        if (distribution.total_reviews > 0) {
          distribution.average_rating = (
            (distribution.rating_5 * 5 +
              distribution.rating_4 * 4 +
              distribution.rating_3 * 3 +
              distribution.rating_2 * 2 +
              distribution.rating_1 * 1) / distribution.total_reviews
          )
        }

        return { data: distribution }
      })

    if (ratingError) {
      console.error('Error fetching rating distribution:', ratingError)
    }

    // Transform reviews to mask user info if needed
    const transformedReviews = reviews?.map(review => ({
      ...review,
      user: review.user ? {
        id: review.user.id,
        name: review.user.name || 'Anonymous',
        avatar_url: review.user.avatar_url
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews || [],
        rating_distribution: ratingData || {
          rating_5: 0,
          rating_4: 0,
          rating_3: 0,
          rating_2: 0,
          rating_1: 0,
          total_reviews: 0,
          average_rating: 0
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error in reviews GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dealer_id, rating, comment } = body

    // Validate required fields
    if (!dealer_id || !rating) {
      return NextResponse.json(
        { success: false, error: 'dealer_id and rating are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if dealer exists
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('id', dealer_id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json(
        { success: false, error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this dealer
    const { data: existingReview } = await supabase
      .from('dealer_reviews')
      .select('id')
      .eq('dealer_id', dealer_id)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this dealer' },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error: createError } = await supabase
      .from('dealer_reviews')
      .insert({
        dealer_id,
        user_id: user.id,
        rating,
        comment: comment || null,
        helpful_count: 0
      })
      .select(`
        id,
        rating,
        comment,
        user_id,
        dealer_id,
        helpful_count,
        created_at,
        user:profiles!dealer_reviews_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating review:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Update dealer's rating and review count
    await updateDealerRating(supabase, dealer_id)

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review created successfully'
    })
  } catch (error) {
    console.error('Error in reviews POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update dealer rating
async function updateDealerRating(supabase: Awaited<ReturnType<typeof createClient>>, dealerId: string) {
  try {
    // Get all reviews for this dealer
    const { data: reviews } = await supabase
      .from('dealer_reviews')
      .select('rating')
      .eq('dealer_id', dealerId)

    if (!reviews || reviews.length === 0) return

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    // Update dealer
    await supabase
      .from('dealers')
      .update({
        rating: Math.round(avgRating * 100) / 100, // Round to 2 decimal places
        review_count: reviews.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
  } catch (error) {
    console.error('Error updating dealer rating:', error)
  }
}
