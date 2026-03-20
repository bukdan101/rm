import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const supabase = getSupabaseAdmin()

// GET - Fetch KYC data for current user
export async function GET(request: Request) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll use a simple approach - in production use proper auth
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      // For demo, get from query param
      const url = new URL(request.url)
      const userId = url.searchParams.get('user_id')
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 })
      }

      const { data: kyc, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return NextResponse.json({ 
        success: true, 
        kyc: kyc || null 
      })
    }

    const { data: kyc, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      kyc: kyc || null 
    })
  } catch (error) {
    console.error('Error fetching KYC:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch KYC data',
    }, { status: 500 })
  }
}

// POST - Submit KYC verification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Required fields
    const {
      user_id,
      full_name,
      ktp_number,
      phone_number,
      provinceId,
      regencyId,
      districtId,
      villageId,
      full_address,
      ktp_image_url,
      selfie_image_url,
    } = body

    if (!user_id || !full_name || !ktp_number || !phone_number || !provinceId || !regencyId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Check if KTP number already exists
    const { data: existingKyc } = await supabase
      .from('kyc_verifications')
      .select('id')
      .eq('ktp_number', ktp_number)
      .maybeSingle()

    if (existingKyc) {
      return NextResponse.json({
        success: false,
        error: 'KTP number already registered',
      }, { status: 400 })
    }

    // Check if user already has KYC
    const { data: existingUserKyc } = await supabase
      .from('kyc_verifications')
      .select('id, status')
      .eq('user_id', user_id)
      .maybeSingle()

    if (existingUserKyc && existingUserKyc.status === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'User already verified',
      }, { status: 400 })
    }

    // Create or update KYC
    const kycData = {
      user_id,
      full_name,
      ktp_number,
      phone_number,
      province_id: provinceId,
      city_id: regencyId,
      district_id: districtId || null,
      village_id: villageId || null,
      full_address: full_address || null,
      ktp_image_url: ktp_image_url || null,
      selfie_image_url: selfie_image_url || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let result
    if (existingUserKyc) {
      // Update existing
      result = await supabase
        .from('kyc_verifications')
        .update(kycData)
        .eq('id', existingUserKyc.id)
        .select()
        .single()
    } else {
      // Create new
      result = await supabase
        .from('kyc_verifications')
        .insert({ id: uuidv4(), ...kycData })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    // Update user profile is_verified to false (pending verification)
    await supabase
      .from('profiles')
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq('id', user_id)

    return NextResponse.json({
      success: true,
      message: 'KYC verification submitted successfully',
      kyc: result.data,
    })
  } catch (error) {
    console.error('Error submitting KYC:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit KYC verification',
    }, { status: 500 })
  }
}

// PUT - Update KYC status (Admin only)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { kyc_id, status, rejection_reason, reviewer_id } = body

    if (!kyc_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer_id || null,
      updated_at: new Date().toISOString(),
    }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { data, error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kyc_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // If approved, update user profile
    if (status === 'approved' && data.user_id) {
      await supabase
        .from('profiles')
        .update({ 
          is_verified: true, 
          full_name: data.full_name,
          phone: data.phone_number,
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.user_id)
    }

    return NextResponse.json({
      success: true,
      message: `KYC ${status} successfully`,
      kyc: data,
    })
  } catch (error) {
    console.error('Error updating KYC status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update KYC status',
    }, { status: 500 })
  }
}
