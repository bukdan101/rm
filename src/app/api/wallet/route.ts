import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch user wallet/credits balance
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query or auth
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      // Try to get from auth header
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({
          success: true,
          credits: {
            balance: 0,
            total_earned: 0,
            total_spent: 0
          }
        })
      }
    }

    // For now, return a mock balance for demo
    // In production, fetch from user_credits table
    const { data: userCredit, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user credits:', error)
    }

    // If no credit record exists, return default
    if (!userCredit) {
      return NextResponse.json({
        success: true,
        credits: {
          balance: 0,
          total_earned: 0,
          total_spent: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      credits: {
        balance: userCredit.balance || 0,
        total_earned: userCredit.total_earned || 0,
        total_spent: userCredit.total_spent || 0
      }
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({
      success: true,
      credits: {
        balance: 0,
        total_earned: 0,
        total_spent: 0
      }
    })
  }
}

// POST - Add credits to wallet (after purchase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, packageId, paymentMethod, transactionId } = body

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has a credit record
    const { data: existingCredit, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking existing credits:', fetchError)
    }

    let newBalance = amount
    let result

    if (existingCredit) {
      // Update existing record
      newBalance = existingCredit.balance + amount
      const { data, error } = await supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          total_earned: existingCredit.total_earned + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCredit.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          balance: amount,
          total_earned: amount,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_credit_id: result.id,
        type: 'purchase',
        amount: amount,
        balance_before: existingCredit?.balance || 0,
        balance_after: newBalance,
        description: `Purchase via ${paymentMethod}`,
        reference_id: transactionId || packageId
      })

    return NextResponse.json({
      success: true,
      credits: result,
      message: 'Credits added successfully'
    })
  } catch (error) {
    console.error('Error adding credits:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add credits' },
      { status: 500 }
    )
  }
}
