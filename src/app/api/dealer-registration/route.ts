import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const supabase = getSupabaseAdmin()

// GET - Fetch dealer registration for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID required' 
      }, { status: 400 })
    }

    let query = supabase
      .from('dealer_registrations')
      .select(`
        *,
        province:provinces(id, name),
        city:cities(id, name),
        district:districts(id, name),
        village:villages(id, name)
      `)
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: registration, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      registration: registration || null,
    })
  } catch (error) {
    console.error('Error fetching dealer registration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dealer registration',
    }, { status: 500 })
  }
}

// POST - Create new dealer registration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      user_id,
      dealer_name,
      dealer_phone,
      dealer_email,
      dealer_description,
      dealer_logo_url,
      
      province_id,
      city_id,
      district_id,
      village_id,
      full_address,
      postal_code,
      
      owner_name,
      owner_ktp_number,
      owner_phone,
      owner_ktp_url,
      owner_selfie_url,
      
      npwp_number,
      npwp_document_url,
      nib_number,
      nib_document_url,
      siup_number,
      siup_document_url,
      domicile_letter_url,
      additional_documents,
      
      // Optional: submit immediately or save as draft
      submit_now = false,
    } = body

    // Validation for required fields
    const requiredFields = {
      user_id,
      dealer_name,
      owner_name,
      npwp_number,
      npwp_document_url,
      nib_number,
      nib_document_url,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }, { status: 400 })
    }

    // Check if user already has a pending/approved registration
    const { data: existing } = await supabase
      .from('dealer_registrations')
      .select('id, status')
      .eq('user_id', user_id)
      .in('status', ['pending', 'under_review', 'approved'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: `User already has a ${existing.status} dealer registration`,
      }, { status: 400 })
    }

    // Generate slug from dealer name
    const slug = dealer_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('dealer_registrations')
      .select('id')
      .eq('dealer_slug', slug)
      .maybeSingle()

    const uniqueSlug = existingSlug ? `${slug}-${Date.now()}` : slug

    // Create registration
    const registrationData = {
      id: uuidv4(),
      user_id,
      dealer_name,
      dealer_slug: uniqueSlug,
      dealer_phone: dealer_phone || null,
      dealer_email: dealer_email || null,
      dealer_description: dealer_description || null,
      dealer_logo_url: dealer_logo_url || null,
      
      province_id: province_id || null,
      city_id: city_id || null,
      district_id: district_id || null,
      village_id: village_id || null,
      full_address: full_address || null,
      postal_code: postal_code || null,
      
      owner_name,
      owner_ktp_number: owner_ktp_number || null,
      owner_phone: owner_phone || null,
      owner_ktp_url: owner_ktp_url || null,
      owner_selfie_url: owner_selfie_url || null,
      
      npwp_number,
      npwp_document_url,
      nib_number,
      nib_document_url,
      siup_number: siup_number || null,
      siup_document_url: siup_document_url || null,
      domicile_letter_url: domicile_letter_url || null,
      additional_documents: additional_documents || [],
      
      status: submit_now ? 'pending' : 'draft',
      submitted_at: submit_now ? new Date().toISOString() : null,
    }

    const { data: registration, error } = await supabase
      .from('dealer_registrations')
      .insert(registrationData)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update user role to dealer if approved
    // (This would be done by admin later)

    return NextResponse.json({
      success: true,
      message: submit_now 
        ? 'Dealer registration submitted successfully' 
        : 'Dealer registration saved as draft',
      registration,
    })
  } catch (error) {
    console.error('Error creating dealer registration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create dealer registration',
    }, { status: 500 })
  }
}

// PUT - Update dealer registration
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { registration_id, submit_now = false, ...updateData } = body

    if (!registration_id) {
      return NextResponse.json({
        success: false,
        error: 'Registration ID required',
      }, { status: 400 })
    }

    // Check current status
    const { data: current } = await supabase
      .from('dealer_registrations')
      .select('status')
      .eq('id', registration_id)
      .single()

    if (!current) {
      return NextResponse.json({
        success: false,
        error: 'Registration not found',
      }, { status: 404 })
    }

    // Can only update draft, pending, or rejected
    if (!['draft', 'pending', 'rejected'].includes(current.status)) {
      return NextResponse.json({
        success: false,
        error: `Cannot update registration with status: ${current.status}`,
      }, { status: 400 })
    }

    // Prepare update payload
    const payload: Record<string, unknown> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    if (submit_now) {
      payload.status = 'pending'
      payload.submitted_at = new Date().toISOString()
    }

    // Update registration
    const { data: registration, error } = await supabase
      .from('dealer_registrations')
      .update(payload)
      .eq('id', registration_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: submit_now 
        ? 'Dealer registration submitted successfully' 
        : 'Dealer registration updated',
      registration,
    })
  } catch (error) {
    console.error('Error updating dealer registration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update dealer registration',
    }, { status: 500 })
  }
}
