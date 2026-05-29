'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-sm' },
    md: { icon: 'h-8 w-8', text: 'text-lg' },
    lg: { icon: 'h-10 w-10', text: 'text-xl' },
  }

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center',
          sizes[size].icon
        )}
      >
        <span className="text-white font-bold text-xs">AM</span>
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 bg-clip-text text-transparent',
            sizes[size].text
          )}
        >
          AutoMarket
        </span>
      )}
    </Link>
  )
}
