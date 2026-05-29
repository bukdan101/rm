'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Car brands with their display names, colors, and logo paths
const carBrands = [
  { name: 'Toyota', slug: 'toyota', color: '#EB0A1E', logo: '/brands/toyota.png' },
  { name: 'Honda', slug: 'honda', color: '#CC0000', logo: '/brands/honda.png' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', color: '#333333', logo: '/brands/mercedes-benz.png' },
  { name: 'BMW', slug: 'bmw', color: '#0066B1', logo: '/brands/bmw.png' },
  { name: 'Hyundai', slug: 'hyundai', color: '#002C5F', logo: '/brands/hyundai.png' },
  { name: 'Mitsubishi', slug: 'mitsubishi', color: '#ED1B2E', logo: '/brands/mitsubishi.png' },
  { name: 'Suzuki', slug: 'suzuki', color: '#1C3C70', logo: '/brands/suzuki.png' },
  { name: 'Daihatsu', slug: 'daihatsu', color: '#ED1C24', logo: '/brands/daihatsu.png' },
  { name: 'Mazda', slug: 'mazda', color: '#910000', logo: '/brands/mazda.png' },
  { name: 'Lexus', slug: 'lexus', color: '#1A1A1A', logo: '/brands/lexus.png' },
  { name: 'Nissan', slug: 'nissan', color: '#C3002F', logo: '/brands/nissan.png' },
  { name: 'MINI', slug: 'mini', color: '#000000', logo: '/brands/mini.png' },
  { name: 'Chery', slug: 'chery', color: '#003366', logo: '/brands/chery.png' },
  { name: 'Porsche', slug: 'porsche', color: '#B12B28', logo: '/brands/porsche.png' },
  { name: 'Land Rover', slug: 'land-rover', color: '#005A2B', logo: '/brands/land-rover.png' },
  { name: 'BYD', slug: 'byd', color: '#00A0E9', logo: '/brands/byd.png' },
  { name: 'Jeep', slug: 'jeep', color: '#006400', logo: '/brands/jeep.png' },
  { name: 'Wuling', slug: 'wuling', color: '#D71A21', logo: '/brands/wuling.png' },
  { name: 'GAC', slug: 'gac', color: '#003C71', logo: '/brands/gac.png' },
  { name: 'Ford', slug: 'ford', color: '#003478', logo: '/brands/ford.png' },
  { name: 'KIA', slug: 'kia', color: '#BB162B', logo: '/brands/kia.png' },
  { name: 'Volkswagen', slug: 'volkswagen', color: '#001E50', logo: '/brands/volkswagen.png' },
  { name: 'Geely', slug: 'geely', color: '#0055A5', logo: '/brands/geely.png' },
  { name: 'Chevrolet', slug: 'chevrolet', color: '#D1A436', logo: '/brands/chevrolet.png' },
  { name: 'GWM', slug: 'gwm', color: '#C41230', logo: '/brands/gwm.svg' },
  { name: 'Audi', slug: 'audi', color: '#BB0A30', logo: '/brands/audi.png' },
  { name: 'MG', slug: 'mg', color: '#FF0000', logo: '/brands/mg.png' },
  { name: 'Subaru', slug: 'subaru', color: '#013C7E', logo: '/brands/subaru.png' },
  { name: 'Isuzu', slug: 'isuzu', color: '#E20D17', logo: '/brands/isuzu.png' },
  { name: 'Peugeot', slug: 'peugeot', color: '#00205B', logo: '/brands/peugeot.png' },
  { name: 'Ferrari', slug: 'ferrari', color: '#DC0000', logo: '/brands/ferrari.png' },
]

export function SponsorLogos() {
  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-y border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
            Cari Mobil Berdasarkan Merek
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dipercaya oleh brand otomotif terkemuka di Indonesia
          </p>
        </div>

        {/* Brands Grid - Similar to mobil123/oto.com style */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-11 gap-2">
          {carBrands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marketplace?brand=${brand.slug}`}
              className="group"
            >
              <div className={cn(
                "flex flex-col items-center justify-center",
                "p-2 sm:p-3 rounded-lg",
                "bg-white dark:bg-gray-800/50",
                "border border-gray-200 dark:border-gray-700",
                "hover:border-purple-300 dark:hover:border-purple-600",
                "hover:shadow-lg",
                "transition-all duration-300",
                "group-hover:scale-105"
              )}>
                {/* Brand Logo Image */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={48}
                    height={32}
                    className="w-10 sm:w-12 h-auto object-contain"
                  />
                </div>
                
                {/* Brand Name */}
                <div className={cn(
                  "text-[10px] sm:text-xs font-semibold text-center leading-tight",
                  "text-gray-700 dark:text-gray-300",
                  "group-hover:text-purple-600 dark:group-hover:text-purple-400",
                  "transition-colors duration-300"
                )}>
                  {brand.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            32+ Brand Terverifikasi · Kualitas Terjamin
          </p>
        </div>
      </div>
    </section>
  )
}
