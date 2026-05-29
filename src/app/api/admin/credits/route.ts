import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get all user credits (admin only)
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
    
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select(`
        *,
        user:profiles(id, full_name, email),
        dealer:dealers(id, name, slug)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ credits })
  } catch (error) {
    console.error('Error fetching admin credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Adjust user credits (admin only)
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
    const { credit_id, amount, description } = body
    
    if (!credit_id || amount === undefined) {
      return NextResponse.json({ error: 'Credit ID and amount are required' }, { status: 400 })
    }
    
    // Get current credits
    const { data: userCredit, error: creditError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('id', credit_id)
      .single()
    
    if (creditError || !userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }
    
    const newBalance = userCredit.balance + amount
    
    if (newBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance for this adjustment' }, { status: 400 })
    }
    
    // Update credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_earned: amount > 0 ? userCredit.total_earned + amount : userCredit.total_earned,
        total_spent: amount < 0 ? userCredit.total_spent + Math.abs(amount) : userCredit.total_spent
      })
      .eq('id', credit_id)
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_credit_id: userCredit.id,
        type: 'admin_adjustment',
        amount: amount,
        balance_before: userCredit.balance,
        balance_after: newBalance,
        description: description || 'Admin adjustment'
      })
    
    return NextResponse.json({
      success: true,
      balance_before: userCredit.balance,
      balance_after: newBalance,
      adjustment: amount
    })
  } catch (error) {
    console.error('Error adjusting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
