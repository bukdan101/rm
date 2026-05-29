'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'
import {
  Car,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  count: number
  slug: string
}

interface CategorySectionProps {
  categories?: Category[]
}

// Map emoji icons to Lucide icons
const categoryIcons: Record<string, LucideIcon> = {
  'sedan': Car,
  'suv': Car,
  'mpv': Car,
  'hatchback': Car,
  'pickup': Car,
  'van': Car,
  'coupe': Car,
  'convertible': Car,
  'electric': Car,
  'hybrid': Car,
}

// Default categories for car marketplace
const defaultCategories: Category[] = [
  { id: '1', name: 'Sedan', icon: '🚗', count: 1250, slug: 'sedan' },
  { id: '2', name: 'SUV', icon: '🚙', count: 890, slug: 'suv' },
  { id: '3', name: 'MPV', icon: '🚐', count: 650, slug: 'mpv' },
  { id: '4', name: 'Hatchback', icon: '🚘', count: 420, slug: 'hatchback' },
  { id: '5', name: 'Pickup', icon: '🛻', count: 380, slug: 'pickup' },
  { id: '6', name: 'Van', icon: '🚚', count: 150, slug: 'van' },
  { id: '7', name: 'Coupe', icon: '🏎️', count: 95, slug: 'coupe' },
  { id: '8', name: 'Convertible', icon: '🚖', count: 45, slug: 'convertible' },
  { id: '9', name: 'Electric', icon: '⚡', count: 220, slug: 'electric' },
  { id: '10', name: 'Hybrid', icon: '🔋', count: 180, slug: 'hybrid' },
]

export function CategorySection({ categories }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories

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
    <section className="py-4 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Kategori Mobil</h2>
          <Link 
            href="/kategori" 
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
          >
            Lihat Semua
            <span>→</span>
          </Link>
        </div>

        {/* Categories Carousel */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full 
                bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white 
                shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] 
                hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] 
                hover:scale-110 active:scale-95 
                flex items-center justify-center 
                opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full 
                bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white 
                shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] 
                hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] 
                hover:scale-110 active:scale-95 
                flex items-center justify-center 
                opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Categories Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          >
            {displayCategories.map((category, index) => {
              // Generate unique gradient for each category based on index
              const gradients = [
                'from-blue-500 via-purple-500 to-purple-600',
                'from-purple-500 via-pink-500 to-rose-500',
                'from-cyan-500 via-blue-500 to-indigo-500',
                'from-emerald-500 via-teal-500 to-cyan-500',
                'from-orange-500 via-red-500 to-pink-500',
                'from-violet-500 via-purple-500 to-fuchsia-500',
                'from-amber-500 via-orange-500 to-red-500',
                'from-teal-500 via-cyan-500 to-blue-500',
                'from-rose-500 via-pink-500 to-purple-500',
                'from-indigo-500 via-violet-500 to-purple-500',
              ]
              const gradientClass = gradients[index % gradients.length]
              
              // Shadow colors based on gradient
              const shadowColors = [
                'rgba(147,51,234,0.5)',
                'rgba(236,72,153,0.5)',
                'rgba(59,130,246,0.5)',
                'rgba(20,184,166,0.5)',
                'rgba(239,68,68,0.5)',
                'rgba(168,85,247,0.5)',
                'rgba(249,115,22,0.5)',
                'rgba(6,182,212,0.5)',
                'rgba(244,63,94,0.5)',
                'rgba(139,92,246,0.5)',
              ]
              const shadowColor = shadowColors[index % shadowColors.length]

              return (
                <Link
                  key={category.id}
                  href={`/marketplace?body_type=${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  {/* Icon Container with Gradient & Shimmer Effect */}
                  <div className={cn(
                    // Base styles
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center",
                    // Gradient background
                    "bg-gradient-to-r",
                    gradientClass,
                    // Shadow effects
                    "shadow-[0_4px_14px_0_var(--shadow-color)]",
                    // Hover effects
                    "hover:shadow-[0_8px_25px_var(--shadow-color)]",
                    "hover:scale-[1.08] hover:-translate-y-1",
                    "active:scale-[0.98] active:shadow-[0_2px_8px_var(--shadow-color)]",
                    // Shimmer effect
                    "relative overflow-hidden",
                    "before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
                    "before:-translate-x-full hover:before:translate-x-full",
                    "before:transition-transform before:duration-700 before:ease-in-out",
                    // Transition
                    "transition-all duration-300"
                  )}
                  style={{ 
                    '--shadow-color': shadowColor 
                  } as React.CSSProperties}
                  >
                    {/* Emoji Icon */}
                    <span className="text-2xl sm:text-3xl relative z-10 drop-shadow-sm">
                      {category.icon}
                    </span>
                  </div>
                  
                  {/* Category Name */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-semibold text-foreground 
                      group-hover:text-purple-600 dark:group-hover:text-purple-400 
                      transition-colors duration-300">
                      {category.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {category.count.toLocaleString()} unit
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
