'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Phone,
  Shield
} from 'lucide-react'
import { useState } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

const categories = [
  { name: 'Sedan', icon: '🚗', count: 1250 },
  { name: 'SUV', icon: '🚙', count: 890 },
  { name: 'MPV', icon: '🚐', count: 650 },
  { name: 'Hatchback', icon: '🚘', count: 420 },
  { name: 'Pickup', icon: '🛻', count: 380 },
  { name: 'Van', icon: '🚚', count: 150 },
]

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-brand-gradient text-white text-xs py-1.5 hidden md:block">
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
              <Link href="/auth">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
              <Link href="/listing/create" className="hidden sm:block">
                <Button className="bg-brand-gradient hover:opacity-90">
                  Jual Mobil
                </Button>
              </Link>
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
              <Link href="/auth" className="block py-2 text-gray-600 hover:text-purple-600">
                Masuk / Daftar
              </Link>
              <Link href="/listing/create" className="block">
                <Button className="w-full bg-brand-gradient hover:opacity-90">
                  Jual Mobil
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="AutoMarket Logo" 
                  width={150} 
                  height={50}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Marketplace mobil terpercaya dengan sistem inspeksi 160 titik untuk menjamin kualitas kendaraan.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 cursor-pointer transition">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 cursor-pointer transition">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 cursor-pointer transition">
                  <span className="text-xs font-bold">YT</span>
                </div>
              </div>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="font-semibold text-white mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/jual" className="hover:text-purple-400 transition">Jual Mobil</Link></li>
                <li><Link href="/beli" className="hover:text-purple-400 transition">Beli Mobil</Link></li>
                <li><Link href="/rental" className="hover:text-purple-400 transition">Rental Mobil</Link></li>
                <li><Link href="/inspeksi" className="hover:text-purple-400 transition">Inspeksi 160 Titik</Link></li>
                <li><Link href="/leasing" className="hover:text-purple-400 transition">Leasing</Link></li>
              </ul>
            </div>

            {/* Informasi */}
            <div>
              <h4 className="font-semibold text-white mb-4">Informasi</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tentang" className="hover:text-purple-400 transition">Tentang Kami</Link></li>
                <li><Link href="/cara-kerja" className="hover:text-purple-400 transition">Cara Kerja</Link></li>
                <li><Link href="/faq" className="hover:text-purple-400 transition">FAQ</Link></li>
                <li><Link href="/syarat-ketentuan" className="hover:text-purple-400 transition">Syarat & Ketentuan</Link></li>
                <li><Link href="/kebijakan-privasi" className="hover:text-purple-400 transition">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span>+62 857-1541-4856</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Terverifikasi
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 AutoMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
