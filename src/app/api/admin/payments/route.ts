import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    // Enrich payments with user, dealer, and package data
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const result: Record<string, unknown> = { ...payment }

        // Fetch user profile
        if (payment.user_id) {
          const userProfile = await db.profile.findUnique({
            where: { id: payment.user_id },
            select: { id: true, full_name: true, email: true },
          })
          result.user = userProfile
        }

        // Fetch dealer
        if (payment.dealer_id) {
          const dealer = await db.dealer.findUnique({
            where: { id: payment.dealer_id },
            select: { id: true, name: true, slug: true },
          })
          result.dealer = dealer
        }

        // Fetch verifier profile using verified_by field
        if (payment.verified_by) {
          const verifier = await db.profile.findUnique({
            where: { id: payment.verified_by },
            select: { id: true, full_name: true },
          })
          result.verifier = verifier
        }

        // Fetch credit package using package_id field
        if (payment.package_id) {
          const creditPackage = await db.creditPackage.findUnique({
            where: { id: payment.package_id },
          })
          result.package = creditPackage
        }

        return result
      })
    )

    return NextResponse.json({
      payments: enrichedPayments,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Verify payment (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_id, action, admin_notes, verified_by } = body

    if (!payment_id || !action) {
      return NextResponse.json({ error: 'Payment ID and action are required' }, { status: 400 })
    }

    // Get payment
    const payment = await db.payment.findUnique({
      where: { id: payment_id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (action === 'verify') {
      // Verify payment - verified_by and admin_notes now exist in Payment schema
      await db.payment.update({
        where: { id: payment_id },
        data: {
          status: 'verified',
          verified_at: new Date(),
          verified_by: verified_by || null,
          admin_notes: admin_notes || null,
        },
      })

      // Get or create user credits
      let userCredit = null
      if (payment.dealer_id) {
        userCredit = await db.userCredit.findFirst({
          where: { dealer_id: payment.dealer_id },
        })
      } else if (payment.user_id) {
        userCredit = await db.userCredit.findUnique({
          where: { user_id: payment.user_id },
        })
      }

      if (userCredit) {
        // Update existing credits
        const newBalance = userCredit.balance + (payment.credits_awarded || 0)

        await db.userCredit.update({
          where: { id: userCredit.id },
          data: {
            balance: newBalance,
            total_earned: userCredit.total_earned + (payment.credits_awarded || 0),
          },
        })

        // Record transaction
        await db.creditTransaction.create({
          data: {
            user_credit_id: userCredit.id,
            user_id: payment.user_id,
            type: 'purchase',
            amount: payment.credits_awarded || 0,
            balance_before: userCredit.balance,
            balance_after: newBalance,
            description: `Pembelian paket ${payment.package_id || 'N/A'}`,
            reference_id: payment.id,
            reference_type: 'payment',
          },
        })
      } else {
        // Create new credits record
        const newCredits = await db.userCredit.create({
          data: {
            user_id: payment.user_id,
            dealer_id: payment.dealer_id,
            balance: payment.credits_awarded || 0,
            total_earned: payment.credits_awarded || 0,
            total_spent: 0,
          },
        })

        // Record transaction
        await db.creditTransaction.create({
          data: {
            user_credit_id: newCredits.id,
            user_id: payment.user_id,
            type: 'purchase',
            amount: payment.credits_awarded || 0,
            balance_before: 0,
            balance_after: payment.credits_awarded || 0,
            description: `Pembelian paket ${payment.package_id || 'N/A'}`,
            reference_id: payment.id,
            reference_type: 'payment',
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        credits_awarded: payment.credits_awarded,
      })
    }

    if (action === 'reject') {
      // Reject payment - admin_notes now exists in Payment schema
      await db.payment.update({
        where: { id: payment_id },
        data: {
          status: 'cancelled',
          admin_notes: admin_notes || null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
