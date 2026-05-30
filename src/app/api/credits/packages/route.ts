import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch credit packages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forDealer = searchParams.get('dealer') === 'true'

    const where: Record<string, unknown> = {
      is_active: true,
      is_dealer: forDealer,
    }

    const data = await db.creditPackage.findMany({
      where,
      orderBy: { display_order: 'asc' },
    })

    return NextResponse.json({ packages: data })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
