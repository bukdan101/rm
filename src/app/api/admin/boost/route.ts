import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to check admin role
async function checkAdminRole() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Admin access required', status: 403 }
  }
  
  return { authorized: true, supabase, userId: user.id }
}

// GET: Fetch all boost features with usage statistics
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const supabase = authCheck.supabase!
    
    // Fetch boost features
    const { data: boostFeatures, error: featuresError } = await supabase
      .from('boost_features')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (featuresError) {
      // If table doesn't exist, return default mock data
      if (featuresError.code === 'PGRST204' || featuresError.message?.includes('does not exist')) {
        return NextResponse.json({
          features: getDefaultBoostFeatures(),
          usingMockData: true
        })
      }
      return NextResponse.json({ error: featuresError.message }, { status: 500 })
    }
    
    // If no data, return defaults
    if (!boostFeatures || boostFeatures.length === 0) {
      return NextResponse.json({
        features: getDefaultBoostFeatures(),
        usingMockData: true
      })
    }
    
    // Fetch usage statistics for each boost feature
    const featuresWithStats = await Promise.all(
      boostFeatures.map(async (feature) => {
        // Count active listings using this boost
        const { count: activeListingsCount } = await supabase
          .from('listing_boosts')
          .select('id', { count: 'exact', head: true })
          .eq('boost_feature_id', feature.id)
          .eq('is_active', true)
          .gt('ends_at', new Date().toISOString())
        
        // Count total usage
        const { count: totalUsageCount } = await supabase
          .from('listing_boosts')
          .select('id', { count: 'exact', head: true })
          .eq('boost_feature_id', feature.id)
        
        // Get total credits spent
        const { data: creditsData } = await supabase
          .from('listing_boosts')
          .select('credits_spent')
          .eq('boost_feature_id', feature.id)
        
        const totalCreditsSpent = creditsData?.reduce((sum, item) => sum + (item.credits_spent || 0), 0) || 0
        
        return {
          ...feature,
          active_listings_count: activeListingsCount || 0,
          total_usage_count: totalUsageCount || 0,
          total_credits_spent: totalCreditsSpent
        }
      })
    )
    
    return NextResponse.json({
      features: featuresWithStats,
      usingMockData: false
    })
  } catch (error) {
    console.error('Error fetching boost features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new boost feature
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const supabase = authCheck.supabase!
    const body = await request.json()
    
    const { name, slug, description, credit_cost, duration_days, icon, color, benefits } = body
    
    if (!name || !slug || credit_cost === undefined || !duration_days) {
      return NextResponse.json({ 
        error: 'Name, slug, credit_cost, and duration_days are required' 
      }, { status: 400 })
    }
    
    // Generate UUID for slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    const { data: feature, error } = await supabase
      .from('boost_features')
      .insert({
        name,
        slug: finalSlug,
        description,
        credit_cost,
        duration_days,
        icon: icon || 'Sparkles',
        color: color || 'blue',
        benefits: benefits || [],
        is_active: true,
        display_order: 0
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      feature
    })
  } catch (error) {
    console.error('Error creating boost feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update boost feature pricing/status
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const supabase = authCheck.supabase!
    const body = await request.json()
    
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Boost feature ID is required' }, { status: 400 })
    }
    
    // Filter allowed update fields
    const allowedFields = ['name', 'slug', 'description', 'credit_cost', 'duration_days', 'icon', 'color', 'benefits', 'is_active', 'display_order']
    const filteredUpdates: Record<string, unknown> = {}
    
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    }
    
    filteredUpdates.updated_at = new Date().toISOString()
    
    const { data: feature, error } = await supabase
      .from('boost_features')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!feature) {
      return NextResponse.json({ error: 'Boost feature not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      feature
    })
  } catch (error) {
    console.error('Error updating boost feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete boost feature
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await checkAdminRole()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const supabase = authCheck.supabase!
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Boost feature ID is required' }, { status: 400 })
    }
    
    // Check if boost feature is being used
    const { count } = await supabase
      .from('listing_boosts')
      .select('id', { count: 'exact', head: true })
      .eq('boost_feature_id', id)
    
    if (count && count > 0) {
      // Soft delete - just deactivate
      const { error } = await supabase
        .from('boost_features')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Boost feature deactivated (has active usage)',
        deactivated: true
      })
    }
    
    // Hard delete if not used
    const { error } = await supabase
      .from('boost_features')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Boost feature deleted successfully',
      deactivated: false
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
      credit_cost: 3,
      duration_days: 7,
      icon: 'Sparkles',
      color: 'amber',
      benefits: ['Background kuning highlight', 'Lebih mudah dilihat', 'Cocok untuk iklan prioritas'],
      is_active: true,
      display_order: 1,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0
    },
    {
      id: 'bf-default-002',
      name: 'Top Search',
      slug: 'top-search',
      description: 'Prioritaskan iklan Anda di hasil pencarian teratas',
      credit_cost: 5,
      duration_days: 7,
      icon: 'ArrowUp',
      color: 'blue',
      benefits: ['Muncul di posisi teratas', 'Maksimal 10 iklan per halaman', 'Visibilitas meningkat 3x'],
      is_active: true,
      display_order: 2,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0
    },
    {
      id: 'bf-default-003',
      name: 'Featured',
      slug: 'featured',
      description: 'Tampilkan iklan di halaman utama sebagai iklan pilihan',
      credit_cost: 10,
      duration_days: 14,
      icon: 'Star',
      color: 'purple',
      benefits: ['Muncul di halaman utama', 'Badge Featured eksklusif', 'Durasi lebih lama 14 hari', 'Eksposur maksimal'],
      is_active: true,
      display_order: 3,
      active_listings_count: 0,
      total_usage_count: 0,
      total_credits_spent: 0
    }
  ]
}
