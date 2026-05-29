'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AdBannerProps {
  position: 'home-center' | 'home-center-sidebar' | 'home-inline' | 'home-inline-sidebar' | 'marketplace-top' | 'marketplace-top-sidebar' | 'marketplace-inline' | 'marketplace-inline-sidebar' | 'listing-top' | 'listing-top-sidebar' | 'listing-bottom' | 'listing-bottom-sidebar' | 'dashboard-top' | 'dashboard-top-sidebar' | 'dealer-top' | 'dealer-top-sidebar'
  showPlaceholder?: boolean
  className?: string
}

// Ad sizes configuration
const adSizes = {
  'home-center': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'home-center-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'home-inline': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'home-inline-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'marketplace-top': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'marketplace-top-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'marketplace-inline': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'marketplace-inline-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'listing-top': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'listing-top-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'listing-bottom': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'listing-bottom-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'dashboard-top': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'dashboard-top-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
  'dealer-top': { width: 800, height: 150, label: 'Landscape (800x150)' },
  'dealer-top-sidebar': { width: 400, height: 150, label: 'Sidebar (400x150)' },
}

// Placeholder image path
const PLACEHOLDER_IMAGE = '/ads/ad-image.png'

// Single Banner Component - FULL WIDTH, NO ROUNDED
export function AdBanner({ position, showPlaceholder = true, className }: AdBannerProps) {
  if (!showPlaceholder) {
    return null
  }

  const isSidebar = position.includes('sidebar')

  return (
    <div 
      className={cn(
        'relative w-full overflow-hidden',
        isSidebar ? 'h-[150px]' : 'h-[150px]',
        className
      )}
    >
      <Link 
        href="#"
        className="block w-full h-full relative"
      >
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="Advertisement"
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority
          sizes={isSidebar ? '400px' : '800px'}
        />
      </Link>
    </div>
  )
}

// DoubleAdBanner - 2/3 Landscape + 1/3 Sidebar (FULL WIDTH, NO ROUNDED)
export function DoubleAdBanner({ 
  position = 'home-top',
  showPlaceholder = true 
}: { 
  position?: string
  showPlaceholder?: boolean 
}) {
  if (!showPlaceholder) return null
  
  return (
    <div className="w-full h-[150px]">
      <div className="flex w-full h-full">
        {/* Landscape Banner - 2/3 width */}
        <div className="w-2/3 h-full relative overflow-hidden">
          <Link href="#" className="block w-full h-full relative">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt="Advertisement"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
              sizes="800px"
            />
          </Link>
        </div>
        
        {/* Sidebar Banner - 1/3 width */}
        <div className="w-1/3 h-full relative overflow-hidden">
          <Link href="#" className="block w-full h-full relative">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt="Advertisement"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
              sizes="400px"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

// FullWidthBanner - single full width banner (NO ROUNDED)
export function FullWidthBanner({ 
  position = 'home-top',
  showPlaceholder = true 
}: { 
  position?: string
  showPlaceholder?: boolean 
}) {
  if (!showPlaceholder) return null
  
  return (
    <div className="w-full h-[150px] relative overflow-hidden">
      <Link href="#" className="block w-full h-full relative">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="Advertisement"
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority
          sizes="100vw"
        />
      </Link>
    </div>
  )
}

// SidebarAdBanner - for sidebar areas (NO ROUNDED)
export function SidebarAdBanner({ 
  position = 'marketplace-inline-sidebar',
  className 
}: { 
  position?: string
  className?: string 
}) {
  return (
    <div className={cn('relative h-[150px] w-full overflow-hidden', className)}>
      <Link href="#" className="block w-full h-full relative">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="Advertisement"
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority
          sizes="400px"
        />
      </Link>
    </div>
  )
}

// SquareAdBanner - for inline areas (NO ROUNDED)
export function SquareAdBanner({ 
  position = 'marketplace-inline',
  className 
}: { 
  position?: string
  className?: string 
}) {
  return (
    <div className={cn('relative h-[150px] w-full overflow-hidden', className)}>
      <Link href="#" className="block w-full h-full relative">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="Advertisement"
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority
          sizes="800px"
        />
      </Link>
    </div>
  )
}

// Export position config for admin use
export const POSITION_CONFIG = {
  'home-top': { label: 'Home Top (Landscape)', dimensions: '800x150', type: 'landscape' },
  'home-top-sidebar': { label: 'Home Top Sidebar', dimensions: '400x150', type: 'sidebar' },
  'home-inline': { label: 'Home Inline (Landscape)', dimensions: '800x150', type: 'landscape' },
  'home-inline-sidebar': { label: 'Home Inline Sidebar', dimensions: '400x150', type: 'sidebar' },
  'marketplace-top': { label: 'Marketplace Top (Landscape)', dimensions: '800x150', type: 'landscape' },
  'marketplace-top-sidebar': { label: 'Marketplace Top Sidebar', dimensions: '400x150', type: 'sidebar' },
  'marketplace-inline': { label: 'Marketplace Inline (Landscape)', dimensions: '800x150', type: 'landscape' },
  'marketplace-inline-sidebar': { label: 'Marketplace Inline Sidebar', dimensions: '400x150', type: 'sidebar' },
  'listing-top': { label: 'Listing Top (Landscape)', dimensions: '800x150', type: 'landscape' },
  'listing-top-sidebar': { label: 'Listing Top Sidebar', dimensions: '400x150', type: 'sidebar' },
  'listing-bottom': { label: 'Listing Bottom (Landscape)', dimensions: '800x150', type: 'landscape' },
  'listing-bottom-sidebar': { label: 'Listing Bottom Sidebar', dimensions: '400x150', type: 'sidebar' },
  'dashboard-top': { label: 'Dashboard Top (Landscape)', dimensions: '800x150', type: 'landscape' },
  'dashboard-top-sidebar': { label: 'Dashboard Top Sidebar', dimensions: '400x150', type: 'sidebar' },
  'dealer-top': { label: 'Dealer Top (Landscape)', dimensions: '800x150', type: 'landscape' },
  'dealer-top-sidebar': { label: 'Dealer Top Sidebar', dimensions: '400x150', type: 'sidebar' },
} as const
