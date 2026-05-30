import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch all boost features with usage statistics
export async function GET(request: NextRequest) {
  try {
    // Fetch boost features
    const boostFeatures = await db.boostFeature.findMany({
      orderBy: { display_order: 'asc' },
    })

    // If no data, return defaults
    if (!boostFeatures || boostFeatures.length === 0) {
      return NextResponse.json({
        features: getDefaultBoostFeatures(),
        usingMockData: true,
      })
    }

    // Fetch usage statistics for each boost feature
    const featuresWithStats = await Promise.all(
      boostFeatures.map(async (feature) => {
        // Count active listings using this boost
        const activeListingsCount = await db.listingBoost.count({
          where: {
            boost_feature_id: feature.id,
            is_active: true,
            expires_at: { gt: new Date() },
          },
        })

        // Count total usage
        const totalUsageCount = await db.listingBoost.count({
          where: { boost_feature_id: feature.id },
        })

        // Get total credits spent
        const creditsData = await db.listingBoost.findMany({
          where: { boost_feature_id: feature.id },
          select: { credits_spent: true },
        })

        const totalCreditsSpent = creditsData.reduce((sum, item) => sum + (item.credits_spent || 0), 0)

        return {
          ...feature,
          active_listings_count: activeListingsCount,
          total_usage_count: totalUsageCount,
          total_credits_spent: totalCreditsSpent,
        }
      })
    )

    return NextResponse.json({
      features: featuresWithStats,
      usingMockData: false,
    })
  } catch (error) {
    console.error('Error fetching boost features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new boost feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, slug, description, credit_cost, duration_days, icon, color, benefits } = body

    if (!name || !slug || credit_cost === undefined || !duration_days) {
      return NextResponse.json(
        { error: 'Name, slug, credit_cost, and duration_days are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-')

    const feature = await db.boostFeature.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        credits: credit_cost, // Fixed: credit_cost → credits (BoostFeature schema)
        duration_days,
        icon: icon || 'Sparkles',
        color: color || 'blue',
        // Fixed: benefits is String? in BoostFeature schema - must JSON.stringify if array
        benefits: benefits ? (typeof benefits === 'string' ? benefits : JSON.stringify(benefits)) : null,
        is_active: true,
        display_order: 0,
        // Fixed: removed updated_at - doesn't exist in BoostFeature schema
      },
    })

    return NextResponse.json({
      success: true,
      feature,
    })
  } catch (error) {
    console.error('Error creating boost feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update boost feature pricing/status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Boost feature ID is required' }, { status: 400 })
    }

    // Filter allowed update fields - map credit_cost → credits
    const allowedFields = ['name', 'slug', 'description', 'credit_cost', 'credits', 'duration_days', 'icon', 'color', 'benefits', 'is_active', 'display_order']
    const filteredUpdates: Record<string, unknown> = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        // Map credit_cost → credits for BoostFeature schema
        if (key === 'credit_cost') {
          filteredUpdates.credits = updates[key]
        } else if (key === 'benefits') {
          // Benefits is String? - must JSON.stringify if array
          filteredUpdates.benefits = typeof updates[key] === 'string' ? updates[key] : JSON.stringify(updates[key])
        } else {
          filteredUpdates[key] = updates[key]
        }
      }
    }

    // Fixed: removed updated_at - doesn't exist in BoostFeature schema

    const feature = await db.boostFeature.update({
      where: { id },
      data: filteredUpdates,
    })

    return NextResponse.json({
      success: true,
      feature,
    })
  } catch (error) {
    console.error('Error updating boost feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete boost feature
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Boost feature ID is required' }, { status: 400 })
    }

    // Check if boost feature is being used
    const count = await db.listingBoost.count({
      where: { boost_feature_id: id },
    })

    if (count > 0) {
      // Soft delete - just deactivate
      await db.boostFeature.update({
        where: { id },
        data: { is_active: false },
      })

      return NextResponse.json({
        success: true,
        message: 'Boost feature deactivated (has active usage)',
        deactivated: true,
      })
    }

    // Hard delete if not used
    await db.boostFeature.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Boost feature deleted successfully',
      deactivated: false,
    })
  } catch (error) {
    console.error('Error deleting boost feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Default boost features (mock data)
function getDefaultBoostFeatures() {
  return [
    {
      id: 'bf-default-001',
      name: 'Highlight',
      slug: 'highlight',
      description: 'Tampilkan iklan Anda dengan background highlight yang menonjol',
      credits: 3, // Fixed: credit_cost → credits
      duration_days: 7,
      icon: 'Sparkles',
      color: 'amber',
      benefits: '["Background kuning highlight","Lebih mudah dilihat","Cocok untuk iklan prioritas"]', // String format
      is_active: true,
      display_order: 1,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0,
    },
    {
      id: 'bf-default-002',
      name: 'Top Search',
      slug: 'top-search',
      description: 'Prioritaskan iklan Anda di hasil pencarian teratas',
      credits: 5, // Fixed: credit_cost → credits
      duration_days: 7,
      icon: 'ArrowUp',
      color: 'blue',
      benefits: '["Muncul di posisi teratas","Maksimal 10 iklan per halaman","Visibilitas meningkat 3x"]',
      is_active: true,
      display_order: 2,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0,
    },
    {
      id: 'bf-default-003',
      name: 'Featured',
      slug: 'featured',
      description: 'Tampilkan iklan di halaman utama sebagai iklan pilihan',
      credits: 10, // Fixed: credit_cost → credits
      duration_days: 14,
      icon: 'Star',
      color: 'purple',
      benefits: '["Muncul di halaman utama","Badge Featured eksklusif","Durasi lebih lama 14 hari","Eksposur maksimal"]',
      is_active: true,
      display_order: 3,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0,
    },
  ]
}
