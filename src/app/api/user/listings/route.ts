import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get user's listings with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get user_id (for development, use demo user if not provided)
    const userId = searchParams.get('user_id') || '143c26ae-8ba2-4735-b12d-86a1771a2178'
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Filter by status
    const status = searchParams.get('status') // active, pending, sold, draft, expired
    
    // Build query for listings - using actual schema columns
    let query = supabase
      .from('car_listings')
      .select(`
        id,
        user_id,
        brand_id,
        model_id,
        variant_id,
        year,
        mileage,
        price_cash,
        price_credit,
        status,
        city,
        province,
        engine_capacity,
        seat_count,
        created_at,
        visibility
      `, { count: 'exact' })
      .eq('user_id', userId)
    
    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }
    
    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data: listings, error: listingsError, count } = await query
    
    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
      throw listingsError
    }
    
    // Get brand and model names for listings
    let listingsWithDetails = listings || []
    if (listings && listings.length > 0) {
      const brandIds = [...new Set(listings.map(l => l.brand_id).filter(Boolean))]
      const modelIds = [...new Set(listings.map(l => l.model_id).filter(Boolean))]
      
      const [brandsResult, modelsResult, imagesResult] = await Promise.all([
        brandIds.length > 0 ? supabase.from('brands').select('id, name').in('id', brandIds) : { data: [] },
        modelIds.length > 0 ? supabase.from('car_models').select('id, name').in('id', modelIds) : { data: [] },
        supabase.from('car_images').select('car_listing_id, image_url').in('car_listing_id', listings.map(l => l.id)).eq('is_primary', true)
      ])
      
      const brandMap = new Map((brandsResult.data || []).map((b: { id: string; name: string }) => [b.id, b.name]))
      const modelMap = new Map((modelsResult.data || []).map((m: { id: string; name: string }) => [m.id, m.name]))
      const imageMap = new Map((imagesResult.data || []).map((i: { car_listing_id: string; image_url: string }) => [i.car_listing_id, i.image_url]))
      
      listingsWithDetails = listings.map(listing => {
        const brandName = brandMap.get(listing.brand_id) || ''
        const modelName = modelMap.get(listing.model_id) || ''
        const title = `${brandName} ${modelName} ${listing.year || ''}`.trim()
        
        return {
          ...listing,
          title,
          price: listing.price_cash || 0,
          primary_image: imageMap.get(listing.id) || null,
          brand_name: brandName,
          model_name: modelName,
          view_count: 0, // Column doesn't exist in this schema
          location_city: listing.city,
          location_province: listing.province
        }
      })
    }
    
    // Calculate stats
    const { data: allListings, error: statsError } = await supabase
      .from('car_listings')
      .select('status')
      .eq('user_id', userId)
    
    if (statsError) {
      console.error('Error fetching stats:', statsError)
    }
    
    const stats = {
      total: allListings?.length || 0,
      active: allListings?.filter(l => l.status === 'active').length || 0,
      pending: allListings?.filter(l => l.status === 'pending').length || 0,
      sold: allListings?.filter(l => l.status === 'sold').length || 0,
      draft: allListings?.filter(l => l.status === 'draft').length || 0,
      expired: allListings?.filter(l => l.status === 'expired').length || 0,
      totalViews: 0
    }
    
    return NextResponse.json({
      success: true,
      data: listingsWithDetails,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in user listings API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user listings' },
      { status: 500 }
    )
  }
}

// PATCH - Update listing status (activate, deactivate, delete)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, action, user_id } = body
    
    const userId = user_id || '143c26ae-8ba2-4735-b12d-86a1771a2178'
    
    if (!listing_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Listing ID and action are required' },
        { status: 400 }
      )
    }
    
    // Verify ownership
    const { data: listing, error: fetchError } = await supabase
      .from('car_listings')
      .select('id, status, user_id')
      .eq('id', listing_id)
      .single()
    
    if (fetchError || !listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }
    
    if (listing.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    let updateData: Record<string, unknown> = {}
    let successMessage = ''
    
    switch (action) {
      case 'activate':
        updateData.status = 'active'
        successMessage = 'Listing activated successfully'
        break
      case 'deactivate':
        updateData.status = 'pending'
        successMessage = 'Listing deactivated successfully'
        break
      case 'delete':
        updateData.status = 'deleted'
        successMessage = 'Listing deleted successfully'
        break
      case 'mark_sold':
        updateData.status = 'sold'
        successMessage = 'Listing marked as sold'
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    const { error: updateError } = await supabase
      .from('car_listings')
      .update(updateData)
      .eq('id', listing_id)
    
    if (updateError) {
      console.error('Error updating listing:', updateError)
      throw updateError
    }
    
    return NextResponse.json({
      success: true,
      message: successMessage
    })
  } catch (error) {
    console.error('Error in update listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const userId = searchParams.get('user_id') || '143c26ae-8ba2-4735-b12d-86a1771a2178'
    
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }
    
    // Verify ownership
    const { data: listing, error: fetchError } = await supabase
      .from('car_listings')
      .select('id, user_id')
      .eq('id', listingId)
      .single()
    
    if (fetchError || !listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }
    
    if (listing.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Update status to deleted (soft delete)
    const { error: deleteError } = await supabase
      .from('car_listings')
      .update({ status: 'deleted' })
      .eq('id', listingId)
    
    if (deleteError) {
      console.error('Error deleting listing:', deleteError)
      throw deleteError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    })
  } catch (error) {
    console.error('Error in delete listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
