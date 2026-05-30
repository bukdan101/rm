import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default packages if not in database
function getDefaultPackages() {
  return [
    {
      id: 'pkg-starter',
      name: 'Starter',
      tokens: 50,
      price: 50000,
      bonus_tokens: 0,
      is_active: true,
      display_order: 0,
      description: 'Cocok untuk pemula',
    },
    {
      id: 'pkg-popular',
      name: 'Popular',
      tokens: 150,
      price: 125000,
      bonus_tokens: 15,
      is_active: true,
      display_order: 1,
      description: 'Paling diminati',
    },
    {
      id: 'pkg-business',
      name: 'Business',
      tokens: 350,
      price: 275000,
      bonus_tokens: 50,
      is_active: true,
      display_order: 2,
      description: 'Untuk usaha berkembang',
    },
    {
      id: 'pkg-enterprise',
      name: 'Enterprise',
      tokens: 750,
      price: 550000,
      bonus_tokens: 150,
      is_active: true,
      display_order: 3,
      description: 'Untuk dealer profesional',
    },
  ]
}

// GET - Fetch all active credit packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const where: Record<string, unknown> = {}
    if (activeOnly) {
      where.is_active = true
    }

    const packages = await db.creditPackage.findMany({
      where,
      orderBy: { display_order: 'asc' },
    })

    // If no packages in database, return defaults
    if (!packages || packages.length === 0) {
      return NextResponse.json({
        success: true,
        packages: getDefaultPackages(),
      })
    }

    return NextResponse.json({
      success: true,
      packages,
    })
  } catch (error) {
    console.error('Credit packages API error:', error)
    return NextResponse.json({
      success: true,
      packages: getDefaultPackages(),
    })
  }
}

// POST - Create new credit package (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tokens, price, bonus_tokens, description, display_order } = body

    if (!name || !tokens || !price) {
      return NextResponse.json(
        { success: false, error: 'Name, tokens, and price are required' },
        { status: 400 }
      )
    }

    const pkg = await db.creditPackage.create({
      data: {
        name,
        tokens,
        price,
        bonus_tokens: bonus_tokens || 0,
        description,
        display_order: display_order || 0,
        is_active: true,
      },
    })

    return NextResponse.json({
      success: true,
      package: pkg,
    })
  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
