import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const REGISTRATION_BONUS = 500

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user already received registration bonus
    const { data: existingBonus } = await supabase
      .from('token_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('transaction_type', 'bonus')
      .eq('description', 'Bonus registrasi user baru')
      .limit(1)

    if (existingBonus && existingBonus.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'User already received registration bonus',
        credits: null,
      })
    }

    // Ensure profile exists first
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!profile) {
      // Create profile if doesn't exist
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email || `${userId}@example.com`,
          full_name: name || 'User',
        })
    }

    // Get or create user tokens
    const { data: userTokens } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!userTokens) {
      // Create new user tokens with bonus
      await supabase
        .from('user_tokens')
        .insert({
          user_id: userId,
          balance: REGISTRATION_BONUS,
          total_bonus: REGISTRATION_BONUS,
        })

      // Create transaction record
      await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'bonus',
          amount: REGISTRATION_BONUS,
          balance_before: 0,
          balance_after: REGISTRATION_BONUS,
          description: 'Bonus registrasi user baru',
          reference_type: 'registration',
          reference_id: userId,
        })

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: REGISTRATION_BONUS,
          bonus: REGISTRATION_BONUS,
        },
      })
    } else {
      // User tokens already exist, add bonus
      const newBalance = (userTokens.balance || 0) + REGISTRATION_BONUS
      const newTotalBonus = (userTokens.total_bonus || 0) + REGISTRATION_BONUS

      await supabase
        .from('user_tokens')
        .update({
          balance: newBalance,
          total_bonus: newTotalBonus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userTokens.id)

      // Create transaction record
      await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'bonus',
          amount: REGISTRATION_BONUS,
          balance_before: userTokens.balance || 0,
          balance_after: newBalance,
          description: 'Bonus registrasi user baru',
          reference_type: 'registration',
          reference_id: userId,
        })

      return NextResponse.json({
        success: true,
        message: `Selamat! Anda mendapatkan bonus ${REGISTRATION_BONUS} kredit`,
        credits: {
          balance: newBalance,
          bonus: REGISTRATION_BONUS,
        },
      })
    }
  } catch (error) {
    console.error('Error giving registration bonus:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to give registration bonus' },
      { status: 500 }
    )
  }
}
