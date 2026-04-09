import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get user's credit balance
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    // Get or create user credits
    let creditQuery = supabase
      .from('user_credits')
      .select('*')
    
    if (dealer) {
      creditQuery = creditQuery.eq('dealer_id', dealer.id)
    } else {
      creditQuery = creditQuery.eq('user_id', user.id)
    }
    
    const { data: credits, error: creditError } = await creditQuery.single()
    
    if (creditError && creditError.code !== 'PGRST116') {
      return NextResponse.json({ error: creditError.message }, { status: 500 })
    }
    
    // If no credits record, create one (with registration bonus check)
    if (!credits) {
      const { data: bonusTracker } = await supabase
        .from('registration_bonus_tracker')
        .select('*')
        .eq('is_active', true)
        .single()
      
      let initialBalance = 0
      
      // Check if eligible for registration bonus (first 500)
      if (bonusTracker && bonusTracker.total_given < bonusTracker.max_bonus) {
        initialBalance = bonusTracker.bonus_amount
        
        // Create credits record
        const newCredit = {
          user_id: dealer ? null : user.id,
          dealer_id: dealer?.id || null,
          balance: initialBalance,
          total_earned: initialBalance,
          total_spent: 0
        }
        
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .insert(newCredit)
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
        
        // Record transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_credit_id: newCredits.id,
            type: 'registration_bonus',
            amount: initialBalance,
            balance_before: 0,
            balance_after: initialBalance,
            description: `Bonus pendaftaran (${bonusTracker.total_given + 1}/500)`,
            reference_type: 'registration'
          })
        
        // Update bonus tracker
        await supabase
          .from('registration_bonus_tracker')
          .update({ total_given: bonusTracker.total_given + 1 })
          .eq('id', bonusTracker.id)
        
        return NextResponse.json({
          credits: newCredits,
          isNewUser: true,
          bonusReceived: initialBalance
        })
      } else {
        // No bonus, create empty credits
        const newCredit = {
          user_id: dealer ? null : user.id,
          dealer_id: dealer?.id || null,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        }
        
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .insert(newCredit)
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
        
        return NextResponse.json({
          credits: newCredits,
          isNewUser: true,
          bonusReceived: 0
        })
      }
    }
    
    return NextResponse.json({
      credits,
      isNewUser: false,
      bonusReceived: 0
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
