'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function CarCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden gap-0 p-0', className)}>
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />
      {/* Content skeleton */}
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex items-center gap-3 pt-2 border-t border-border/60">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </Card>
  )
}

export function ListingGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Image gallery skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-12 rounded-md shrink-0" />
          ))}
        </div>
      </div>

      {/* Title skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>

      {/* Specs grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Description skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* Features skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Seller skeleton */}
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function FilterSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6 p-4', className)}>
      {/* Search input */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Checkbox groups */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ))}

      {/* Price range */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
      </div>

      {/* Button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}
