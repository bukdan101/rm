'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Star, Quote, MapPin, Calendar } from 'lucide-react'

interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  comment: string
  carModel: string
  date: string
  location: string
}

interface TestimonialCardProps {
  review: Review
  className?: string
}

export function TestimonialCard({ review, className }: TestimonialCardProps) {
  return (
    <Card className={cn('overflow-hidden gap-0 p-0', className)}>
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Quote Icon */}
        <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
          <Quote className="size-5 text-muted-foreground" />
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'size-4',
                i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Comment */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Author & Meta */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Image
            src={review.avatar || '/placeholder-avatar.png'}
            alt={review.author}
            width={40}
            height={40}
            className="rounded-full object-cover border bg-muted shrink-0"
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{review.author}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{review.carModel}</span>
              <span className="text-border hidden sm:inline">·</span>
              <span className="hidden sm:inline">{review.date}</span>
              <span className="text-border hidden sm:inline">·</span>
              <span className="hidden sm:flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="truncate">{review.location}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
