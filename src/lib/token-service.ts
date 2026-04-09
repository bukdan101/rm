import { supabase } from '@/lib/supabase'

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
 * Get active token settings
 */
export async function getActiveTokenSettings() {
  const { data, error } = await supabase
    .from('token_settings')
    .select('*')
    .eq('is_active', true)
    .or('valid_until.is.null,valid_until.gt.' + new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error fetching token settings:', error)
    return null
  }
  
  return data
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
      listing_normal: 10,
      listing_dealer: 20,
      dealer_contact: 5,
      boost: 3,
      highlight: 2,
      featured: 5,
      premium_badge: 10,
      top_search: 5,
      inspection: 0
    }
    return defaults[action] || 0
  }
  
  const costMap: Record<TokenActionType, string> = {
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
  return settings[field] || 0
}

/**
 * Get user's current token balance
 */
export async function getTokenBalance(userId?: string, dealerId?: string): Promise<number> {
  if (!userId && !dealerId) return 0
  
  let query = supabase
    .from('user_tokens')
    .select('balance')
  
  if (userId) {
    query = query.eq('user_id', userId)
  } else if (dealerId) {
    query = query.eq('dealer_id', dealerId)
  }
  
  const { data, error } = await query.single()
  
  if (error) {
    // Create new record if not exists
    if (error.code === 'PGRST116') {
      const insertData: any = { balance: 0 }
      if (userId) insertData.user_id = userId
      if (dealerId) insertData.dealer_id = dealerId
      
      await supabase.from('user_tokens').insert(insertData)
      return 0
    }
    console.error('Error fetching token balance:', error)
    return 0
  }
  
  return data?.balance || 0
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
    
    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        dealer_id: dealerId,
        transaction_type: 'usage',
        amount: -tokensRequired,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description || `${action}: -${tokensRequired} tokens`
      })
      .select('id')
      .single()
    
    if (txError) throw txError
    
    // Update balance
    const updateData = {
      balance: balanceAfter,
      total_used: supabase.rpc('increment', { x: tokensRequired }),
      last_usage_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    let updateQuery = supabase.from('user_tokens').update({
      balance: balanceAfter,
      last_usage_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    if (userId) {
      updateQuery = updateQuery.eq('user_id', userId)
    } else if (dealerId) {
      updateQuery = updateQuery.eq('dealer_id', dealerId)
    }
    
    const { error: updateError } = await updateQuery
    
    if (updateError) throw updateError
    
    return {
      success: true,
      transactionId: transaction?.id,
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
    
    // Get current balance
    const balanceBefore = await getTokenBalance(userId, dealerId)
    const balanceAfter = balanceBefore + amount
    
    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        dealer_id: dealerId,
        transaction_type: transactionType,
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: description || `Token ${transactionType}: +${amount} tokens`
      })
      .select('id')
      .single()
    
    if (txError) throw txError
    
    // Update or create balance record
    const { data: existing } = await supabase
      .from('user_tokens')
      .select('*')
      .eq(userId ? 'user_id' : 'dealer_id', userId || dealerId)
      .single()
    
    if (existing) {
      const updateData: any = {
        balance: balanceAfter,
        updated_at: new Date().toISOString()
      }
      
      if (transactionType === 'purchase') {
        updateData.total_purchased = (existing.total_purchased || 0) + amount
        updateData.last_purchase_at = new Date().toISOString()
      } else if (transactionType === 'bonus') {
        updateData.total_bonus = (existing.total_bonus || 0) + amount
      }
      
      let updateQuery = supabase.from('user_tokens').update(updateData)
      if (userId) {
        updateQuery = updateQuery.eq('user_id', userId)
      } else {
        updateQuery = updateQuery.eq('dealer_id', dealerId)
      }
      await updateQuery
    } else {
      const insertData: any = {
        balance: balanceAfter,
        total_purchased: transactionType === 'purchase' ? amount : 0,
        total_bonus: transactionType === 'bonus' ? amount : 0
      }
      if (userId) insertData.user_id = userId
      if (dealerId) insertData.dealer_id = dealerId
      
      await supabase.from('user_tokens').insert(insertData)
    }
    
    return {
      success: true,
      transactionId: transaction?.id,
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
      listing_normal: { tokens: 10, duration: 30 },
      listing_dealer: { tokens: 20, duration: 7 },
      dealer_contact: { tokens: 5 },
      boost: { tokens: 3, duration: 7 },
      highlight: { tokens: 2, duration: 7 },
      featured: { tokens: 5, duration: 7 },
      premium_badge: { tokens: 10, duration: 30 },
      top_search: { tokens: 5, duration: 7 },
      inspection: { tokens: 0 }
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
