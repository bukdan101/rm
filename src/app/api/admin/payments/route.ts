import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get all payments (admin only)
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabase
      .from('payments')
      .select(`
        *,
        package:credit_packages(*),
        user:profiles!payments_user_id_fkey(id, full_name, email),
        dealer:dealers(id, name, slug),
        verifier:profiles!payments_verified_by_fkey(id, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: payments, count, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      payments,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Verify payment (admin only)
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
    const { payment_id, action, admin_notes } = body
    
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
    
    if (action === 'verify') {
      // Verify payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          admin_notes
        })
        .eq('id', payment_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      // Get or create user credits
      let creditQuery = supabase
        .from('user_credits')
        .select('*')
      
      if (payment.dealer_id) {
        creditQuery = creditQuery.eq('dealer_id', payment.dealer_id)
      } else {
        creditQuery = creditQuery.eq('user_id', payment.user_id)
      }
      
      const { data: userCredit } = await creditQuery.single()
      
      if (userCredit) {
        // Update existing credits
        const newBalance = userCredit.balance + payment.credits_awarded
        
        await supabase
          .from('user_credits')
          .update({
            balance: newBalance,
            total_earned: userCredit.total_earned + payment.credits_awarded
          })
          .eq('id', userCredit.id)
        
        // Record transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_credit_id: userCredit.id,
            type: 'purchase',
            amount: payment.credits_awarded,
            balance_before: userCredit.balance,
            balance_after: newBalance,
            description: `Pembelian paket ${payment.package_id}`,
            reference_id: payment.id,
            reference_type: 'payment'
          })
      } else {
        // Create new credits record
        const newCredit = {
          user_id: payment.user_id,
          dealer_id: payment.dealer_id,
          balance: payment.credits_awarded,
          total_earned: payment.credits_awarded,
          total_spent: 0
        }
        
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .insert(newCredit)
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json({ error: 'Failed to create credits' }, { status: 500 })
        }
        
        // Record transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_credit_id: newCredits.id,
            type: 'purchase',
            amount: payment.credits_awarded,
            balance_before: 0,
            balance_after: payment.credits_awarded,
            description: `Pembelian paket ${payment.package_id}`,
            reference_id: payment.id,
            reference_type: 'payment'
          })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        credits_awarded: payment.credits_awarded
      })
    }
    
    if (action === 'reject') {
      // Reject payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          admin_notes
        })
        .eq('id', payment_id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Payment rejected'
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
