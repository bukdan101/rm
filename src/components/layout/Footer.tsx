'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  MapPin,
  Shield
} from 'lucide-react'

export function Footer() {
  return (
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
  )
}
