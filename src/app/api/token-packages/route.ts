import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get credit packages (replaces TokenPackage with CreditPackage)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target') // 'all', 'user', 'dealer'
    
    const where: any = { is_active: true }
    
    if (target === 'dealer') {
      where.is_dealer = true
    } else if (target === 'user') {
      where.is_dealer = false
    }
    
    const packages = await db.creditPackage.findMany({
      where,
      orderBy: { display_order: 'asc' }
    })
    
    // Calculate pricing info
    const packagesWithPricing = packages.map(pkg => ({
      ...pkg,
      calculated_price_per_token: Math.round(pkg.price / pkg.tokens),
      total_tokens: pkg.tokens + pkg.bonus_tokens,
    }))
    
    return NextResponse.json({
      success: true,
      data: packagesWithPricing
    })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit packages' },
      { status: 500 }
    )
  }
}

// POST - Create credit package (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      tokens,
      price,
      bonus_tokens,
      is_popular,
      is_dealer,
      display_order
    } = body
    
    if (!name || !tokens || !price) {
      return NextResponse.json(
        { success: false, error: 'Name, tokens, and price are required' },
        { status: 400 }
      )
    }
    
    const data = await db.creditPackage.create({
      data: {
        name,
        description,
        tokens,
        price,
        bonus_tokens: bonus_tokens || 0,
        is_popular: is_popular || false,
        is_dealer: is_dealer || false,
        display_order: display_order || 0,
      }
    })
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Credit package created successfully'
    })
  } catch (error) {
    console.error('Error creating credit package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create credit package' },
      { status: 500 }
    )
  }
}

// PUT - Update credit package (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    const data = await db.creditPackage.update({
      where: { id },
      data: updates
    })
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Credit package updated successfully'
    })
  } catch (error) {
    console.error('Error updating credit package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update credit package' },
      { status: 500 }
    )
  }
}

// DELETE - Delete credit package (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    // Soft delete by setting is_active to false
    await db.creditPackage.update({
      where: { id },
      data: { is_active: false }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Credit package deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting credit package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete credit package' },
      { status: 500 }
    )
  }
}
