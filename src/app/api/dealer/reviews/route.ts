import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch reviews for a dealer with rating distribution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const dealerId = searchParams.get('dealer_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')
    const sortBy = searchParams.get('sort_by') || 'newest'

    if (!dealerId) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {
      dealer_id: dealerId,
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Determine ordering
    let orderBy: Record<string, string> = { created_at: 'desc' }
    if (sortBy === 'oldest') orderBy = { created_at: 'asc' }
    else if (sortBy === 'highest') orderBy = { rating: 'desc' }
    else if (sortBy === 'lowest') orderBy = { rating: 'asc' }

    const [reviews, count] = await Promise.all([
      db.dealerReview.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dealerReview.count({ where }),
    ])

    // Get all reviews for rating distribution
    const allReviews = await db.dealerReview.findMany({
      where: { dealer_id: dealerId },
      select: { rating: true },
    })

    const distribution = {
      rating_5: 0,
      rating_4: 0,
      rating_3: 0,
      rating_2: 0,
      rating_1: 0,
      total_reviews: allReviews.length,
      average_rating: 0,
    }

    allReviews.forEach(review => {
      const r = review.rating
      if (r === 5) distribution.rating_5++
      else if (r === 4) distribution.rating_4++
      else if (r === 3) distribution.rating_3++
      else if (r === 2) distribution.rating_2++
      else if (r === 1) distribution.rating_1++
    })

    if (distribution.total_reviews > 0) {
      distribution.average_rating =
        (distribution.rating_5 * 5 +
          distribution.rating_4 * 4 +
          distribution.rating_3 * 3 +
          distribution.rating_2 * 2 +
          distribution.rating_1 * 1) / distribution.total_reviews
    }

    // Transform reviews to use full_name for display
    const transformedReviews = reviews.map(review => ({
      ...review,
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.full_name || 'Anonymous',
            avatar_url: review.user.avatar_url,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        rating_distribution: distribution,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
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
    const body = await request.json()
    const { dealer_id, rating, comment, user_id } = body

    // Validate required fields
    if (!dealer_id || !rating || !user_id) {
      return NextResponse.json(
        { success: false, error: 'dealer_id, user_id, and rating are required' },
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
    const dealer = await db.dealer.findUnique({
      where: { id: dealer_id },
    })

    if (!dealer) {
      return NextResponse.json(
        { success: false, error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this dealer
    const existingReview = await db.dealerReview.findFirst({
      where: {
        dealer_id,
        user_id,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this dealer' },
        { status: 400 }
      )
    }

    // Create review
    const review = await db.dealerReview.create({
      data: {
        dealer_id,
        user_id,
        rating,
        comment: comment || null,
        helpful_count: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    })

    // Update dealer's rating and review count
    await updateDealerRating(dealer_id)

    return NextResponse.json({
      success: true,
      data: {
        ...review,
        user: review.user
          ? {
              id: review.user.id,
              name: review.user.full_name || 'Anonymous',
              avatar_url: review.user.avatar_url,
            }
          : null,
      },
      message: 'Review created successfully',
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
async function updateDealerRating(dealerId: string) {
  try {
    const reviews = await db.dealerReview.findMany({
      where: { dealer_id: dealerId },
      select: { rating: true },
    })

    if (!reviews || reviews.length === 0) return

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    await db.dealer.update({
      where: { id: dealerId },
      data: {
        rating: Math.round(avgRating * 100) / 100,
        review_count: reviews.length,
      },
    })
  } catch (error) {
    console.error('Error updating dealer rating:', error)
  }
}
