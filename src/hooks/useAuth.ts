'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/marketplace'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
  isDealer: boolean
  isSeller: boolean
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  // Fetch profile from profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : 'Unknown error', 
          loading: false 
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if profile exists, if not create one
          let profile = await fetchProfile(session.user.id)
          
          if (!profile) {
            // Create profile for new user
            const newProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name || 
                        session.user.email?.split('@')[0] || null,
              avatar_url: session.user.user_metadata?.avatar_url || 
                         session.user.user_metadata?.picture || null,
              role: 'buyer' as const,
              is_verified: false,
            }

            const { data, error } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single()

            if (!error && data) {
              profile = data as Profile
            }
          }

          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Sign in with Google
  const signInWithGoogle = useCallback(async (redirectPath?: string) => {
    try {
      const callbackUrl = redirectPath 
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      return { error }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error }
      }

      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
      })

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))
    }
  }, [state.user, fetchProfile])

  // Role helpers
  const isAdmin = state.profile?.role === 'admin'
  const isDealer = state.profile?.role === 'dealer' || isAdmin
  const isSeller = state.profile?.role === 'seller' || isDealer

  return {
    ...state,
    signInWithGoogle,
    signOut,
    refreshProfile,
    isAdmin,
    isDealer,
    isSeller,
  }
}
