import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch user wallet/credits balance
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Silakan login terlebih dahulu' 
      }, { status: 401 })
    }

    // Get user credits from database
    const { data: userCredit, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user credits:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Gagal mengambil data kredit' 
      }, { status: 500 })
    }

    // If no credit record exists, create one
    if (!userCredit) {
      const { data: newCredit, error: createError } = await supabase
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
        console.error('Error creating user credits:', createError)
        return NextResponse.json({ 
          success: false, 
          error: 'Gagal membuat data kredit' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        credits: {
          id: newCredit.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      credits: {
        id: userCredit.id,
        balance: userCredit.balance || 0,
        total_earned: userCredit.total_earned || 0,
        total_spent: userCredit.total_spent || 0
      }
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    }, { status: 500 })
  }
}

// POST - Add credits to wallet (after purchase)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Silakan login terlebih dahulu' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { amount, packageId, paymentMethod, transactionId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Jumlah kredit tidak valid' },
        { status: 400 }
      )
    }

    // Check if user has a credit record
    const { data: existingCredit, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking existing credits:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: 'Gagal memeriksa saldo' 
      }, { status: 500 })
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
          user_id: user.id,
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
        description: `Pembelian via ${paymentMethod || 'manual'} - Package: ${packageId || 'N/A'}`,
        reference_id: transactionId || packageId
      })

    return NextResponse.json({
      success: true,
      credits: result,
      message: 'Kredit berhasil ditambahkan'
    })
  } catch (error) {
    console.error('Error adding credits:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan kredit' },
      { status: 500 }
    )
  }
}

// PUT - Deduct credits (for internal use)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, referenceId, referenceType } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Jumlah kredit tidak valid' },
        { status: 400 }
      )
    }

    // Get current balance
    const { data: existingCredit, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCredit) {
      return NextResponse.json({ 
        success: false, 
        error: 'Data kredit tidak ditemukan' 
      }, { status: 404 })
    }

    if (existingCredit.balance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saldo tidak mencukupi',
        currentBalance: existingCredit.balance,
        requestedAmount: amount
      }, { status: 400 })
    }

    const newBalance = existingCredit.balance - amount

    // Update balance
    const { data: result, error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_spent: existingCredit.total_spent + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCredit.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_credit_id: existingCredit.id,
        type: 'usage',
        amount: -amount, // Negative for deduction
        balance_before: existingCredit.balance,
        balance_after: newBalance,
        description: description || 'Penggunaan kredit',
        reference_id: referenceId,
        reference_type: referenceType
      })

    return NextResponse.json({
      success: true,
      credits: result,
      message: 'Kredit berhasil dikurangi'
    })
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengurangi kredit' },
      { status: 500 }
    )
  }
}
