import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'

interface CalculatorRequestBody {
  vehiclePrice: number
  downPayment: number
  tenorMonths: number
  interestRate: number // annual flat rate in percent, e.g. 5.5
}

interface PaymentScheduleItem {
  month: number
  principalAmount: number
  interestAmount: number
  totalInstallment: number
  remainingBalance: number
  dueDate: string
}

// POST – Calculate credit simulation
export async function POST(request: NextRequest) {
  try {
    const body: CalculatorRequestBody = await request.json()
    const { vehiclePrice, downPayment, tenorMonths, interestRate } = body

    // Validation
    if (!vehiclePrice || vehiclePrice <= 0) {
      return errorResponse('Vehicle price must be greater than 0', 400, 'INVALID_VEHICLE_PRICE')
    }
    if (downPayment === undefined || downPayment < 0) {
      return errorResponse('Down payment must be 0 or greater', 400, 'INVALID_DOWN_PAYMENT')
    }
    if (downPayment >= vehiclePrice) {
      return errorResponse('Down payment must be less than vehicle price', 400, 'DOWN_PAYMENT_TOO_HIGH')
    }
    if (!tenorMonths || tenorMonths < 1 || tenorMonths > 84) {
      return errorResponse('Tenor must be between 1 and 84 months', 400, 'INVALID_TENOR')
    }
    if (interestRate === undefined || interestRate < 0 || interestRate > 50) {
      return errorResponse('Interest rate must be between 0% and 50%', 400, 'INVALID_INTEREST_RATE')
    }

    // Flat interest calculation (common in Indonesia)
    const loanAmount = vehiclePrice - downPayment
    const annualRate = interestRate / 100
    const totalInterest = Math.round(loanAmount * annualRate * tenorMonths / 12)
    const totalPayment = loanAmount + totalInterest
    const monthlyInstallment = Math.round(totalPayment / tenorMonths)

    // Build payment schedule
    const schedule: PaymentScheduleItem[] = []
    let remainingBalance = loanAmount
    const monthlyPrincipal = Math.round(loanAmount / tenorMonths)
    const monthlyInterest = Math.round(totalInterest / tenorMonths)
    const now = new Date()

    for (let month = 1; month <= tenorMonths; month++) {
      const principalAmount = month === tenorMonths ? remainingBalance : monthlyPrincipal
      const interestAmount = monthlyInterest
      const totalInstallment = month === tenorMonths
        ? principalAmount + interestAmount
        : monthlyInstallment

      remainingBalance -= principalAmount
      if (remainingBalance < 0) remainingBalance = 0

      const dueDate = new Date(now)
      dueDate.setMonth(dueDate.getMonth() + month)

      schedule.push({
        month,
        principalAmount,
        interestAmount,
        totalInstallment,
        remainingBalance,
        dueDate: dueDate.toISOString(),
      })
    }

    return successResponse({
      calculation: {
        vehiclePrice,
        downPayment,
        downPaymentPercent: Math.round((downPayment / vehiclePrice) * 100 * 100) / 100,
        loanAmount,
        interestRate,
        totalInterest,
        totalPayment,
        monthlyInstallment,
        tenorMonths,
      },
      schedule,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Calculation failed'
    return errorResponse(message, 500, 'CALCULATOR_ERROR')
  }
}
