import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

// GET - Get certificate info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspection_id')
    const userId = searchParams.get('user_id')

    let query = supabase
      .from('certificate_purchases')
      .select(`
        *,
        inspection:car_inspections(
          id,
          overall_grade,
          inspection_score,
          car_listing_id,
          car_listings(title, brands(name), car_models(name), year)
        )
      `)
      .order('created_at', { ascending: false })

    if (inspectionId) {
      query = query.eq('inspection_id', inspectionId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}

// POST - Purchase certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const { inspection_id, user_id, car_listing_id } = body

    // Get inspection details
    const { data: inspection, error: inspectionError } = await supabase
      .from('car_inspections')
      .select('*')
      .eq('id', inspection_id)
      .single()

    if (inspectionError) throw inspectionError

    if (inspection.has_certificate) {
      return NextResponse.json(
        { success: false, error: 'Inspection already has certificate' },
        { status: 400 }
      )
    }

    // Get certificate pricing
    const { data: pricing, error: pricingError } = await supabase
      .from('inspection_pricing')
      .select('*')
      .eq('type', 'certificate')
      .eq('is_active', true)
      .single()

    if (pricingError) throw pricingError

    // Generate purchase and certificate numbers
    const purchaseNumber = `CERT-PURCHASE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    const validityDays = pricing.certificate_validity_days || 90

    // Create certificate purchase record
    const { data: purchase, error: purchaseError } = await adminClient
      .from('certificate_purchases')
      .insert({
        purchase_number: purchaseNumber,
        inspection_id,
        user_id,
        car_listing_id,
        token_cost: pricing.token_cost,
        payment_status: pricing.token_cost === 0 ? 'paid' : 'pending',
        paid_at: pricing.token_cost === 0 ? new Date().toISOString() : null,
        certificate_number,
        issued_at: pricing.token_cost === 0 ? new Date().toISOString() : null,
        expires_at: pricing.token_cost === 0 
          ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString() 
          : null
      })
      .select()
      .single()

    if (purchaseError) throw purchaseError

    // If free, update inspection immediately
    if (pricing.token_cost === 0) {
      await adminClient
        .from('car_inspections')
        .update({
          has_certificate: true,
          certificate_purchased_at: new Date().toISOString(),
          certificate_number,
          certificate_url: `/certificates/${certificateNumber}`
        })
        .eq('id', inspection_id)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        purchase,
        token_required: pricing.token_cost,
        certificate_number,
        validity_days: validityDays
      }
    })
  } catch (error) {
    console.error('Error purchasing certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to purchase certificate' },
      { status: 500 }
    )
  }
}

// PUT - Confirm payment (after token deduction)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const { purchase_id, inspection_id } = body

    // Get validity days from pricing
    const { data: purchase } = await supabase
      .from('certificate_purchases')
      .select('token_cost')
      .eq('id', purchase_id)
      .single()

    // Update purchase status
    const { data, error } = await adminClient
      .from('certificate_purchases')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', purchase_id)
      .select()
      .single()

    if (error) throw error

    // Update inspection
    await adminClient
      .from('car_inspections')
      .update({
        has_certificate: true,
        certificate_purchased_at: new Date().toISOString(),
        certificate_number: data.certificate_number,
        certificate_url: `/certificates/${data.certificate_number}`
      })
      .eq('id', inspection_id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error confirming certificate payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
