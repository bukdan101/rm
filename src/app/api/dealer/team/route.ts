import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to check if user is dealer admin/owner
async function isDealerAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, dealerId: string): Promise<boolean> {
  // Check if user is the owner
  const { data: dealer } = await supabase
    .from('dealers')
    .select('owner_id')
    .eq('id', dealerId)
    .single()

  if (dealer?.owner_id === userId) {
    return true
  }

  // Check if user is a manager in dealer_staff
  const { data: staff } = await supabase
    .from('dealer_staff')
    .select('role')
    .eq('dealer_id', dealerId)
    .eq('user_id', userId)
    .single()

  return staff?.role === 'manager' || staff?.role === 'owner'
}

// GET: Fetch team members for a dealer
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const dealerId = searchParams.get('dealer_id')

    if (!dealerId) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      )
    }

    // Fetch team members with user profile data
    const { data: teamMembers, error } = await supabase
      .from('dealer_staff')
      .select(`
        id,
        dealer_id,
        user_id,
        role,
        can_edit,
        can_delete,
        created_at,
        user:profiles!dealer_staff_user_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    // Also get the dealer owner
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select(`
        id,
        owner_id,
        owner:profiles!dealers_owner_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('id', dealerId)
      .single()

    if (dealerError) {
      console.error('Error fetching dealer:', dealerError)
    }

    // Transform the data to include permissions object
    const transformedMembers = teamMembers?.map(member => ({
      id: member.id,
      dealer_id: member.dealer_id,
      user_id: member.user_id,
      role: member.role,
      permissions: {
        can_edit: member.can_edit ?? false,
        can_delete: member.can_delete ?? false
      },
      joined_at: member.created_at,
      user: member.user
    })) || []

    // Add owner as first member if not already in the list
    const ownerInTeam = teamMembers?.some(m => m.user_id === dealer?.owner_id)
    const ownerMember = dealer?.owner_id && !ownerInTeam ? {
      id: 'owner-' + dealer.owner_id,
      dealer_id: dealer.id,
      user_id: dealer.owner_id,
      role: 'owner' as const,
      permissions: {
        can_edit: true,
        can_delete: true
      },
      joined_at: null,
      user: dealer.owner
    } : null

    const allMembers = ownerMember ? [ownerMember, ...transformedMembers] : transformedMembers

    return NextResponse.json({
      success: true,
      data: allMembers
    })
  } catch (error) {
    console.error('Error in team GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Add team member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dealer_id, user_id, role, permissions } = body

    // Validate required fields
    if (!dealer_id || !user_id || !role) {
      return NextResponse.json(
        { success: false, error: 'dealer_id, user_id, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['owner', 'manager', 'sales', 'inspector']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be one of: ' + validRoles.join(', ') },
        { status: 400 }
      )
    }

    // Check if user is dealer admin/owner
    const isAdmin = await isDealerAdmin(supabase, user.id, dealer_id)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only dealer admin/owner can add team members' },
        { status: 403 }
      )
    }

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('id', user_id)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('dealer_staff')
      .select('id')
      .eq('dealer_id', dealer_id)
      .eq('user_id', user_id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Create team member
    const { data: teamMember, error: createError } = await supabase
      .from('dealer_staff')
      .insert({
        dealer_id,
        user_id,
        role,
        can_edit: permissions?.can_edit ?? false,
        can_delete: permissions?.can_delete ?? false
      })
      .select(`
        id,
        dealer_id,
        user_id,
        role,
        can_edit,
        can_delete,
        created_at,
        user:profiles!dealer_staff_user_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating team member:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to add team member' },
        { status: 500 }
      )
    }

    // Transform response
    const response = {
      id: teamMember.id,
      dealer_id: teamMember.dealer_id,
      user_id: teamMember.user_id,
      role: teamMember.role,
      permissions: {
        can_edit: teamMember.can_edit ?? false,
        can_delete: teamMember.can_delete ?? false
      },
      joined_at: teamMember.created_at,
      user: teamMember.user
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Team member added successfully'
    })
  } catch (error) {
    console.error('Error in team POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update team member role/permissions
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, dealer_id, role, permissions } = body

    // Validate required fields
    if (!id || !dealer_id) {
      return NextResponse.json(
        { success: false, error: 'id and dealer_id are required' },
        { status: 400 }
      )
    }

    // Check if user is dealer admin/owner
    const isAdmin = await isDealerAdmin(supabase, user.id, dealer_id)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only dealer admin/owner can update team members' },
        { status: 403 }
      )
    }

    // Get existing team member
    const { data: existingMember, error: fetchError } = await supabase
      .from('dealer_staff')
      .select('*')
      .eq('id', id)
      .eq('dealer_id', dealer_id)
      .single()

    if (fetchError || !existingMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['owner', 'manager', 'sales', 'inspector']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role. Must be one of: ' + validRoles.join(', ') },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (role) updateData.role = role
    if (permissions?.can_edit !== undefined) updateData.can_edit = permissions.can_edit
    if (permissions?.can_delete !== undefined) updateData.can_delete = permissions.can_delete

    // Update team member
    const { data: teamMember, error: updateError } = await supabase
      .from('dealer_staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        dealer_id,
        user_id,
        role,
        can_edit,
        can_delete,
        created_at,
        user:profiles!dealer_staff_user_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating team member:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update team member' },
        { status: 500 }
      )
    }

    // Transform response
    const response = {
      id: teamMember.id,
      dealer_id: teamMember.dealer_id,
      user_id: teamMember.user_id,
      role: teamMember.role,
      permissions: {
        can_edit: teamMember.can_edit ?? false,
        can_delete: teamMember.can_delete ?? false
      },
      joined_at: teamMember.created_at,
      user: teamMember.user
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Team member updated successfully'
    })
  } catch (error) {
    console.error('Error in team PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const dealerId = searchParams.get('dealer_id')

    // Validate required fields
    if (!id || !dealerId) {
      return NextResponse.json(
        { success: false, error: 'id and dealer_id are required' },
        { status: 400 }
      )
    }

    // Check if user is dealer admin/owner
    const isAdmin = await isDealerAdmin(supabase, user.id, dealerId)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only dealer admin/owner can remove team members' },
        { status: 403 }
      )
    }

    // Get existing team member to verify it exists and is not the owner
    const { data: existingMember, error: fetchError } = await supabase
      .from('dealer_staff')
      .select('role, user_id')
      .eq('id', id)
      .eq('dealer_id', dealerId)
      .single()

    if (fetchError || !existingMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Cannot remove owner role
    if (existingMember.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove owner from team' },
        { status: 400 }
      )
    }

    // Delete team member
    const { error: deleteError } = await supabase
      .from('dealer_staff')
      .delete()
      .eq('id', id)
      .eq('dealer_id', dealerId)

    if (deleteError) {
      console.error('Error deleting team member:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to remove team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    })
  } catch (error) {
    console.error('Error in team DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
