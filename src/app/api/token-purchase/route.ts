import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Token packages
const TOKEN_PACKAGES = [
  { id: 1, tokens: 50, price: 50000, bonus: 0 },
  { id: 2, tokens: 100, price: 95000, bonus: 5 },
  { id: 3, tokens: 250, price: 225000, bonus: 15 },
  { id: 4, tokens: 500, price: 425000, bonus: 50 },
  { id: 5, tokens: 1000, price: 800000, bonus: 150 },
]

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId } = body

    // Find the package
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Invalid package' }, { status: 400 })
    }

    const totalTokens = pkg.tokens + pkg.bonus

    // Get current balance from user_credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let newBalance = totalTokens
    let creditId: string

    if (credits) {
      // Update existing balance
      newBalance = credits.balance + totalTokens
      creditId = credits.id

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          total_earned: (credits.total_earned || 0) + totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq('id', credits.id)

      if (updateError) {
        console.error('Update credits error:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to update balance' }, { status: 500 })
      }
    } else {
      // Create new credits record
      const { data: newCredits, error: createError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: totalTokens,
          total_earned: totalTokens,
          total_spent: 0,
        })
        .select()
        .single()

      if (createError || !newCredits) {
        console.error('Create credits error:', createError)
        return NextResponse.json({ success: false, error: 'Failed to create balance' }, { status: 500 })
      }

      creditId = newCredits.id
    }

    // Record the transaction
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_credit_id: creditId,
          type: 'purchase',
          amount: totalTokens,
          balance_before: credits?.balance || 0,
          balance_after: newBalance,
          description: `Purchased ${pkg.tokens} tokens${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''}`,
          reference_type: 'token_purchase',
          reference_id: `pkg_${packageId}`,
        })
    } catch (txError) {
      console.error('Transaction record error:', txError)
      // Don't fail the purchase if transaction recording fails
    }

    // Also try to record in token_transactions if it exists
    try {
      await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: totalTokens,
          balance_after: newBalance,
          description: `Purchased ${pkg.tokens} tokens${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''}`,
        })
    } catch (txError) {
      // Table might not exist, ignore
    }

    return NextResponse.json({
      success: true,
      newBalance,
      tokensAdded: totalTokens,
      transaction: {
        id: `tx_${Date.now()}`,
        type: 'purchase',
        amount: totalTokens,
        balance_after: newBalance,
        description: `Purchased ${pkg.tokens} tokens${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''}`,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Token purchase error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
