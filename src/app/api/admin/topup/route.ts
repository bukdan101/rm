import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET - Fetch topup requests with user info and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Filter params
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    // Build query for topup requests
    let query = supabase
      .from('topup_requests')
      .select('*', { count: 'exact' })

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply search filter (on topup_number or user info)
    if (search) {
      query = query.or(`topup_number.ilike.%${search}%,payment_reference.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: topupRequests, count, error } = await query

    if (error) {
      console.error('Topup fetch error:', error)
      throw error
    }

    if (!topupRequests || topupRequests.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // Get user IDs from topup requests
    const userIds = topupRequests.map(t => t.user_id).filter(Boolean)

    // Fetch user profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, phone')
      .in('id', userIds)

    // Create profile map
    const profileMap = new Map(
      profiles?.map(p => [p.id, p]) || []
    )

    // Combine topup data with user info
    const enrichedRecords = topupRequests.map(topup => ({
      id: topup.id,
      topup_number: topup.topup_number,
      user_id: topup.user_id,
      amount: topup.amount,
      tokens: topup.tokens,
      payment_method: topup.payment_method,
      payment_proof_url: topup.payment_proof_url,
      payment_reference: topup.payment_reference,
      status: topup.status,
      rejection_reason: topup.rejection_reason,
      processed_by: topup.processed_by,
      processed_at: topup.processed_at,
      notes: topup.notes,
      created_at: topup.created_at,
      updated_at: topup.updated_at,
      user: profileMap.get(topup.user_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: enrichedRecords,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching topup requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topup requests' },
      { status: 500 }
    )
  }
}

// PATCH - Confirm or reject topup request
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { topupId, status, adminId, notes, rejectionReason } = body

    if (!topupId || !status) {
      return NextResponse.json(
        { success: false, error: 'Topup ID and status are required' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be either confirmed or rejected' },
        { status: 400 }
      )
    }

    // Get the topup request first
    const { data: topupRequest, error: fetchError } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('id', topupId)
      .single()

    if (fetchError || !topupRequest) {
      return NextResponse.json(
        { success: false, error: 'Topup request not found' },
        { status: 404 }
      )
    }

    if (topupRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Topup request already processed' },
        { status: 400 }
      )
    }

    // Update topup request
    const updateData: Record<string, unknown> = {
      status,
      processed_at: new Date().toISOString(),
      processed_by: adminId || null,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.notes = notes
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { data, error } = await supabase
      .from('topup_requests')
      .update(updateData)
      .eq('id', topupId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // If confirmed, add tokens to user
    if (status === 'confirmed' && data.user_id) {
      // Check if user_tokens record exists
      const { data: existingTokens } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', data.user_id)
        .single()

      if (existingTokens) {
        // Update existing record
        await supabase
          .from('user_tokens')
          .update({
            balance: existingTokens.balance + data.tokens,
            total_purchased: existingTokens.total_purchased + data.tokens,
            last_purchase_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', data.user_id)
      } else {
        // Create new record
        await supabase
          .from('user_tokens')
          .insert({
            user_id: data.user_id,
            balance: data.tokens,
            total_purchased: data.tokens,
            total_used: 0,
            total_bonus: 0,
            last_purchase_at: new Date().toISOString(),
          })
      }

      // Create token transaction record
      await supabase
        .from('token_transactions')
        .insert({
          user_id: data.user_id,
          transaction_type: 'purchase',
          amount: data.tokens,
          description: `Topup via ${data.payment_method} - ${data.topup_number}`,
          price_paid: data.amount,
          metadata: {
            topup_id: data.id,
            topup_number: data.topup_number,
            payment_method: data.payment_method,
          },
        })
    }

    return NextResponse.json({
      success: true,
      message: `Topup request ${status} successfully`,
      data,
    })
  } catch (error) {
    console.error('Error updating topup status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update topup status' },
      { status: 500 }
    )
  }
}
