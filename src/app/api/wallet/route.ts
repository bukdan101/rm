import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch user wallet/credits balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Silakan login terlebih dahulu',
      }, { status: 401 })
    }

    // Get user credits from database using db.userCredit
    let userCredit = await db.userCredit.findUnique({
      where: { user_id: userId },
    })

    // If no credit record exists, create one
    if (!userCredit) {
      userCredit = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      credits: {
        id: userCredit.id,
        balance: userCredit.balance || 0,
        total_earned: userCredit.total_earned || 0,
        total_spent: userCredit.total_spent || 0,
      },
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
    }, { status: 500 })
  }
}

// POST - Add credits to wallet (after purchase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, packageId, paymentMethod, transactionId } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Silakan login terlebih dahulu',
      }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Jumlah kredit tidak valid' },
        { status: 400 }
      )
    }

    // Check if user has a credit record
    let existingCredit = await db.userCredit.findUnique({
      where: { user_id: userId },
    })

    let newBalance = amount
    let result

    if (existingCredit) {
      // Update existing record
      newBalance = existingCredit.balance + amount
      result = await db.userCredit.update({
        where: { id: existingCredit.id },
        data: {
          balance: newBalance,
          total_earned: existingCredit.total_earned + amount,
        },
      })
    } else {
      // Create new record
      result = await db.userCredit.create({
        data: {
          user_id: userId,
          balance: amount,
          total_earned: amount,
          total_spent: 0,
        },
      })
    }

    // Record transaction using db.creditTransaction
    await db.creditTransaction.create({
      data: {
        user_credit_id: result.id,
        user_id: userId,
        type: 'purchase',
        amount: amount,
        balance_before: existingCredit?.balance || 0,
        balance_after: newBalance,
        description: `Pembelian via ${paymentMethod || 'manual'} - Package: ${packageId || 'N/A'}`,
        reference_id: transactionId || packageId,
      },
    })

    return NextResponse.json({
      success: true,
      credits: result,
      message: 'Kredit berhasil ditambahkan',
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
    const body = await request.json()
    const { userId, amount, description, referenceId, referenceType } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Jumlah kredit tidak valid' },
        { status: 400 }
      )
    }

    // Get current balance
    const existingCredit = await db.userCredit.findUnique({
      where: { user_id: userId },
    })

    if (!existingCredit) {
      return NextResponse.json({
        success: false,
        error: 'Data kredit tidak ditemukan',
      }, { status: 404 })
    }

    if (existingCredit.balance < amount) {
      return NextResponse.json({
        success: false,
        error: 'Saldo tidak mencukupi',
        currentBalance: existingCredit.balance,
        requestedAmount: amount,
      }, { status: 400 })
    }

    const newBalance = existingCredit.balance - amount

    // Update balance
    const result = await db.userCredit.update({
      where: { id: existingCredit.id },
      data: {
        balance: newBalance,
        total_spent: existingCredit.total_spent + amount,
      },
    })

    // Record transaction using db.creditTransaction
    await db.creditTransaction.create({
      data: {
        user_credit_id: existingCredit.id,
        user_id: userId,
        type: 'usage',
        amount: -amount, // Negative for deduction
        balance_before: existingCredit.balance,
        balance_after: newBalance,
        description: description || 'Penggunaan kredit',
        reference_id: referenceId || null,
        reference_type: referenceType || null,
      },
    })

    return NextResponse.json({
      success: true,
      credits: result,
      message: 'Kredit berhasil dikurangi',
    })
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengurangi kredit' },
      { status: 500 }
    )
  }
}
