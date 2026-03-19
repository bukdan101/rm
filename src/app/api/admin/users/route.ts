import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get all users with pagination, search, and role filter (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const isVerified = searchParams.get('is_verified')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query for users
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        is_verified,
        created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    
    if (role) {
      query = query.eq('role', role)
    }
    
    if (isVerified !== null) {
      query = query.eq('is_verified', isVerified === 'true')
    }
    
    const { data: users, count, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get listing and favorite counts for each user
    const usersWithCounts = await Promise.all(
      (users || []).map(async (userData) => {
        // Get listing count
        const { count: listingCount } = await supabase
          .from('car_listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id)
        
        // Get favorite count
        const { count: favoriteCount } = await supabase
          .from('car_favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id)
        
        return {
          ...userData,
          listings_count: listingCount || 0,
          favorites_count: favoriteCount || 0
        }
      })
    )
    
    return NextResponse.json({
      users: usersWithCounts,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update user role or verification status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const body = await request.json()
    const { user_id, role, is_verified } = body
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Check if at least one field to update is provided
    if (role === undefined && is_verified === undefined) {
      return NextResponse.json({ error: 'At least one field (role or is_verified) is required' }, { status: 400 })
    }
    
    // Build update object
    const updateData: { role?: string; is_verified?: boolean; updated_at?: string } = {
      updated_at: new Date().toISOString()
    }
    
    if (role !== undefined) {
      const validRoles = ['buyer', 'seller', 'dealer', 'admin', 'inspector']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Valid roles: buyer, seller, dealer, admin, inspector' }, { status: 400 })
      }
      updateData.role = role
    }
    
    if (is_verified !== undefined) {
      updateData.is_verified = is_verified
    }
    
    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)
      .select('id, email, full_name, phone, role, is_verified, created_at')
      .single()
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
