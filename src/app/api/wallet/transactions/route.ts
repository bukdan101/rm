import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ transactions: [], balance: 0 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'purchase', 'usage', 'bonus', etc.

    // Get user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet) {
      // Create wallet if not exists
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        })
        .select()
        .single()

      return NextResponse.json({
        transactions: [],
        balance: 0,
        walletId: newWallet?.id,
      })
    }

    // Build query for transactions
    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ 
        transactions: [], 
        balance: wallet.balance || 0 
      })
    }

    // Transform for frontend
    const transformedTransactions = (transactions || []).map(tx => ({
      id: tx.id,
      type: tx.amount >= 0 ? 'credit' : 'debit',
      transactionType: tx.type,
      amount: Math.abs(tx.amount),
      description: tx.description,
      balanceBefore: tx.balance_before,
      balanceAfter: tx.balance_after,
      createdAt: tx.created_at,
      referenceId: tx.reference_id,
      referenceType: tx.reference_type,
    }))

    return NextResponse.json({
      transactions: transformedTransactions,
      balance: wallet.balance || 0,
      walletId: wallet.id,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ transactions: [], balance: 0 })
  }
}
