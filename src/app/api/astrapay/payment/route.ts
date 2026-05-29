import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { astraPayService, generateMerchantTrxId } from '@/lib/astrapay'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

interface PaymentRequestBody {
  userId?: string
  listingId?: string
  creditApplicationId?: string
  dealerId?: string
  amount: number
  paymentType: 'payment_with_linking' | 'push_to_payment' | 'direct_debit'
  description?: string
}

// POST – Create payment via AstraPay
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body: PaymentRequestBody = await request.json()
    const {
      userId,
      listingId,
      creditApplicationId,
      dealerId,
      amount,
      paymentType = 'payment_with_linking',
      description,
    } = body

    // Validation
    if (!amount || amount < 10_000 || amount > 10_000_000) {
      return errorResponse('Amount must be between Rp 10,000 and Rp 10,000,000', 400, 'INVALID_AMOUNT')
    }

    if (!['payment_with_linking', 'push_to_payment', 'direct_debit'].includes(paymentType)) {
      return errorResponse('Invalid payment type', 400, 'INVALID_PAYMENT_TYPE')
    }

    const merchantTrxId = generateMerchantTrxId()

    // Create AstraPayTransaction record
    const transaction = await db.astraPayTransaction.create({
      data: {
        user_id: userId || auth.userId,
        dealer_id: dealerId || null,
        listing_id: listingId || null,
        credit_application_id: creditApplicationId || null,
        merchant_trx_id: merchantTrxId,
        amount,
        currency: 'IDR',
        description: description || `AutoMarket Payment - ${merchantTrxId}`,
        payment_type: paymentType,
        status: 'pending',
        expired_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    })

    // Call AstraPay API based on payment type
    let paymentResult: {
      merchantTrxId: string
      astrapayTrxId?: string
      token?: string
      urlRedirect?: string
      status: string
    }

    const timestamp = new Date().toISOString()
    const signature = astraPayService.generateSignatureAuth(
      process.env.ASTRAPAY_CLIENT_ID || '',
      timestamp,
    )

    if (paymentType === 'push_to_payment') {
      paymentResult = await astraPayService.createPushPayment(
        merchantTrxId,
        amount,
        'IDR',
        description || `AutoMarket Payment - ${merchantTrxId}`,
      )
    } else {
      // payment_with_linking or direct_debit
      paymentResult = await astraPayService.createPayment(
        signature,
        merchantTrxId,
        amount,
        'IDR',
        description || `AutoMarket Payment - ${merchantTrxId}`,
      )
    }

    // Update transaction with AstraPay response
    await db.astraPayTransaction.update({
      where: { id: transaction.id },
      data: {
        astrapay_trx_id: paymentResult.astrapayTrxId || null,
        token: paymentResult.token || null,
        url_redirect: paymentResult.urlRedirect || null,
        status: paymentResult.status || 'pending',
      },
    })

    return successResponse({
      transaction: {
        id: transaction.id,
        merchantTrxId,
        astrapayTrxId: paymentResult.astrapayTrxId,
        amount,
        currency: 'IDR',
        paymentType,
        status: paymentResult.status || 'pending',
        urlRedirect: paymentResult.urlRedirect,
        token: paymentResult.token,
        expiredAt: transaction.expired_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment'
    return errorResponse(message, 500, 'PAYMENT_ERROR')
  }
}
