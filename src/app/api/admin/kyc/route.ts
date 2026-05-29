import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get all KYC submissions with status filter (admin only)
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
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query for KYC submissions
    let query = supabase
      .from('kyc_verifications')
      .select(`
        id,
        user_id,
        full_name,
        ktp_number,
        phone_number,
        province_id,
        city_id,
        district_id,
        village_id,
        full_address,
        ktp_image_url,
        selfie_image_url,
        status,
        rejection_reason,
        reviewed_at,
        reviewed_by,
        submitted_at,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (status) {
      const validStatuses = ['not_submitted', 'pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Valid statuses: not_submitted, pending, approved, rejected' 
        }, { status: 400 })
      }
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,ktp_number.ilike.%${search}%,phone_number.ilike.%${search}%`)
    }
    
    const { data: kycSubmissions, count, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get user profile data for each KYC submission
    const kycWithUserData = await Promise.all(
      (kycSubmissions || []).map(async (kyc) => {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, avatar_url, role')
          .eq('id', kyc.user_id)
          .single()
        
        // Get location names
        let provinceName = null
        let cityName = null
        let districtName = null
        let villageName = null
        
        if (kyc.province_id) {
          const { data: province } = await supabase
            .from('provinces')
            .select('name')
            .eq('id', kyc.province_id)
            .single()
          provinceName = province?.name || null
        }
        
        if (kyc.city_id) {
          const { data: city } = await supabase
            .from('cities')
            .select('name')
            .eq('id', kyc.city_id)
            .single()
          cityName = city?.name || null
        }
        
        if (kyc.district_id) {
          const { data: district } = await supabase
            .from('districts')
            .select('name')
            .eq('id', kyc.district_id)
            .single()
          districtName = district?.name || null
        }
        
        if (kyc.village_id) {
          const { data: village } = await supabase
            .from('villages')
            .select('name')
            .eq('id', kyc.village_id)
            .single()
          villageName = village?.name || null
        }
        
        // Get reviewer info if reviewed
        let reviewerInfo = null
        if (kyc.reviewed_by) {
          const { data: reviewer } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', kyc.reviewed_by)
            .single()
          reviewerInfo = reviewer
        }
        
        return {
          ...kyc,
          user: userProfile,
          province_name: provinceName,
          city_name: cityName,
          district_name: districtName,
          village_name: villageName,
          reviewer: reviewerInfo
        }
      })
    )
    
    return NextResponse.json({
      kyc_submissions: kycWithUserData,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching admin KYC submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Approve/reject KYC submission (admin only)
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
    const { kyc_id, action, rejection_reason } = body
    
    if (!kyc_id || !action) {
      return NextResponse.json({ error: 'KYC ID and action are required' }, { status: 400 })
    }
    
    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Valid actions: approve, reject' }, { status: 400 })
    }
    
    // Get KYC submission
    const { data: kycSubmission, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('id', kyc_id)
      .single()
    
    if (kycError || !kycSubmission) {
      return NextResponse.json({ error: 'KYC submission not found' }, { status: 404 })
    }
    
    if (action === 'approve') {
      // Approve KYC
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', kyc_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      // Update user's is_verified status
      await supabase
        .from('profiles')
        .update({
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', kycSubmission.user_id)
      
      return NextResponse.json({
        success: true,
        message: 'KYC submission approved successfully'
      })
    }
    
    if (action === 'reject') {
      // Validate rejection reason
      if (!rejection_reason) {
        return NextResponse.json({ error: 'Rejection reason is required when rejecting' }, { status: 400 })
      }
      
      // Reject KYC
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          rejection_reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', kyc_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'KYC submission rejected'
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating KYC submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
