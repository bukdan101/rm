import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Deduct credits for listing creation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { amount, description, reference } = body
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    // Get user credits
    let creditQuery = supabase
      .from('user_credits')
      .select('*')
    
    if (dealer) {
      creditQuery = creditQuery.eq('dealer_id', dealer.id)
    } else {
      creditQuery = creditQuery.eq('user_id', user.id)
    }
    
    const { data: userCredit, error: creditError } = await creditQuery.single()
    
    if (creditError || !userCredit) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 })
    }
    
    // Check balance
    if (userCredit.balance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: amount,
        current: userCredit.balance
      }, { status: 400 })
    }
    
    // Deduct credits
    const newBalance = userCredit.balance - amount
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_spent: userCredit.total_spent + amount
      })
      .eq('id', userCredit.id)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }
    
    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_credit_id: userCredit.id,
        type: 'usage',
        amount: -amount,
        balance_before: userCredit.balance,
        balance_after: newBalance,
        description: description || 'Credit deduction',
        reference_id: reference?.id,
        reference_type: reference?.type
      })
    
    if (transactionError) {
      console.error('Failed to record transaction:', transactionError)
      // Don't rollback, just log the error
    }
    
    return NextResponse.json({
      success: true,
      balance_before: userCredit.balance,
      balance_after: newBalance,
      amount_deducted: amount
    })
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
