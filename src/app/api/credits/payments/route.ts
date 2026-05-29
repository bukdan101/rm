import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// BNI VA Configuration
const BNI_VA_PREFIX = '8808' // Example prefix, should be configured
const BNI_COMPANY_CODE = 'AUTOMARKET' // Company code for VA generation

// Generate VA Number
function generateVANumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${BNI_VA_PREFIX}${timestamp}${random}`
}

// Generate Invoice Number
function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}${day}-${random}`
}

// GET: Get user's payments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    let query = supabase
      .from('payments')
      .select(`
        *,
        package:credit_packages(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (dealer) {
      query = query.eq('dealer_id', dealer.id)
    } else {
      query = query.eq('user_id', user.id)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: payments, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new payment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { package_id, user_notes } = body
    
    if (!package_id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }
    
    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single()
    
    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    // Validate package type matches user type
    if (pkg.is_for_dealer && !dealer) {
      return NextResponse.json({ error: 'This package is only for dealers' }, { status: 400 })
    }
    
    if (!pkg.is_for_dealer && dealer) {
      return NextResponse.json({ error: 'Please select a dealer package' }, { status: 400 })
    }
    
    // Generate VA and invoice number
    const va_number = generateVANumber()
    const invoice_number = generateInvoiceNumber()
    
    // Set expiry to 24 hours from now
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    // Create payment record
    const payment = {
      invoice_number,
      user_id: dealer ? null : user.id,
      dealer_id: dealer?.id || null,
      package_id,
      amount: pkg.price,
      credits_awarded: pkg.total_credits,
      payment_method: 'bni_va',
      va_number,
      status: 'pending',
      user_notes,
      expires_at
    }
    
    const { data: newPayment, error: createError } = await supabase
      .from('payments')
      .insert(payment)
      .select(`
        *,
        package:credit_packages(*)
      `)
      .single()
    
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
    
    return NextResponse.json({
      payment: newPayment,
      bank_info: {
        bank_name: 'BNI',
        va_number,
        account_name: 'AUTOMARKET INDONESIA',
        amount: pkg.price,
        expires_at
      }
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update payment (upload proof or cancel)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { payment_id, action, proof_url } = body
    
    if (!payment_id || !action) {
      return NextResponse.json({ error: 'Payment ID and action are required' }, { status: 400 })
    }
    
    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single()
    
    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // Verify ownership
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    const isOwner = (dealer && payment.dealer_id === dealer.id) || 
                    (!dealer && payment.user_id === user.id)
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    if (action === 'upload_proof') {
      if (!proof_url) {
        return NextResponse.json({ error: 'Proof URL is required' }, { status: 400 })
      }
      
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_url,
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', payment_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      return NextResponse.json({ message: 'Proof uploaded successfully' })
    }
    
    if (action === 'cancel') {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', payment_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      return NextResponse.json({ message: 'Payment cancelled' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
