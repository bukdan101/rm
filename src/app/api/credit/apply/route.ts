import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

interface ApplyRequestBody {
  userId?: string
  listingId?: string
  dealerId?: string
  vehiclePrice: number
  downPayment: number
  tenorMonths: number
  interestRate?: number
  ktpNumber?: string
  monthlyIncome?: number
  employmentType?: string
  workExperienceYears?: number
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
}

function generateApplicationNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KRT-${year}${month}-${random}`
}

// POST – Apply for credit/financing
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body: ApplyRequestBody = await request.json()
    const {
      listingId,
      dealerId,
      vehiclePrice,
      downPayment,
      tenorMonths,
      interestRate = 5.5,
      ktpNumber,
      monthlyIncome,
      employmentType,
      workExperienceYears,
      emergencyContactName,
      emergencyContactPhone,
      notes,
    } = body

    const userId = body.userId || auth.userId

    // Validation
    if (!vehiclePrice || vehiclePrice <= 0) {
      return errorResponse('Vehicle price is required', 400, 'INVALID_VEHICLE_PRICE')
    }
    if (downPayment === undefined || downPayment < 0) {
      return errorResponse('Down payment is required', 400, 'INVALID_DOWN_PAYMENT')
    }
    if (downPayment >= vehiclePrice) {
      return errorResponse('Down payment must be less than vehicle price', 400, 'DOWN_PAYMENT_TOO_HIGH')
    }
    if (!tenorMonths || tenorMonths < 1 || tenorMonths > 84) {
      return errorResponse('Tenor must be between 1 and 84 months', 400, 'INVALID_TENOR')
    }

    // Flat interest calculation
    const loanAmount = vehiclePrice - downPayment
    const annualRate = interestRate / 100
    const totalInterest = Math.round(loanAmount * annualRate * tenorMonths / 12)
    const totalPayment = loanAmount + totalInterest
    const monthlyInstallment = Math.round(totalPayment / tenorMonths)

    const applicationNumber = generateApplicationNumber()

    // Create CreditApplication
    const application = await db.creditApplication.create({
      data: {
        user_id: userId,
        listing_id: listingId || null,
        dealer_id: dealerId || null,
        application_number: applicationNumber,
        vehicle_price: vehiclePrice,
        down_payment: downPayment,
        loan_amount: loanAmount,
        tenor_months: tenorMonths,
        monthly_installment: monthlyInstallment,
        interest_rate: interestRate,
        total_payment: totalPayment,
        status: 'submitted',
        financing_partner: 'astrapay',
        ktp_number: ktpNumber || null,
        monthly_income: monthlyIncome || null,
        employment_type: employmentType || null,
        work_experience_years: workExperienceYears || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        notes: notes || null,
      },
    })

    // Create monthly payment schedule
    const now = new Date()
    const paymentRecords = []
    let remainingPrincipal = loanAmount
    const monthlyPrincipal = Math.round(loanAmount / tenorMonths)
    const monthlyInterest = Math.round(totalInterest / tenorMonths)

    for (let month = 1; month <= tenorMonths; month++) {
      const principalAmount = month === tenorMonths ? remainingPrincipal : monthlyPrincipal
      const interestAmount = monthlyInterest
      const amountDue = month === tenorMonths
        ? principalAmount + interestAmount
        : monthlyInstallment

      remainingPrincipal -= principalAmount

      const dueDate = new Date(now)
      dueDate.setMonth(dueDate.getMonth() + month)
      dueDate.setDate(dueDate.getDate() + 1) // grace period of 1 day

      paymentRecords.push({
        credit_application_id: application.id,
        payment_number: month,
        amount_due: amountDue,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        due_date: dueDate,
        status: 'upcoming' as const,
      })
    }

    await db.creditPayment.createMany({ data: paymentRecords })

    // Fetch the full application with payments
    const fullApplication = await db.creditApplication.findUnique({
      where: { id: application.id },
      include: { payments: { orderBy: { payment_number: 'asc' } } },
    })

    return successResponse({
      application: fullApplication,
    }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit credit application'
    return errorResponse(message, 500, 'CREDIT_APPLY_ERROR')
  }
}

// GET – Get user's credit applications
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || auth.userId
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { user_id: userId }
    if (status) {
      where.status = status
    }

    const applications = await db.creditApplication.findMany({
      where,
      include: {
        payments: {
          orderBy: { payment_number: 'asc' },
          where: { status: { in: ['upcoming', 'overdue', 'partial'] } },
          take: 3,
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Summary stats
    const totalApplications = applications.length
    const activeApplications = applications.filter(
      (a) => !['completed', 'defaulted', 'rejected'].includes(a.status),
    ).length
    const totalOutstanding = applications
      .filter((a) => !['completed', 'defaulted', 'rejected'].includes(a.status))
      .reduce((sum, a) => sum + a.loan_amount, 0)

    return successResponse({
      applications,
      summary: {
        totalApplications,
        activeApplications,
        totalOutstanding,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get credit applications'
    return errorResponse(message, 500, 'CREDIT_GET_ERROR')
  }
}
