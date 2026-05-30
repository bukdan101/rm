import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const data = await db.province.findMany({
      where: { is_active: true },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    )
  }
}
