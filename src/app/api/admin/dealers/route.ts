import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get all dealers with pagination and search (admin only)
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
    const verified = searchParams.get('verified')
    const isActive = searchParams.get('is_active')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query for dealers
    let query = supabase
      .from('dealers')
      .select(`
        id,
        name,
        slug,
        description,
        phone,
        address,
        city_id,
        province_id,
        verified,
        rating,
        total_listings,
        is_active,
        created_at,
        owner:profiles!dealers_owner_id_fkey(id, full_name, email, phone)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    
    if (verified !== null) {
      query = query.eq('verified', verified === 'true')
    }
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    const { data: dealers, count, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get city and province names for each dealer
    const dealersWithLocation = await Promise.all(
      (dealers || []).map(async (dealer) => {
        let cityName = null
        let provinceName = null
        
        if (dealer.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name')
            .eq('id', dealer.city_id)
            .single()
          cityName = city?.name || null
        }
        
        if (dealer.province_id) {
          const { data: province } = await supabase
            .from('provinces')
            .select('name')
            .eq('id', dealer.province_id)
            .single()
          provinceName = province?.name || null
        }
        
        return {
          ...dealer,
          city_name: cityName,
          province_name: provinceName
        }
      })
    )
    
    return NextResponse.json({
      dealers: dealersWithLocation,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching admin dealers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Verify/activate dealer (admin only)
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
    const { dealer_id, verified, is_active } = body
    
    if (!dealer_id) {
      return NextResponse.json({ error: 'Dealer ID is required' }, { status: 400 })
    }
    
    // Check if at least one field to update is provided
    if (verified === undefined && is_active === undefined) {
      return NextResponse.json({ error: 'At least one field (verified or is_active) is required' }, { status: 400 })
    }
    
    // Build update object
    const updateData: { verified?: boolean; is_active?: boolean; updated_at?: string } = {
      updated_at: new Date().toISOString()
    }
    
    if (verified !== undefined) {
      updateData.verified = verified
    }
    
    if (is_active !== undefined) {
      updateData.is_active = is_active
    }
    
    // Update dealer
    const { data: updatedDealer, error: updateError } = await supabase
      .from('dealers')
      .update(updateData)
      .eq('id', dealer_id)
      .select(`
        id,
        name,
        slug,
        verified,
        is_active,
        updated_at
      `)
      .single()
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    if (!updatedDealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dealer updated successfully',
      dealer: updatedDealer
    })
  } catch (error) {
    console.error('Error updating dealer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
