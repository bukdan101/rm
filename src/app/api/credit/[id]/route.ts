import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

// GET – Get credit application details with payment schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params

    const application = await db.creditApplication.findUnique({
      where: { id },
      include: {
        payments: { orderBy: { payment_number: 'asc' } },
      },
    })

    if (!application) {
      return errorResponse('Credit application not found', 404, 'NOT_FOUND')
    }

    // Only allow the owner or admin to view
    if (application.user_id !== auth.userId && auth.profile.role !== 'admin') {
      return errorResponse('Access denied', 403, 'FORBIDDEN')
    }

    // Compute summary
    const paidPayments = application.payments.filter((p) => p.status === 'paid')
    const upcomingPayments = application.payments.filter((p) => p.status === 'upcoming')
    const overduePayments = application.payments.filter((p) => p.status === 'overdue')
    const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
    const nextPayment = upcomingPayments[0] || null

    return successResponse({
      application,
      summary: {
        totalPayments: application.payments.length,
        paidCount: paidPayments.length,
        upcomingCount: upcomingPayments.length,
        overdueCount: overduePayments.length,
        totalPaid,
        remainingBalance: application.total_payment - totalPaid,
        nextPaymentDue: nextPayment
          ? { paymentNumber: nextPayment.payment_number, amount: nextPayment.amount_due, dueDate: nextPayment.due_date }
          : null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get credit application'
    return errorResponse(message, 500, 'CREDIT_DETAIL_ERROR')
  }
}

// PUT – Update credit application (admin or user status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejectionReason, astrapayPaylaterStatus, notes } = body as {
      status?: string
      rejectionReason?: string
      astrapayPaylaterStatus?: string
      notes?: string
    }

    const application = await db.creditApplication.findUnique({ where: { id } })
    if (!application) {
      return errorResponse('Credit application not found', 404, 'NOT_FOUND')
    }

    // Authorization: only admin can approve/reject/disburse
    const isAdmin = auth.profile.role === 'admin'
    const isOwner = application.user_id === auth.userId

    if (status && ['approved', 'rejected', 'disbursed', 'defaulted'].includes(status) && !isAdmin) {
      return errorResponse('Only admin can change application status to ' + status, 403, 'FORBIDDEN')
    }

    // Build update data
    const updateData: Record<string, unknown> = { updated_at: new Date() }

    if (status) {
      updateData.status = status

      if (status === 'approved') {
        updateData.approved_at = new Date()
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason || null
      } else if (status === 'disbursed') {
        updateData.disbursed_at = new Date()
      } else if (status === 'completed') {
        updateData.completed_at = new Date()
      }
    }

    if (astrapayPaylaterStatus !== undefined) {
      updateData.astrapay_paylater_status = astrapayPaylaterStatus
    }

    if (rejectionReason !== undefined) {
      updateData.rejection_reason = rejectionReason
    }

    if (notes !== undefined && (isOwner || isAdmin)) {
      updateData.notes = notes
    }

    const updatedApplication = await db.creditApplication.update({
      where: { id },
      data: updateData,
      include: { payments: { orderBy: { payment_number: 'asc' } } },
    })

    return successResponse({
      application: updatedApplication,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update credit application'
    return errorResponse(message, 500, 'CREDIT_UPDATE_ERROR')
  }
}
