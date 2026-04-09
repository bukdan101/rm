import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get user's credit transaction history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    
    // Check if user is a dealer
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    
    // Get user credits
    let creditQuery = supabase
      .from('user_credits')
      .select('id')
    
    if (dealer) {
      creditQuery = creditQuery.eq('dealer_id', dealer.id)
    } else {
      creditQuery = creditQuery.eq('user_id', user.id)
    }
    
    const { data: userCredit } = await creditQuery.single()
    
    if (!userCredit) {
      return NextResponse.json({ transactions: [], total: 0 })
    }
    
    // Build transaction query
    let transactionQuery = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_credit_id', userCredit.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (type) {
      transactionQuery = transactionQuery.eq('type', type)
    }
    
    const { data: transactions, count, error } = await transactionQuery
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      transactions,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
