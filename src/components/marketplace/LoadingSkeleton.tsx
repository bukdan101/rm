'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function CarCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('group overflow-hidden rounded-xl border bg-card', className)}>
      <div className="relative aspect-[16/11]">
        <Skeleton className="h-full w-full" />
        {/* Price badge placeholder */}
        <Skeleton className="absolute bottom-2 left-2 h-7 w-28 rounded-md" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

export function SectionTitleSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-5 w-24" />
    </div>
  )
}

export function CarGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[400px] md:h-[480px] lg:h-[520px] overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  )
}

export function CategoryPillsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
      ))}
    </div>
  )
}

export function BrandGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function FeatureCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-xl border">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export function TokenPackagesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6 text-center space-y-3">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-10 w-20 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex gap-6">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <HeroSkeleton />

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        <SectionTitleSkeleton />
        <CarGridSkeleton />
        <SectionTitleSkeleton />
        <CarGridSkeleton />
      </div>

      {/* Footer Skeleton */}
      <div className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}
