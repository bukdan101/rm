import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Silakan login terlebih dahulu' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'purchase', 'usage', 'bonus', etc.

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_credits')
      .select('id, balance, total_earned, total_spent')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      // Create wallet if not exists
      const { data: newWallet, error: createError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Gagal membuat dompet pengguna' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        transactions: [],
        balance: 0,
        walletId: newWallet.id,
      })
    }

    // Build query for transactions
    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_credit_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: transactions, error: txError } = await query

    if (txError) {
      console.error('Error fetching transactions:', txError)
      return NextResponse.json({ 
        success: false, 
        error: 'Gagal mengambil data transaksi' 
      }, { status: 500 })
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
      success: true,
      transactions: transformedTransactions,
      balance: wallet.balance || 0,
      totalEarned: wallet.total_earned || 0,
      totalSpent: wallet.total_spent || 0,
      walletId: wallet.id,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    }, { status: 500 })
  }
}
