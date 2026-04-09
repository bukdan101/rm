'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Shield,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  // Handle Jual Mobil button click
  const handleJualMobil = () => {
    if (loading) return
    
    if (!user) {
      // Not logged in - redirect to auth
      router.push('/auth?redirect=/listing/create')
    } else if (!profile?.full_name && !profile?.phone) {
      // New user without complete profile - redirect to onboarding
      router.push('/onboarding?redirect=/listing/create')
    } else {
      // Authenticated - go to listing creation
      router.push('/listing/create')
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              +62 857-1541-4856
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Inspeksi 160 Titik
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dealer" className="hover:text-purple-200 transition">Jadi Dealer</Link>
            <Link href="/bantuan" className="hover:text-purple-200 transition">Bantuan</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image 
                src="/logo.png" 
                alt="AutoMarket Logo" 
                width={160} 
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari mobil, brand, atau lokasi..."
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                Marketplace
              </Link>
              <Link href="/rental" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                Rental
              </Link>
              <Link href="/dealer" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                Dealer
              </Link>
              <Link href="/inspeksi" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                Inspeksi
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="w-5 h-5 text-gray-600" />
              </Button>
              
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <User className="w-5 h-5 text-gray-600" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <User className="w-5 h-5 text-gray-600" />
                  </Button>
                </Link>
              )}
              
              <Button 
                onClick={handleJualMobil}
                className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Jual Mobil'
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari mobil..."
                className="pl-10 h-10 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link href="/marketplace" className="block py-2 text-gray-600 hover:text-purple-600">
                Marketplace
              </Link>
              <Link href="/rental" className="block py-2 text-gray-600 hover:text-purple-600">
                Rental
              </Link>
              <Link href="/dealer" className="block py-2 text-gray-600 hover:text-purple-600">
                Dealer
              </Link>
              <Link href="/inspeksi" className="block py-2 text-gray-600 hover:text-purple-600">
                Inspeksi
              </Link>
              <hr />
              {user ? (
                <Link href="/dashboard" className="block py-2 text-gray-600 hover:text-purple-600">
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth" className="block py-2 text-gray-600 hover:text-purple-600">
                  Masuk / Daftar
                </Link>
              )}
              <Button 
                onClick={handleJualMobil}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Jual Mobil'
                )}
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
