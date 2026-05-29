import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { astraPayService } from '@/lib/astrapay'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

// POST – Generate account link URL for user
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { userId } = body as { userId?: string }

    const targetUserId = userId || auth.userId

    // Check if already linked
    const existingLink = await db.astraPayAccountLink.findFirst({
      where: { user_id: targetUserId, is_linked: true },
    })

    if (existingLink) {
      return successResponse({
        linked: true,
        linkUrl: null,
        message: 'Account already linked',
        astrapayPhone: existingLink.astrapay_phone,
      })
    }

    // Generate account link URL
    const clientId = process.env.ASTRAPAY_CLIENT_ID || ''
    const merchantUserId = `AM-${targetUserId}`
    const linkUrl = astraPayService.createAccountLinkUrl(clientId, merchantUserId)

    // Upsert the account link record
    await db.astraPayAccountLink.upsert({
      where: { id: `${targetUserId}-link` },
      update: { merchant_user_id: merchantUserId, updated_at: new Date() },
      create: {
        id: `${targetUserId}-link`,
        user_id: targetUserId,
        merchant_user_id: merchantUserId,
        is_linked: false,
      },
    })

    return successResponse({
      linked: false,
      linkUrl,
      merchantUserId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate account link'
    return errorResponse(message, 500, 'ACCOUNT_LINK_ERROR')
  }
}

// GET – Check if user has linked AstraPay account
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || auth.userId

    const accountLink = await db.astraPayAccountLink.findFirst({
      where: { user_id: userId },
    })

    return successResponse({
      linked: accountLink?.is_linked ?? false,
      astrapayPhone: accountLink?.astrapay_phone ?? null,
      merchantUserId: accountLink?.merchant_user_id ?? null,
      linkedAt: accountLink?.linked_at ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check account link'
    return errorResponse(message, 500, 'ACCOUNT_LINK_CHECK_ERROR')
  }
}
