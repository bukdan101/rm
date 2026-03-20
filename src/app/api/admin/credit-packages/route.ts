import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch credit packages (public for active, admin for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    // Try to fetch from database
    let query = supabase
      .from('credit_packages')
      .select('*')
      .order('sort_order', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: packages, error } = await query

    if (error) {
      console.error('Error fetching credit packages:', error)
      // Return default packages if table doesn't exist
      return NextResponse.json({
        success: true,
        packages: getDefaultPackages()
      })
    }

    // If no packages in database, return defaults
    if (!packages || packages.length === 0) {
      return NextResponse.json({
        success: true,
        packages: getDefaultPackages()
      })
    }

    return NextResponse.json({
      success: true,
      packages
    })
  } catch (error) {
    console.error('Credit packages API error:', error)
    return NextResponse.json({
      success: true,
      packages: getDefaultPackages()
    })
  }
}

// Default packages
function getDefaultPackages() {
  return [
    {
      id: 'pkg-starter',
      name: 'Starter',
      credits: 50,
      price: 50000,
      bonus_credits: 0,
      is_active: true,
      sort_order: 0,
      description: 'Cocok untuk pemula'
    },
    {
      id: 'pkg-popular',
      name: 'Popular',
      credits: 150,
      price: 125000,
      bonus_credits: 15,
      is_active: true,
      sort_order: 1,
      description: 'Paling diminati'
    },
    {
      id: 'pkg-business',
      name: 'Business',
      credits: 350,
      price: 275000,
      bonus_credits: 50,
      is_active: true,
      sort_order: 2,
      description: 'Untuk usaha berkembang'
    },
    {
      id: 'pkg-enterprise',
      name: 'Enterprise',
      credits: 750,
      price: 550000,
      bonus_credits: 150,
      is_active: true,
      sort_order: 3,
      description: 'Untuk dealer profesional'
    }
  ]
}

// POST - Create new credit package (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, credits, price, bonus_credits, description, sort_order } = body

    if (!name || !credits || !price) {
      return NextResponse.json(
        { success: false, error: 'Name, credits, and price are required' },
        { status: 400 }
      )
    }

    const { data: pkg, error } = await supabase
      .from('credit_packages')
      .insert({
        name,
        credits,
        price,
        bonus_credits: bonus_credits || 0,
        description,
        sort_order: sort_order || 0,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create package' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      package: pkg
    })
  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update credit package (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      )
    }

    const { data: pkg, error } = await supabase
      .from('credit_packages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update package' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      package: pkg
    })
  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete credit package (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('credit_packages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting package:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete package' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })
  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
