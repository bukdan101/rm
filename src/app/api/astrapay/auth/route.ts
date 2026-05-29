import { NextRequest } from 'next/server'
import { astraPayService } from '@/lib/astrapay'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const tokenData = await astraPayService.getAccessToken()
    return successResponse({
      token: {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get AstraPay token'
    return errorResponse(message, 500, 'ASTRAPAY_AUTH_ERROR')
  }
}
