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
//
// This is a dual-purpose handler that processes AstraPay payment callbacks
// for two distinct flows:
//
// 1. INITIAL CREDIT APPROVAL:
//    - AstraPayTransaction created via /api/astrapay/payment with credit_application_id set
//    - On "approved" callback → CreditApplication status changes from "submitted" → "approved"
//    - The first CreditPayment is also marked as "paid"
//
// 2. MONTHLY INSTALLMENT PAYMENT:
//    - AstraPayTransaction created via /api/credit/pay-monthly with credit_application_id set
//    - On "approved" callback → The next unpaid CreditPayment is marked as "paid"
//    - If all payments are paid → CreditApplication status changes to "completed"
//    - The application is already "approved"/"disbursed", so the approval block is skipped
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
    await db.astraPayTransaction.update({
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

    // ───────────────────────────────────────────────────────
    // Credit-related callback handling
    // Only process if this transaction is linked to a credit
    // application AND the payment was approved by AstraPay
    // ───────────────────────────────────────────────────────
    if (transaction.credit_application_id && status === 'approved') {
      const creditApplication = await db.creditApplication.findUnique({
        where: { id: transaction.credit_application_id },
        include: { payments: true },
      })

      if (creditApplication) {
        // ── Flow 1: Monthly installment payment ──
        // Find the next unpaid payment and mark it as paid.
        // This applies to both the initial first installment and
        // subsequent monthly payments.
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

        // ── Flow 2: Initial credit approval ──
        // If the application is still in "submitted" status, this callback
        // represents the initial payment approval. Promote the application
        // to "approved" so the user can proceed with the financing.
        // This block only fires for initial approval because the
        // condition checks for status === 'submitted' — monthly payments
        // are already in "approved"/"disbursed" status.
        if (creditApplication.status === 'submitted') {
          await db.creditApplication.update({
            where: { id: creditApplication.id },
            data: { status: 'approved', approved_at: new Date() },
          })
        }
      }
    }

    return successResponse({ status: 'OK' })
  } catch (error) {
    console.error('[AstraPay Callback Error]', error)
    // Still return OK so AstraPay doesn't retry
    return successResponse({ status: 'OK' })
  }
}
