import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Process credit purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, paymentMethod, userId } = body

    if (!packageId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    // If package not in DB, use default calculation
    let credits = 50
    let bonusCredits = 0
    let price = 50000

    if (pkg && !pkgError) {
      credits = pkg.credits
      bonusCredits = pkg.bonus_credits || 0
      price = pkg.price
    } else {
      // Default packages mapping
      const defaultPackages: Record<string, { credits: number; bonus: number; price: number }> = {
        'pkg-starter': { credits: 50, bonus: 0, price: 50000 },
        'pkg-popular': { credits: 150, bonus: 15, price: 125000 },
        'pkg-business': { credits: 350, bonus: 50, price: 275000 },
        'pkg-enterprise': { credits: 750, bonus: 150, price: 550000 },
      }
      const defaultPkg = defaultPackages[packageId]
      if (defaultPkg) {
        credits = defaultPkg.credits
        bonusCredits = defaultPkg.bonus
        price = defaultPkg.price
      }
    }

    const totalCredits = credits + bonusCredits

    // Create purchase transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        amount: totalCredits,
        balance_before: 0, // Will be updated after credit check
        balance_after: 0,
        description: `Purchase ${credits} credits${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ''} via ${paymentMethod}`,
        reference_id: `PUR-${Date.now()}-${userId.slice(0, 8)}`,
        status: paymentMethod === 'online' ? 'completed' : 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .maybeSingle()

    // For online payment, immediately add credits
    if (paymentMethod === 'online') {
      // Check if user has credit record
      const { data: userCredit, error: creditError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (userCredit) {
        // Update existing credit
        const newBalance = userCredit.balance + totalCredits
        await supabase
          .from('user_credits')
          .update({
            balance: newBalance,
            total_earned: userCredit.total_earned + totalCredits,
            updated_at: new Date().toISOString()
          })
          .eq('id', userCredit.id)

        // Update transaction with balance info
        if (transaction) {
          await supabase
            .from('credit_transactions')
            .update({
              balance_before: userCredit.balance,
              balance_after: newBalance
            })
            .eq('id', transaction.id)
        }
      } else {
        // Create new credit record
        await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: totalCredits,
            total_earned: totalCredits,
            total_spent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        // Update transaction with balance info
        if (transaction) {
          await supabase
            .from('credit_transactions')
            .update({
              balance_before: 0,
              balance_after: totalCredits
            })
            .eq('id', transaction.id)
        }
      }

      return NextResponse.json({
        success: true,
        creditsAdded: totalCredits,
        transactionId: transaction?.id,
        message: 'Credits added successfully'
      })
    }

    // For manual payment, return bank details
    return NextResponse.json({
      success: true,
      status: 'pending',
      creditsToAdd: totalCredits,
      amount: price,
      bankDetails: {
        bank: 'BNI',
        accountNumber: '1234567890',
        accountName: 'AutoMarket Indonesia',
        reference: transaction?.reference_id
      },
      instructions: `Silakan transfer ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)} ke rekening di atas dengan kode referensi: ${transaction?.reference_id}`
    })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get purchase history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({
        success: true,
        transactions: []
      })
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Transaction fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
