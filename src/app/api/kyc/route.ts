import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET - Fetch KYC data for current user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const kyc = await db.kycVerification.findUnique({
      where: { user_id: userId },
    })

    return NextResponse.json({
      success: true,
      kyc: kyc || null,
    })
  } catch (error) {
    console.error('Error fetching KYC:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KYC data' },
      { status: 500 }
    )
  }
}

// POST - Submit KYC verification
export async function POST(request: Request) {
  try {
    const body = await request.json()

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
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if KTP number already exists
    const existingKyc = await db.kycVerification.findFirst({
      where: { ktp_number },
    })

    if (existingKyc) {
      return NextResponse.json(
        { success: false, error: 'KTP number already registered' },
        { status: 400 }
      )
    }

    // Check if user already has KYC
    const existingUserKyc = await db.kycVerification.findUnique({
      where: { user_id },
    })

    if (existingUserKyc && existingUserKyc.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'User already verified' },
        { status: 400 }
      )
    }

    // Create or update KYC
    const kycData = {
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
      submitted_at: new Date(),
    }

    let result
    if (existingUserKyc) {
      // Update existing
      result = await db.kycVerification.update({
        where: { id: existingUserKyc.id },
        data: kycData,
      })
    } else {
      // Create new
      result = await db.kycVerification.create({
        data: {
          id: uuidv4(),
          user_id,
          ...kycData,
        },
      })
    }

    // Update user profile is_verified to false (pending verification)
    await db.profile.update({
      where: { id: user_id },
      data: { is_verified: false },
    })

    return NextResponse.json({
      success: true,
      message: 'KYC verification submitted successfully',
      kyc: result,
    })
  } catch (error) {
    console.error('Error submitting KYC:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit KYC verification' },
      { status: 500 }
    )
  }
}

// PUT - Update KYC status (Admin only)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { kyc_id, status, rejection_reason, reviewer_id } = body

    if (!kyc_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      status,
      reviewed_at: new Date(),
      reviewed_by: reviewer_id || null,
    }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const data = await db.kycVerification.update({
      where: { id: kyc_id },
      data: updateData,
    })

    // If approved, update user profile
    if (status === 'approved' && data.user_id) {
      await db.profile.update({
        where: { id: data.user_id },
        data: {
          is_verified: true,
          full_name: data.full_name,
          phone: data.phone_number,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `KYC ${status} successfully`,
      kyc: data,
    })
  } catch (error) {
    console.error('Error updating KYC status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update KYC status' },
      { status: 500 }
    )
  }
}
