'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  count: number
}

interface CategoryCardProps {
  category: Category
  onClick?: (category: Category) => void
  selected?: boolean
  className?: string
}

const categoryGradients: Record<string, string> = {
  SUV: 'from-amber-500/10 to-amber-600/5',
  MPV: 'from-emerald-500/10 to-emerald-600/5',
  Sedan: 'from-sky-500/10 to-sky-600/5',
  Hatchback: 'from-rose-500/10 to-rose-600/5',
  Pickup: 'from-orange-500/10 to-orange-600/5',
  Sport: 'from-red-500/10 to-red-600/5',
}

const categoryIconGradients: Record<string, string> = {
  SUV: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  MPV: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  Sedan: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  Hatchback: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  Pickup: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  Sport: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
}

export function CategoryCard({ category, onClick, selected, className }: CategoryCardProps) {
  const gradientClasses = categoryGradients[category.name] || 'from-primary/10 to-primary/5'
  const iconClasses = categoryIconGradients[category.name] || 'bg-primary/10 text-primary'

  return (
    <button
      onClick={() => onClick?.(category)}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-b p-4 sm:p-6 transition-all duration-200 hover:shadow-md cursor-pointer text-center',
        gradientClasses,
        selected && 'ring-2 ring-primary shadow-md',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center size-14 sm:size-16 rounded-2xl transition-transform duration-200 group-hover:scale-110',
          iconClasses
        )}
      >
        <span className="text-3xl sm:text-4xl" role="img" aria-label={category.name}>
          {category.icon}
        </span>
      </div>

      {/* Name */}
      <span className="text-sm font-semibold text-foreground leading-tight">{category.name}</span>

      {/* Count Badge */}
      <Badge variant="secondary" className="text-[10px] px-2 py-0">
        {category.count} mobil
      </Badge>
    </button>
  )
}
