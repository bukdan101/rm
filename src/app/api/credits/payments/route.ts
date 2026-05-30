import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// BNI VA Configuration
const BNI_VA_PREFIX = '8808' // Example prefix, should be configured
const BNI_COMPANY_CODE = 'AUTOMARKET' // Company code for VA generation

// Generate VA Number
function generateVANumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${BNI_VA_PREFIX}${timestamp}${random}`
}

// Generate Invoice Number
function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}${day}-${random}`
}

// GET: Get user's payments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId }
    })
    
    const where: any = {}
    if (dealer) {
      where.dealer_id = dealer.id
    } else {
      where.user_id = userId
    }
    
    if (status) {
      where.status = status
    }
    
    const payments = await db.payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    })
    
    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { package_id, userId } = body
    
    if (!package_id || !userId) {
      return NextResponse.json({ error: 'Package ID and User ID are required' }, { status: 400 })
    }
    
    // Get package details
    const pkg = await db.creditPackage.findUnique({
      where: { id: package_id }
    })
    
    if (!pkg || !pkg.is_active) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    
    // Check if user is a dealer
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId }
    })
    
    // Validate package type matches user type
    if (pkg.is_dealer && !dealer) {
      return NextResponse.json({ error: 'This package is only for dealers' }, { status: 400 })
    }
    
    if (!pkg.is_dealer && dealer) {
      return NextResponse.json({ error: 'Please select a dealer package' }, { status: 400 })
    }
    
    // Generate VA and invoice number
    const va_number = generateVANumber()
    const invoice_number = generateInvoiceNumber()
    
    // Create payment record (no expires_at in schema)
    const payment = {
      invoice_number,
      user_id: dealer ? null : userId,
      dealer_id: dealer?.id || null,
      package_id,
      amount: pkg.price,
      credits_awarded: pkg.tokens + pkg.bonus_tokens,
      payment_method: 'bni_va',
      va_number,
      status: 'pending',
    }
    
    const newPayment = await db.payment.create({
      data: payment
    })
    
    return NextResponse.json({
      payment: newPayment,
      bank_info: {
        bank_name: 'BNI',
        va_number,
        account_name: 'AUTOMARKET INDONESIA',
        amount: pkg.price,
      }
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update payment (upload proof or cancel)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_id, action, proof_url, userId } = body
    
    if (!payment_id || !action || !userId) {
      return NextResponse.json({ error: 'Payment ID, action, and User ID are required' }, { status: 400 })
    }
    
    // Get payment
    const payment = await db.payment.findUnique({
      where: { id: payment_id }
    })
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // Verify ownership
    const dealer = await db.dealer.findFirst({
      where: { owner_id: userId }
    })
    
    const isOwner = (dealer && payment.dealer_id === dealer.id) || 
                    (!dealer && payment.user_id === userId)
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    if (action === 'upload_proof') {
      if (!proof_url) {
        return NextResponse.json({ error: 'Proof URL is required' }, { status: 400 })
      }
      
      await db.payment.update({
        where: { id: payment_id },
        data: {
          proof_url,
          status: 'paid',
          paid_at: new Date()
        }
      })
      
      return NextResponse.json({ message: 'Proof uploaded successfully' })
    }
    
    if (action === 'cancel') {
      await db.payment.update({
        where: { id: payment_id },
        data: { status: 'cancelled' }
      })
      
      return NextResponse.json({ message: 'Payment cancelled' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
