// ==============================================================
// AstraPay Integration Service
// Handles OAuth2, signatures, payments, account linking,
// paylater, KYC sharing, and repayment reminders
// ==============================================================

import crypto from 'crypto'
import { db } from '@/lib/db'

// --------------- Configuration ---------------

const ASTRAPAY_CLIENT_ID = process.env.ASTRAPAY_CLIENT_ID || ''
const ASTRAPAY_CLIENT_SECRET = process.env.ASTRAPAY_CLIENT_SECRET || ''
const ASTRAPAY_PRIVATE_KEY = process.env.ASTRAPAY_PRIVATE_KEY || ''
const ASTRAPAY_PUBLIC_KEY = process.env.ASTRAPAY_PUBLIC_KEY || ''
const ASTRAPAY_SANDBOX = process.env.ASTRAPAY_SANDBOX === 'true'

const SANDBOX_URL = 'https://sandbox.astrapay.com'
const PRODUCTION_URL = 'https://www.astrapay.com'

const MIN_AMOUNT = 10_000   // Rp 10,000
const MAX_AMOUNT = 10_000_000 // Rp 10,000,000
const TOKEN_EXPIRY_SECONDS = 900 // 15 minutes

// --------------- Helpers ---------------

function getBaseUrl(): string {
  return ASTRAPAY_SANDBOX ? SANDBOX_URL : PRODUCTION_URL
}

function generateMerchantTrxId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AP-${timestamp}-${random}`
}

// --------------- Token Cache (in-memory) ---------------

let cachedToken: {
  accessToken: string
  tokenType: string
  expiresAt: number // Unix ms
} | null = null

// --------------- AstraPay Service Class ---------------

class AstraPayService {
  // ---------------------
  // OAuth2 – getAccessToken
  // ---------------------
  async getAccessToken(): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    // Return cached token if still valid (with 30-second buffer)
    if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
      return {
        access_token: cachedToken.accessToken,
        token_type: cachedToken.tokenType,
        expires_in: Math.max(0, Math.round((cachedToken.expiresAt - Date.now()) / 1000)),
      }
    }

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/oauth/token`

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: ASTRAPAY_CLIENT_ID,
      client_secret: ASTRAPAY_CLIENT_SECRET,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[AstraPay] OAuth error:', response.status, text)
      throw new Error(`AstraPay OAuth failed: ${response.status}`)
    }

    const data = await response.json()

    // Persist to DB for audit
    const expiresAt = new Date(Date.now() + (data.expires_in || TOKEN_EXPIRY_SECONDS) * 1000)
    await db.astraPayToken.create({
      data: {
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || TOKEN_EXPIRY_SECONDS,
        scope: data.scope || null,
        expires_at: expiresAt,
      },
    })

    // Cache in memory
    cachedToken = {
      accessToken: data.access_token,
      tokenType: data.token_type || 'Bearer',
      expiresAt: Date.now() + (data.expires_in || TOKEN_EXPIRY_SECONDS) * 1000,
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || TOKEN_EXPIRY_SECONDS,
    }
  }

  // ---------------------
  // Signature – Auth (RSA-SHA256)
  // ---------------------
  generateSignatureAuth(clientKey: string, timestamp: string): string {
    const stringToSign = `${clientKey}|${timestamp}`
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(stringToSign)
    sign.end()

    const privateKey = ASTRAPAY_PRIVATE_KEY.replace(/\\n/g, '\n')
    const signature = sign.sign(privateKey, 'base64')
    return signature
  }

  // ---------------------
  // Signature – Service (HMAC-SHA512)
  // ---------------------
  generateSignatureService(
    method: string,
    path: string,
    token: string,
    body: string,
    timestamp: string,
  ): string {
    const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
    const stringToSign = `${method.toUpperCase()}:${path}:${token}:${bodyHash}:${timestamp}`
    const hmac = crypto.createHmac('sha512', ASTRAPAY_CLIENT_SECRET)
    hmac.update(stringToSign)
    return hmac.digest('base64')
  }

  // ---------------------
  // Payment with linking
  // ---------------------
  async createPayment(
    signature: string,
    merchantTrxId: string,
    amount: number,
    currency: string,
    description: string,
  ): Promise<{
    merchantTrxId: string
    astrapayTrxId?: string
    token?: string
    urlRedirect?: string
    status: string
  }> {
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new Error(`Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}`)
    }

    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = '/v1/merchant-service/payments'
    const timestamp = new Date().toISOString()
    const body = JSON.stringify({
      merchantTransactionId: merchantTrxId,
      amount: { value: amount, currency },
      description,
    })

    const serviceSignature = this.generateSignatureService(
      'POST',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        'X-Signature': signature || serviceSignature,
        'X-Timestamp': timestamp,
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] createPayment error:', response.status, data)
      throw new Error(data.message || `AstraPay payment creation failed: ${response.status}`)
    }

    return {
      merchantTrxId,
      astrapayTrxId: data.transactionId || data.astrapayTransactionId,
      token: data.token,
      urlRedirect: data.urlRedirect || data.redirectUrl,
      status: data.status || 'pending',
    }
  }

  // ---------------------
  // Push to payment (no linking)
  // ---------------------
  async createPushPayment(
    merchantTrxId: string,
    amount: number,
    currency: string,
    description: string,
  ): Promise<{
    merchantTrxId: string
    astrapayTrxId?: string
    urlRedirect?: string
    status: string
  }> {
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new Error(`Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}`)
    }

    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = '/merchant-service/push-payments'
    const timestamp = new Date().toISOString()
    const body = JSON.stringify({
      merchantTransactionId: merchantTrxId,
      amount: { value: amount, currency },
      description,
    })

    const serviceSignature = this.generateSignatureService(
      'POST',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        'X-Signature': serviceSignature,
        'X-Timestamp': timestamp,
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] createPushPayment error:', response.status, data)
      throw new Error(data.message || `AstraPay push payment failed: ${response.status}`)
    }

    return {
      merchantTrxId,
      astrapayTrxId: data.transactionId || data.astrapayTransactionId,
      urlRedirect: data.urlRedirect || data.redirectUrl,
      status: data.status || 'pending',
    }
  }

  // ---------------------
  // Get transaction status
  // ---------------------
  async getTransactionStatus(merchantTrxId: string): Promise<{
    merchantTrxId: string
    astrapayTrxId?: string
    status: string
    amount?: number
    currency?: string
    paidAt?: string
  }> {
    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = `/v1/merchant-service/payments/${merchantTrxId}`
    const timestamp = new Date().toISOString()
    const body = ''

    const serviceSignature = this.generateSignatureService(
      'GET',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'X-Signature': serviceSignature,
        'X-Timestamp': timestamp,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] getTransactionStatus error:', response.status, data)
      throw new Error(data.message || `AstraPay status check failed: ${response.status}`)
    }

    return {
      merchantTrxId,
      astrapayTrxId: data.transactionId || data.astrapayTransactionId,
      status: data.status || 'unknown',
      amount: data.amount?.value,
      currency: data.amount?.currency,
      paidAt: data.paidAt,
    }
  }

  // ---------------------
  // Account link URL
  // ---------------------
  createAccountLinkUrl(clientId: string, merchantUserId: string): string {
    const baseUrl = getBaseUrl()
    const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''}/api/astrapay/account-link/callback`
    return `${baseUrl}/v1/account-link?clientId=${encodeURIComponent(clientId)}&merchantUserId=${encodeURIComponent(merchantUserId)}&redirectUrl=${encodeURIComponent(redirectUrl)}`
  }

  // ---------------------
  // Paylater registration
  // ---------------------
  async registerPaylater(
    phoneNumber: string,
    status: 'ACTIVE' | 'REJECTED' | 'BLOCKED',
    rejectReason?: string,
    reapplyDate?: string,
  ): Promise<{ success: boolean; message: string }> {
    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = '/v1/paylater/register'
    const timestamp = new Date().toISOString()

    const payload: Record<string, unknown> = {
      phoneNumber,
      status,
    }
    if (rejectReason) payload.rejectReason = rejectReason
    if (reapplyDate) payload.reapplyDate = reapplyDate

    const body = JSON.stringify(payload)
    const serviceSignature = this.generateSignatureService(
      'POST',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        'X-Signature': serviceSignature,
        'X-Timestamp': timestamp,
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] registerPaylater error:', response.status, data)
      return { success: false, message: data.message || 'Paylater registration failed' }
    }

    return { success: true, message: data.message || 'Paylater registered successfully' }
  }

  // ---------------------
  // Share KYC data (auto-preferred)
  // ---------------------
  async shareKycData(kycData: {
    phoneNumber: string
    ktpNumber: string
    fullName: string
    dateOfBirth: string
    address: string
  }): Promise<{ success: boolean; message: string }> {
    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = '/v1/kyc/share'
    const timestamp = new Date().toISOString()
    const body = JSON.stringify(kycData)

    const serviceSignature = this.generateSignatureService(
      'POST',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        'X-Signature': serviceSignature,
        'X-Timestamp': timestamp,
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] shareKycData error:', response.status, data)
      return { success: false, message: data.message || 'KYC data sharing failed' }
    }

    return { success: true, message: data.message || 'KYC data shared successfully' }
  }

  // ---------------------
  // Send repayment reminder
  // ---------------------
  async sendRepaymentReminder(
    phoneNumber: string,
    status: 'UPCOMING' | 'OVERDUE' | 'FINAL_NOTICE',
  ): Promise<{ success: boolean; message: string }> {
    const { access_token } = await this.getAccessToken()
    const baseUrl = getBaseUrl()
    const path = '/v1/paylater/repayment-reminder'
    const timestamp = new Date().toISOString()
    const body = JSON.stringify({ phoneNumber, status })

    const serviceSignature = this.generateSignatureService(
      'POST',
      path,
      access_token,
      body,
      timestamp,
    )

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        'X-Signature': serviceSignature,
        'X-Timestamp': timestamp,
      },
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AstraPay] sendRepaymentReminder error:', response.status, data)
      return { success: false, message: data.message || 'Reminder failed' }
    }

    return { success: true, message: data.message || 'Reminder sent successfully' }
  }
}

// --------------- Singleton export ---------------

export const astraPayService = new AstraPayService()
export { generateMerchantTrxId, getBaseUrl, MIN_AMOUNT, MAX_AMOUNT }
export default astraPayService
