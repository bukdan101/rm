import { db } from '@/lib/db'

// Token action types
export type TokenActionType = 
  | 'ai_prediction' 
  | 'listing_normal' 
  | 'listing_dealer'
  | 'dealer_contact'
  | 'boost'
  | 'highlight'
  | 'featured'
  | 'premium_badge'
  | 'top_search'
  | 'inspection'

export interface TokenCostResult {
  success: boolean
  tokensRequired: number
  currentBalance: number
  isInsufficient: boolean
  error?: string
}

export interface TokenDeductionResult {
  success: boolean
  transactionId?: string
  newBalance?: number
  error?: string
}

/**
 * Get active token settings (single-row wide table)
 */
export async function getActiveTokenSettings() {
  const settings = await db.tokenSetting.findFirst({
    where: { is_active: true },
    orderBy: { created_at: 'desc' }
  })
  
  return settings
}

/**
 * Calculate token cost for an action
 */
export async function calculateTokenCost(action: TokenActionType): Promise<number> {
  const settings = await getActiveTokenSettings()
  
  if (!settings) {
    // Default fallback values
    const defaults: Record<TokenActionType, number> = {
      ai_prediction: 5,
      listing_normal: 3,
      listing_dealer: 5,
      dealer_contact: 2,
      boost: 5,
      highlight: 3,
      featured: 10,
      premium_badge: 8,
      top_search: 6,
      inspection: 5
    }
    return defaults[action] || 0
  }
  
  const costMap: Record<TokenActionType, keyof typeof settings> = {
    ai_prediction: 'ai_prediction_tokens',
    listing_normal: 'listing_normal_tokens',
    listing_dealer: 'listing_dealer_tokens',
    dealer_contact: 'dealer_contact_tokens',
    boost: 'boost_tokens',
    highlight: 'highlight_tokens',
    featured: 'featured_tokens',
    premium_badge: 'premium_badge_tokens',
    top_search: 'top_search_tokens',
    inspection: 'inspection_tokens'
  }
  
  const field = costMap[action]
  return (settings[field] as number) || 0
}

/**
 * Get user's current token balance
 */
export async function getTokenBalance(userId?: string, dealerId?: string): Promise<number> {
  if (!userId && !dealerId) return 0
  
  let where: any = {}
  if (userId) {
    where.user_id = userId
  } else if (dealerId) {
    where.dealer_id = dealerId
  }
  
  const credit = await db.userCredit.findFirst({ where })
  
  if (!credit) {
    // Create new record if not exists
    const data: any = { balance: 0, total_earned: 0, total_spent: 0, total_bonus: 0 }
    if (userId) data.user_id = userId
    if (dealerId) data.dealer_id = dealerId
    
    await db.userCredit.create({ data })
    return 0
  }
  
  return credit.balance || 0
}

/**
 * Check if user has enough tokens for an action
 */
export async function checkTokenBalance(
  action: TokenActionType,
  userId?: string,
  dealerId?: string
): Promise<TokenCostResult> {
  const tokensRequired = await calculateTokenCost(action)
  const currentBalance = await getTokenBalance(userId, dealerId)
  
  // If action is free (like inspection)
  if (tokensRequired === 0) {
    return {
      success: true,
      tokensRequired: 0,
      currentBalance,
      isInsufficient: false
    }
  }
  
  return {
    success: currentBalance >= tokensRequired,
    tokensRequired,
    currentBalance,
    isInsufficient: currentBalance < tokensRequired,
    error: currentBalance < tokensRequired 
      ? `Saldo token tidak cukup. Diperlukan ${tokensRequired} token, saldo Anda ${currentBalance} token.`
      : undefined
  }
}

/**
 * Deduct tokens from user's balance
 */
export async function deductTokens(
  action: TokenActionType,
  userId: string | undefined,
  dealerId: string | undefined,
  referenceType?: string,
  referenceId?: string,
  description?: string
): Promise<TokenDeductionResult> {
  try {
    // Get token cost
    const tokensRequired = await calculateTokenCost(action)
    
    // If free, return success
    if (tokensRequired === 0) {
      return { success: true, newBalance: await getTokenBalance(userId, dealerId) }
    }
    
    // Check balance
    const balanceCheck = await checkTokenBalance(action, userId, dealerId)
    
    if (balanceCheck.isInsufficient) {
      return {
        success: false,
        error: balanceCheck.error || 'Insufficient token balance'
      }
    }
    
    // Get current balance
    const balanceBefore = balanceCheck.currentBalance
    const balanceAfter = balanceBefore - tokensRequired
    
    // Find user credit record
    let where: any = {}
    if (userId) {
      where.user_id = userId
    } else if (dealerId) {
      where.dealer_id = dealerId
    }
    
    const userCredit = await db.userCredit.findFirst({ where })
    
    if (!userCredit) {
      return { success: false, error: 'User credit record not found' }
    }
    
    // Create transaction
    const transaction = await db.creditTransaction.create({
      data: {
        user_credit_id: userCredit.id,
        user_id: userId,
        type: 'usage',
        amount: -tokensRequired,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description || `${action}: -${tokensRequired} tokens`
      }
    })
    
    // Update balance
    await db.userCredit.update({
      where: { id: userCredit.id },
      data: {
        balance: balanceAfter,
        total_spent: userCredit.total_spent + tokensRequired,
        last_usage_at: new Date()
      }
    })
    
    return {
      success: true,
      transactionId: transaction.id,
      newBalance: balanceAfter
    }
  } catch (error) {
    console.error('Error deducting tokens:', error)
    return {
      success: false,
      error: 'Failed to deduct tokens'
    }
  }
}

/**
 * Add tokens to user's balance (purchase, bonus, refund)
 */
export async function addTokens(
  amount: number,
  userId?: string,
  dealerId?: string,
  transactionType: 'purchase' | 'bonus' | 'refund' | 'adjustment' = 'purchase',
  description?: string
): Promise<TokenDeductionResult> {
  try {
    if (!userId && !dealerId) {
      return { success: false, error: 'User ID or Dealer ID is required' }
    }
    
    // Get current balance / find or create user credit
    let where: any = {}
    if (userId) {
      where.user_id = userId
    } else if (dealerId) {
      where.dealer_id = dealerId
    }
    
    let userCredit = await db.userCredit.findFirst({ where })
    
    const balanceBefore = userCredit?.balance || 0
    const balanceAfter = balanceBefore + amount
    
    if (userCredit) {
      // Update existing record
      const updateData: any = {
        balance: balanceAfter,
        total_earned: userCredit.total_earned + amount
      }
      
      if (transactionType === 'purchase') {
        updateData.last_purchase_at = new Date()
      } else if (transactionType === 'bonus') {
        updateData.total_bonus = userCredit.total_bonus + amount
      }
      
      userCredit = await db.userCredit.update({
        where: { id: userCredit.id },
        data: updateData
      })
    } else {
      // Create new record
      const data: any = {
        balance: balanceAfter,
        total_earned: amount,
        total_spent: 0,
        total_bonus: transactionType === 'bonus' ? amount : 0
      }
      if (userId) data.user_id = userId
      if (dealerId) data.dealer_id = dealerId
      if (transactionType === 'purchase') data.last_purchase_at = new Date()
      
      userCredit = await db.userCredit.create({ data })
    }
    
    // Create transaction record
    const transaction = await db.creditTransaction.create({
      data: {
        user_credit_id: userCredit.id,
        user_id: userId,
        type: transactionType,
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: description || `Token ${transactionType}: +${amount} tokens`
      }
    })
    
    return {
      success: true,
      transactionId: transaction.id,
      newBalance: balanceAfter
    }
  } catch (error) {
    console.error('Error adding tokens:', error)
    return {
      success: false,
      error: 'Failed to add tokens'
    }
  }
}

/**
 * Get all token costs for display
 */
export async function getAllTokenCosts(): Promise<Record<TokenActionType, { tokens: number, duration?: number }>> {
  const settings = await getActiveTokenSettings()
  
  if (!settings) {
    // Return defaults
    return {
      ai_prediction: { tokens: 5, duration: 24 },
      listing_normal: { tokens: 3, duration: 30 },
      listing_dealer: { tokens: 5, duration: 30 },
      dealer_contact: { tokens: 2 },
      boost: { tokens: 5, duration: 7 },
      highlight: { tokens: 3, duration: 7 },
      featured: { tokens: 10, duration: 7 },
      premium_badge: { tokens: 8, duration: 30 },
      top_search: { tokens: 6, duration: 7 },
      inspection: { tokens: 5 }
    }
  }
  
  return {
    ai_prediction: { tokens: settings.ai_prediction_tokens, duration: settings.ai_prediction_duration_hours },
    listing_normal: { tokens: settings.listing_normal_tokens, duration: settings.listing_normal_duration_days },
    listing_dealer: { tokens: settings.listing_dealer_tokens, duration: settings.listing_dealer_duration_days },
    dealer_contact: { tokens: settings.dealer_contact_tokens },
    boost: { tokens: settings.boost_tokens, duration: settings.boost_duration_days },
    highlight: { tokens: settings.highlight_tokens, duration: settings.highlight_duration_days },
    featured: { tokens: settings.featured_tokens, duration: settings.featured_duration_days },
    premium_badge: { tokens: settings.premium_badge_tokens, duration: settings.premium_badge_duration_days },
    top_search: { tokens: settings.top_search_tokens, duration: settings.top_search_duration_days },
    inspection: { tokens: settings.inspection_tokens }
  }
}
