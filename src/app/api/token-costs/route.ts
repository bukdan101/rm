import { NextResponse } from 'next/server'
import { getAllTokenCosts } from '@/lib/token-service'

// GET - Get all token costs for display
export async function GET() {
  try {
    const costs = await getAllTokenCosts()
    
    return NextResponse.json({
      success: true,
      data: costs
    })
  } catch (error) {
    console.error('Error fetching token costs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token costs' },
      { status: 500 }
    )
  }
}
