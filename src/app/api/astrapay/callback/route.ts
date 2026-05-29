import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

interface CallbackBody {
  merchantTransactionId?: string
  astrapayTransactionId?: string
  amount?: number
  status?: string
  callbackTimestamp?: string
  callbackSecurity?: string
  [key: string]: unknown
}

// POST – Payment callback from AstraPay (webhook)
export async function POST(request: NextRequest) {
  try {
    const body: CallbackBody = await request.json()
    const {
      merchantTransactionId,
      astrapayTransactionId,
      amount,
      status,
      callbackTimestamp,
      callbackSecurity,
    } = body

    if (!merchantTransactionId) {
      return errorResponse('merchantTransactionId is required', 400, 'MISSING_MERCHANT_TRX_ID')
    }

    // Find the transaction
    const transaction = await db.astraPayTransaction.findUnique({
      where: { merchant_trx_id: merchantTransactionId },
    })

    if (!transaction) {
      return errorResponse('Transaction not found', 404, 'TRANSACTION_NOT_FOUND')
    }

    // Update the transaction with callback data
    const updatedTransaction = await db.astraPayTransaction.update({
      where: { id: transaction.id },
      data: {
        astrapay_trx_id: astrapayTransactionId || transaction.astrapay_trx_id,
        callback_received: true,
        callback_status: status || null,
        callback_timestamp: callbackTimestamp ? new Date(callbackTimestamp) : new Date(),
        callback_security: callbackSecurity || null,
        status: status || transaction.status,
        paid_at: status === 'approved' ? new Date() : transaction.paid_at,
      },
    })

    // If this is a credit payment, update the CreditPayment record
    if (transaction.credit_application_id && status === 'approved') {
      const creditApplication = await db.creditApplication.findUnique({
        where: { id: transaction.credit_application_id },
        include: { payments: true },
      })

      if (creditApplication) {
        // Find the next unpaid payment
        const upcomingPayment = creditApplication.payments
          .filter((p) => p.status === 'upcoming' || p.status === 'overdue')
          .sort((a, b) => a.payment_number - b.payment_number)[0]

        if (upcomingPayment) {
          await db.creditPayment.update({
            where: { id: upcomingPayment.id },
            data: {
              status: 'paid',
              paid_at: new Date(),
              amount_paid: upcomingPayment.amount_due,
              astrapay_trx_id: astrapayTransactionId || null,
              payment_method: 'astrapay_balance',
            },
          })
        }

        // Check if all payments are paid → mark application as completed
        const allPayments = await db.creditPayment.findMany({
          where: { credit_application_id: creditApplication.id },
        })
        const allPaid = allPayments.every((p) => p.status === 'paid')
        if (allPaid) {
          await db.creditApplication.update({
            where: { id: creditApplication.id },
            data: {
              status: 'completed',
              completed_at: new Date(),
            },
          })
        }
      }
    }

    // If listing purchase payment is approved, update application status
    if (transaction.credit_application_id && status === 'approved') {
      await db.creditApplication.updateMany({
        where: { id: transaction.credit_application_id, status: 'submitted' },
        data: { status: 'approved', approved_at: new Date() },
      })
    }

    return successResponse({ status: 'OK' })
  } catch (error) {
    console.error('[AstraPay Callback Error]', error)
    // Still return OK so AstraPay doesn't retry
    return successResponse({ status: 'OK' })
  }
}
