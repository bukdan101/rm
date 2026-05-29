import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { astraPayService } from '@/lib/astrapay'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

// GET – Check transaction status from AstraPay
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const merchantTrxId = searchParams.get('merchantTrxId')

    if (!merchantTrxId) {
      return errorResponse('merchantTrxId is required', 400, 'MISSING_PARAM')
    }

    // Get from local DB first
    const localTransaction = await db.astraPayTransaction.findUnique({
      where: { merchant_trx_id: merchantTrxId },
    })

    if (!localTransaction) {
      return errorResponse('Transaction not found', 404, 'NOT_FOUND')
    }

    // Query AstraPay for latest status
    let astraPayStatus = null
    try {
      astraPayStatus = await astraPayService.getTransactionStatus(merchantTrxId)

      // Update local record if status changed
      if (astraPayStatus.status !== localTransaction.status) {
        await db.astraPayTransaction.update({
          where: { id: localTransaction.id },
          data: {
            status: astraPayStatus.status,
            astrapay_trx_id: astraPayStatus.astrapayTrxId || localTransaction.astrapay_trx_id,
            paid_at: astraPayStatus.status === 'approved' ? new Date() : localTransaction.paid_at,
          },
        })
      }
    } catch (err) {
      console.warn('[AstraPay] Could not fetch remote status:', err)
      // Return local data if remote check fails
    }

    return successResponse({
      transaction: {
        id: localTransaction.id,
        merchantTrxId: localTransaction.merchant_trx_id,
        astrapayTrxId: localTransaction.astrapay_trx_id,
        amount: localTransaction.amount,
        currency: localTransaction.currency,
        paymentType: localTransaction.payment_type,
        status: astraPayStatus?.status || localTransaction.status,
        callbackReceived: localTransaction.callback_received,
        callbackStatus: localTransaction.callback_status,
        paidAt: localTransaction.paid_at,
        createdAt: localTransaction.created_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get transaction status'
    return errorResponse(message, 500, 'TRANSACTION_STATUS_ERROR')
  }
}
