import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { astraPayService, generateMerchantTrxId } from '@/lib/astrapay'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

interface PayMonthlyRequestBody {
  creditApplicationId: string
  paymentNumber: number
  paymentMethod: 'astrapay_balance' | 'bank_transfer' | 'direct_debit'
}

// POST – Pay monthly installment via AstraPay
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body: PayMonthlyRequestBody = await request.json()
    const { creditApplicationId, paymentNumber, paymentMethod = 'astrapay_balance' } = body

    if (!creditApplicationId) {
      return errorResponse('creditApplicationId is required', 400, 'MISSING_APPLICATION_ID')
    }
    if (!paymentNumber) {
      return errorResponse('paymentNumber is required', 400, 'MISSING_PAYMENT_NUMBER')
    }

    // Get credit application
    const application = await db.creditApplication.findUnique({
      where: { id: creditApplicationId },
      include: { payments: true },
    })

    if (!application) {
      return errorResponse('Credit application not found', 404, 'NOT_FOUND')
    }

    // Only the owner or admin can pay
    if (application.user_id !== auth.userId && auth.profile.role !== 'admin') {
      return errorResponse('Access denied', 403, 'FORBIDDEN')
    }

    // Application must be approved or disbursed
    if (!['approved', 'disbursed'].includes(application.status)) {
      return errorResponse('Application must be approved to make payments', 400, 'INVALID_STATUS')
    }

    // Find the specific payment
    const payment = application.payments.find(
      (p) => p.payment_number === paymentNumber,
    )

    if (!payment) {
      return errorResponse('Payment not found', 404, 'PAYMENT_NOT_FOUND')
    }

    if (payment.status === 'paid') {
      return errorResponse('Payment already made', 400, 'ALREADY_PAID')
    }

    // Create AstraPay transaction
    const merchantTrxId = generateMerchantTrxId()
    const description = `Cicilan ke-${paymentNumber} - ${application.application_number || creditApplicationId}`

    const astraPayTransaction = await db.astraPayTransaction.create({
      data: {
        user_id: auth.userId,
        dealer_id: application.dealer_id,
        listing_id: application.listing_id,
        credit_application_id: creditApplicationId,
        merchant_trx_id: merchantTrxId,
        amount: payment.amount_due,
        currency: 'IDR',
        description,
        payment_type: paymentMethod === 'direct_debit' ? 'direct_debit' : 'push_to_payment',
        status: 'pending',
        expired_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    // Call AstraPay API
    let paymentResult: {
      merchantTrxId: string
      astrapayTrxId?: string
      urlRedirect?: string
      status: string
    }

    if (paymentMethod === 'direct_debit') {
      const signature = astraPayService.generateSignatureAuth(
        process.env.ASTRAPAY_CLIENT_ID || '',
        new Date().toISOString(),
      )
      paymentResult = await astraPayService.createPayment(
        signature,
        merchantTrxId,
        payment.amount_due,
        'IDR',
        description,
      )
    } else {
      paymentResult = await astraPayService.createPushPayment(
        merchantTrxId,
        payment.amount_due,
        'IDR',
        description,
      )
    }

    // Update AstraPay transaction with response
    await db.astraPayTransaction.update({
      where: { id: astraPayTransaction.id },
      data: {
        astrapay_trx_id: paymentResult.astrapayTrxId || null,
        url_redirect: paymentResult.urlRedirect || null,
        status: paymentResult.status || 'pending',
      },
    })

    // Update CreditPayment with AstraPay trx reference
    await db.creditPayment.update({
      where: { id: payment.id },
      data: {
        astrapay_trx_id: paymentResult.astrapayTrxId || merchantTrxId,
        payment_method: paymentMethod,
      },
    })

    // Check for overdue payments and update their status
    const now = new Date()
    for (const p of application.payments) {
      if (p.status === 'upcoming' && new Date(p.due_date) < now) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(p.due_date).getTime()) / (1000 * 60 * 60 * 24),
        )
        const lateFee = daysOverdue > 0 ? Math.round(p.amount_due * 0.001 * daysOverdue) : 0
        await db.creditPayment.update({
          where: { id: p.id },
          data: { status: 'overdue', late_fee: lateFee },
        })
      }
    }

    return successResponse({
      payment: {
        paymentNumber: payment.payment_number,
        amountDue: payment.amount_due,
        merchantTrxId,
        astrapayTrxId: paymentResult.astrapayTrxId,
        urlRedirect: paymentResult.urlRedirect,
        status: paymentResult.status || 'pending',
        paymentMethod,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process monthly payment'
    return errorResponse(message, 500, 'PAY_MONTHLY_ERROR')
  }
}
