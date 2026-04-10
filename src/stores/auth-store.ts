/**
 * Auth Store - Zustand state management for authentication
 * Works with both microservice JWT and Supabase auth
 */
'use client'

import { create } from 'zustand'
import type { Profile } from '@/types/marketplace'

interface AuthState {
  user: {
    id: string
    email: string
    name?: string
    avatar_url?: string
  } | null
  profile: Profile | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isDealer: boolean
  isSeller: boolean

  setAuth: (user: AuthState['user'], token: string, profile?: Profile | null) => void
  setProfile: (profile: Profile) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('automarket_token') : null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isDealer: false,
  isSeller: false,

  setAuth: (user, token, profile = null) => {
    localStorage.setItem('automarket_token', token)
    set({
      user,
      token,
      profile,
      loading: false,
      isAuthenticated: true,
      isAdmin: profile?.role === 'admin',
      isDealer: profile?.role === 'dealer' || profile?.role === 'admin',
      isSeller: profile?.role === 'seller' || profile?.role === 'dealer' || profile?.role === 'admin',
    })
  },

  setProfile: (profile) => {
    const state = get()
    set({
      profile,
      isAdmin: profile.role === 'admin',
      isDealer: profile.role === 'dealer' || profile.role === 'admin',
      isSeller: profile.role === 'seller' || profile.role === 'dealer' || profile.role === 'admin',
    })
  },

  setLoading: (loading) => set({ loading }),

  logout: () => {
    localStorage.removeItem('automarket_token')
    set({
      user: null,
      profile: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isDealer: false,
      isSeller: false,
    })
  },
}))
