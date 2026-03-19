'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  SuvIcon,
  MpvIcon,
  SedanIcon,
  HatchbackIcon,
  CoupeIcon,
  ConvertibleIcon,
  PickupIcon,
  VanIcon,
  ElectricIcon,
  TruckIcon,
  BusIcon,
} from '@/components/icons/BodyTypeIcons'

// Body type categories with SVG icons
const bodyTypes = [
  { id: '1', name: 'SUV', count: 1890, slug: 'suv', Icon: SuvIcon },
  { id: '2', name: 'MPV', count: 1450, slug: 'mpv', Icon: MpvIcon },
  { id: '3', name: 'Sedan', count: 1250, slug: 'sedan', Icon: SedanIcon },
  { id: '4', name: 'Hatchback', count: 420, slug: 'hatchback', Icon: HatchbackIcon },
  { id: '5', name: 'Pickup', count: 380, slug: 'pickup', Icon: PickupIcon },
  { id: '6', name: 'Van', count: 150, slug: 'van', Icon: VanIcon },
  { id: '7', name: 'Coupe', count: 95, slug: 'coupe', Icon: CoupeIcon },
  { id: '8', name: 'Electric', count: 220, slug: 'electric', Icon: ElectricIcon },
  { id: '9', name: 'Convertible', count: 45, slug: 'convertible', Icon: ConvertibleIcon },
  { id: '10', name: 'Truck', count: 85, slug: 'truck', Icon: TruckIcon },
  { id: '11', name: 'Bus', count: 35, slug: 'bus', Icon: BusIcon },
]

interface Category {
  id: string
  name: string
  count: number
  slug: string
  Icon: React.ComponentType<{ className?: string; size?: number }>
}

interface BodyTypeFilterProps {
  categories?: Category[]
}

// Gradient colors for body types
const bodyTypeGradients: Record<string, string> = {
  suv: 'from-emerald-500 via-teal-500 to-cyan-500',
  mpv: 'from-purple-500 via-pink-500 to-rose-500',
  sedan: 'from-blue-500 via-purple-500 to-purple-600',
  hatchback: 'from-cyan-500 via-blue-500 to-indigo-500',
  pickup: 'from-orange-500 via-red-500 to-pink-500',
  van: 'from-amber-500 via-orange-500 to-red-500',
  coupe: 'from-violet-500 via-purple-500 to-fuchsia-500',
  electric: 'from-green-500 via-emerald-500 to-teal-500',
  convertible: 'from-rose-500 via-pink-500 to-purple-500',
  truck: 'from-slate-500 via-gray-500 to-zinc-500',
  bus: 'from-sky-500 via-blue-500 to-indigo-500',
}

// Shadow colors based on gradient
const bodyTypeShadows: Record<string, string> = {
  suv: 'rgba(16,185,129,0.5)',
  mpv: 'rgba(236,72,153,0.5)',
  sedan: 'rgba(147,51,234,0.5)',
  hatchback: 'rgba(59,130,246,0.5)',
  pickup: 'rgba(239,68,68,0.5)',
  van: 'rgba(245,158,11,0.5)',
  coupe: 'rgba(168,85,247,0.5)',
  electric: 'rgba(16,185,129,0.5)',
  convertible: 'rgba(244,63,94,0.5)',
  truck: 'rgba(100,116,139,0.5)',
  bus: 'rgba(14,165,233,0.5)',
}

export function BodyTypeFilter({ categories }: BodyTypeFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const displayCategories = categories && categories.length > 0 ? categories : bodyTypes

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
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

  return (
    <section className="py-4 bg-background border-b">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">
            Cari Mobil Berdasarkan Tipe Bodi
          </h2>
          <Link 
            href="/kategori" 
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* Categories Carousel */}
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

          {/* Categories Container - Grid Style like mobil123 */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          >
            {displayCategories.map((category) => {
              const gradientClass = bodyTypeGradients[category.slug] || 'from-gray-500 via-gray-500 to-gray-600'
              const shadowColor = bodyTypeShadows[category.slug] || 'rgba(107,114,128,0.5)'
              const { Icon } = category
              
              return (
                <Link
                  key={category.id}
                  href={`/marketplace?body_type=${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  {/* Icon Container with clean background */}
                  <div className={cn(
                    "w-20 h-16 rounded-lg flex items-center justify-center",
                    "bg-gray-50 dark:bg-gray-800/50",
                    "border border-gray-200 dark:border-gray-700",
                    "hover:border-purple-300 dark:hover:border-purple-600",
                    "hover:bg-white dark:hover:bg-gray-800",
                    "shadow-sm hover:shadow-md",
                    "transition-all duration-300",
                    "group-hover:scale-105"
                  )}>
                    <Icon 
                      className={cn(
                        "text-gray-600 dark:text-gray-300",
                        "group-hover:text-purple-600 dark:group-hover:text-purple-400",
                        "transition-colors duration-300"
                      )} 
                      size={60} 
                    />
                  </div>
                  
                  {/* Category Name */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground 
                      group-hover:text-purple-600 dark:group-hover:text-purple-400 
                      transition-colors duration-300">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count.toLocaleString()}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
