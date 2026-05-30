import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to check if user is dealer admin/owner
async function isDealerAdmin(userId: string, dealerId: string): Promise<boolean> {
  // Check if user is the owner
  const dealer = await db.dealer.findUnique({
    where: { id: dealerId },
    select: { owner_id: true },
  })

  if (dealer?.owner_id === userId) {
    return true
  }

  // Check if user is a manager in dealer_staff
  const staff = await db.dealerStaff.findFirst({
    where: {
      dealer_id: dealerId,
      user_id: userId,
      role: { in: ['manager', 'owner'] },
    },
  })

  return !!staff
}

// GET: Fetch team members for a dealer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dealerId = searchParams.get('dealer_id')

    if (!dealerId) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      )
    }

    // Fetch team members with user profile data
    const teamMembers = await db.dealerStaff.findMany({
      where: { dealer_id: dealerId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    })

    // Also get the dealer owner
    const dealer = await db.dealer.findUnique({
      where: { id: dealerId },
      include: {
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
    })

    // Transform the data to include permissions object
    const transformedMembers = teamMembers.map(member => ({
      id: member.id,
      dealer_id: member.dealer_id,
      user_id: member.user_id,
      role: member.role,
      permissions: {
        can_edit: member.can_edit ?? false,
        can_delete: member.can_delete ?? false,
      },
      joined_at: member.created_at,
      user: member.user
        ? {
            ...member.user,
            name: member.user.full_name || 'Unknown',
          }
        : null,
    }))

    // Add owner as first member if not already in the list
    const ownerInTeam = teamMembers.some(m => m.user_id === dealer?.owner_id)
    const ownerMember = dealer?.owner_id && !ownerInTeam
      ? {
          id: 'owner-' + dealer.owner_id,
          dealer_id: dealer.id,
          user_id: dealer.owner_id,
          role: 'owner' as const,
          permissions: {
            can_edit: true,
            can_delete: true,
          },
          joined_at: null,
          user: dealer.owner
            ? {
                ...dealer.owner,
                name: dealer.owner.full_name || 'Unknown',
              }
            : null,
        }
      : null

    const allMembers = ownerMember ? [ownerMember, ...transformedMembers] : transformedMembers

    return NextResponse.json({
      success: true,
      data: allMembers,
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
    const body = await request.json()
    const { dealer_id, user_id, role, permissions, auth_user_id } = body

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

    // Check if auth_user is dealer admin/owner
    if (auth_user_id) {
      const isAdmin = await isDealerAdmin(auth_user_id, dealer_id)
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only dealer admin/owner can add team members' },
          { status: 403 }
        )
      }
    }

    // Check if user exists
    const targetUser = await db.profile.findUnique({
      where: { id: user_id },
      select: { id: true, full_name: true, email: true, avatar_url: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a team member
    const existingMember = await db.dealerStaff.findFirst({
      where: { dealer_id, user_id },
    })

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Create team member
    const teamMember = await db.dealerStaff.create({
      data: {
        dealer_id,
        user_id,
        role,
        can_edit: permissions?.can_edit ?? false,
        can_delete: permissions?.can_delete ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
    })

    // Transform response
    const response = {
      id: teamMember.id,
      dealer_id: teamMember.dealer_id,
      user_id: teamMember.user_id,
      role: teamMember.role,
      permissions: {
        can_edit: teamMember.can_edit ?? false,
        can_delete: teamMember.can_delete ?? false,
      },
      joined_at: teamMember.created_at,
      user: teamMember.user
        ? {
            ...teamMember.user,
            name: teamMember.user.full_name || 'Unknown',
          }
        : null,
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Team member added successfully',
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
    const body = await request.json()
    const { id, dealer_id, role, permissions, auth_user_id } = body

    // Validate required fields
    if (!id || !dealer_id) {
      return NextResponse.json(
        { success: false, error: 'id and dealer_id are required' },
        { status: 400 }
      )
    }

    // Check if auth_user is dealer admin/owner
    if (auth_user_id) {
      const isAdmin = await isDealerAdmin(auth_user_id, dealer_id)
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only dealer admin/owner can update team members' },
          { status: 403 }
        )
      }
    }

    // Get existing team member
    const existingMember = await db.dealerStaff.findFirst({
      where: { id, dealer_id },
    })

    if (!existingMember) {
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
    const teamMember = await db.dealerStaff.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
    })

    // Transform response
    const response = {
      id: teamMember.id,
      dealer_id: teamMember.dealer_id,
      user_id: teamMember.user_id,
      role: teamMember.role,
      permissions: {
        can_edit: teamMember.can_edit ?? false,
        can_delete: teamMember.can_delete ?? false,
      },
      joined_at: teamMember.created_at,
      user: teamMember.user
        ? {
            ...teamMember.user,
            name: teamMember.user.full_name || 'Unknown',
          }
        : null,
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Team member updated successfully',
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const dealerId = searchParams.get('dealer_id')
    const authUserId = searchParams.get('auth_user_id')

    // Validate required fields
    if (!id || !dealerId) {
      return NextResponse.json(
        { success: false, error: 'id and dealer_id are required' },
        { status: 400 }
      )
    }

    // Check if user is dealer admin/owner
    if (authUserId) {
      const isAdmin = await isDealerAdmin(authUserId, dealerId)
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only dealer admin/owner can remove team members' },
          { status: 403 }
        )
      }
    }

    // Get existing team member to verify it exists and is not the owner
    const existingMember = await db.dealerStaff.findFirst({
      where: { id, dealer_id: dealerId },
    })

    if (!existingMember) {
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
    await db.dealerStaff.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    })
  } catch (error) {
    console.error('Error in team DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
