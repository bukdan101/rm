'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

// Brand data with models and logo paths - 32 brands
const brandData: Record<string, {
  models: string[]
  logo: string
}> = {
  Toyota: {
    logo: '/brands/toyota.png',
    models: ['Avanza', 'Raize', 'Calya', 'Agya', 'Innova', 'Rush', 'Veloz', 'Yaris', 'Fortuner', 'Sienta', 'Voxy', 'Alphard', 'Yaris Cross', 'Corolla', 'Camry', 'Hilux', 'Land Cruiser']
  },
  Honda: {
    logo: '/brands/honda.png',
    models: ['BRIO', 'BR-V', 'HR-V', 'CR-V', 'CITY', 'JAZZ', 'MOBILIO', 'WR-V', 'ACCORD', 'CIVIC', 'HR-V', 'ZR-V']
  },
  'Mercedes-Benz': {
    logo: '/brands/mercedes-benz.png',
    models: ['C200', 'E200', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class', 'A-Class', 'CLA', 'C-Class', 'E-Class']
  },
  BMW: {
    logo: '/brands/bmw.png',
    models: ['330i', '320i', 'X1', 'X3', 'X5', 'X7', '520i', '7 Series', 'M3', 'M5', 'X4', 'X6']
  },
  Hyundai: {
    logo: '/brands/hyundai.png',
    models: ['STARGAZER', 'CRETA', 'IONIQ', 'KONA', 'TUCSON', 'SANTAFE', 'PALISADE', 'IONIQ 5', 'IONIQ 6']
  },
  Mitsubishi: {
    logo: '/brands/mitsubishi.png',
    models: ['XPANDER', 'PAJERO', 'XFORCE', 'ECLIPSE CROSS', 'MIRAGE', 'OUTLANDER', 'TRITON', 'L300']
  },
  Suzuki: {
    logo: '/brands/suzuki.png',
    models: ['XL7', 'ERTIGA', 'BALENO', 'IGNIS', 'SX4', 'S-PRESSO', 'APV', 'KARIMUN', 'JIMNY', 'GRAND VITARA']
  },
  Daihatsu: {
    logo: '/brands/daihatsu.png',
    models: ['AYLA', 'SIGRA', 'TERIOS', 'XENIA', 'ROCKY', 'SIRION', 'GRANMAX', 'HI-MAX', 'LUXIO']
  },
  Mazda: {
    logo: '/brands/mazda.png',
    models: ['CX-3', 'CX-5', 'CX-8', 'CX-9', 'CX-30', 'MAZDA 2', 'MAZDA 3', 'MAZDA 6', 'MX-5']
  },
  Lexus: {
    logo: '/brands/lexus.png',
    models: ['ES300h', 'RX300', 'NX300', 'LX570', 'UX', 'LS', 'LC', 'RX', 'NX', 'LX']
  },
  Nissan: {
    logo: '/brands/nissan.png',
    models: ['LIVINA', 'SERENA', 'X-TRAIL', 'GRAND LIVINA', 'MARCH', 'NAVARA', 'ALMERA', 'GT-R', 'LEAF', 'KICKS']
  },
  MINI: {
    logo: '/brands/mini.png',
    models: ['Cooper', 'Cooper S', 'John Cooper Works', 'Countryman', 'Clubman', 'Paceman']
  },
  Chery: {
    logo: '/brands/chery.png',
    models: ['Tiggo 8 Pro', 'Tiggo 7 Pro', 'Omoda 5', 'Tiggo 5x', 'Arrizo', 'Tiggo 2']
  },
  Porsche: {
    logo: '/brands/porsche.png',
    models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster']
  },
  'Land Rover': {
    logo: '/brands/land-rover.png',
    models: ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Discovery', 'Defender', 'Velar']
  },
  BYD: {
    logo: '/brands/byd.png',
    models: ['Atto 3', 'Dolphin', 'Seal', 'M6', 'Tang', 'Han', 'Song']
  },
  Jeep: {
    logo: '/brands/jeep.png',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator']
  },
  Wuling: {
    logo: '/brands/wuling.png',
    models: ['ALMAZ', 'CORTEZ', 'AIR EV', 'CONFERO', 'FORMO', 'EV50', 'STARLIGHT']
  },
  GAC: {
    logo: '/brands/gac.png',
    models: ['GS3', 'GS4', 'GS5', 'GS8', 'GN6', 'GN8', 'Empow', 'Aion S']
  },
  Ford: {
    logo: '/brands/ford.png',
    models: ['Ranger', 'Everest', 'Explorer', 'Escape', 'Focus', 'Mustang', 'F-150', 'Bronco']
  },
  KIA: {
    logo: '/brands/kia.png',
    models: ['SONET', 'SELTOS', 'SPORTAGE', 'SORRENTO', 'CARNIVAL', 'K5', 'STINGER', 'EV6', 'CARENS']
  },
  Volkswagen: {
    logo: '/brands/volkswagen.png',
    models: ['Golf', 'Polo', 'Tiguan', 'Passat', 'Jetta', 'T-Cross', 'ID.4', 'ID.3', 'Amarok']
  },
  Geely: {
    logo: '/brands/geely.png',
    models: ['Coolray', 'Azkarra', 'Okavango', 'Geometry C', 'Tugella', 'Monjaro']
  },
  Chevrolet: {
    logo: '/brands/chevrolet.png',
    models: ['Spark', 'Sonic', 'Trax', 'Equinox', 'Trailblazer', 'Colorado', 'Camaro', 'Corvette']
  },
  GWM: {
    logo: '/brands/gwm.svg',
    models: ['Haval Jolion', 'Haval H6', 'Tank 300', 'Wey', 'Poer', 'Pao']
  },
  Audi: {
    logo: '/brands/audi.png',
    models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS6', 'R8']
  },
  MG: {
    logo: '/brands/mg.png',
    models: ['ZS', 'HS', 'RX5', 'MG3', 'MG5', 'MG6', 'Marvel R']
  },
  Subaru: {
    logo: '/brands/subaru.png',
    models: ['Forester', 'Outback', 'XV', 'Impreza', 'WRX', 'BRZ', 'Levorg', 'Ascent']
  },
  Isuzu: {
    logo: '/brands/isuzu.png',
    models: ['D-MAX', 'MU-X', 'Elf', 'Giga', 'NMR', 'NPR']
  },
  Peugeot: {
    logo: '/brands/peugeot.png',
    models: ['208', '308', '2008', '3008', '5008', '408', '508', 'Traveller']
  },
  Ferrari: {
    logo: '/brands/ferrari.png',
    models: ['Roma', 'Portofino', 'F8 Tributo', 'SF90 Stradale', '296 GTB', 'Purosangue', '488']
  },
}

// All 32 brands for display
const popularBrands = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Hyundai', 'Mitsubishi',
  'Suzuki', 'Daihatsu', 'Mazda', 'Lexus', 'Nissan', 'MINI',
  'Chery', 'Porsche', 'Land Rover', 'BYD', 'Jeep', 'Wuling',
  'GAC', 'Ford', 'KIA', 'Volkswagen', 'Geely', 'Chevrolet',
  'GWM', 'Audi', 'MG', 'Subaru', 'Isuzu', 'Peugeot', 'Ferrari'
]

interface CarBrandCategoriesProps {
  onBrandSelect?: (brand: string) => void
  onModelSelect?: (brand: string, model: string) => void
}

export function CarBrandCategories({
  onBrandSelect,
  onModelSelect,
}: CarBrandCategoriesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      checkScrollButtons()
      scrollContainer.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])

  const handleBrandClick = (brand: string) => {
    const newBrand = selectedBrand === brand ? null : brand
    setSelectedBrand(newBrand)
    onBrandSelect?.(brand)
  }

  const handleModelClick = (brand: string, model: string) => {
    onModelSelect?.(brand, model)
  }

  return (
    <section className="py-3 bg-background border-b">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Kategori Brand</h2>
          <Link 
            href="/kategori" 
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* Brand Categories Carousel */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full 
                bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700
                shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 
                flex items-center justify-center 
                opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full 
                bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700
                shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 
                flex items-center justify-center 
                opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Brand Circles Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth px-2"
          >
            {popularBrands.map((brand) => {
              const isSelected = selectedBrand === brand
              const brandInfo = brandData[brand]
              
              return (
                <button
                  key={brand}
                  onClick={() => handleBrandClick(brand)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                >
                  {/* Circular Logo Container */}
                  <div className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center",
                    "bg-white dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700",
                    "shadow-sm hover:shadow-lg",
                    "hover:scale-[1.08] hover:-translate-y-0.5",
                    "active:scale-[0.98]",
                    "transition-all duration-300",
                    isSelected && "ring-2 ring-purple-400 ring-offset-2"
                  )}>
                    {brandInfo?.logo && (
                      <Image
                        src={brandInfo.logo}
                        alt={`${brand} logo`}
                        width={50}
                        height={35}
                        className="w-[50px] sm:w-[56px] h-auto object-contain group-hover:scale-110 transition-transform"
                      />
                    )}
                  </div>
                  
                  {/* Brand Name */}
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-foreground 
                      group-hover:text-purple-600 dark:group-hover:text-purple-400 
                      transition-colors duration-300 whitespace-nowrap">
                      {brand}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {brandInfo?.models.length || 0} model
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sub-categories (Models) - Show when brand selected */}
        {selectedBrand && brandData[selectedBrand] && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                {brandData[selectedBrand]?.logo && (
                  <Image
                    src={brandData[selectedBrand]?.logo || ''}
                    alt={`${selectedBrand} logo`}
                    width={24}
                    height={16}
                    className="w-6 h-auto object-contain"
                  />
                )}
                Model {selectedBrand}
              </h3>
              <button
                onClick={() => setSelectedBrand(null)}
                className="p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {brandData[selectedBrand]?.models.map((model) => (
                <Link
                  key={model}
                  href={`/marketplace?brand=${selectedBrand.toLowerCase().replace(/\s+/g, '-')}&model=${model.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleModelClick(selectedBrand, model)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 
                    border border-purple-200 dark:border-purple-700
                    hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500
                    hover:text-white hover:border-transparent
                    transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  {model}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
