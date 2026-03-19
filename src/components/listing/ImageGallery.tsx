'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ImageOff,
  Sparkles
} from 'lucide-react'

interface ListingImage {
  id: string
  image_url: string
  is_primary: boolean
  display_order: number
}

interface ImageGalleryProps {
  images: ListingImage[]
  title: string
  isPremium?: boolean
}

export function ImageGallery({ images, title, isPremium }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  // Sort images by display_order
  const sortedImages = [...(images || [])].sort((a, b) => a.display_order - b.display_order)
  
  // Get primary image or first image
  const primaryImage = sortedImages.find(img => img.is_primary) || sortedImages[0]
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0))
  }

  const currentImage = sortedImages[currentIndex]

  // If no images
  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="relative aspect-[16/10] bg-muted rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-16 w-16 mb-2 opacity-50" />
          <p className="text-sm">Tidak ada gambar</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative aspect-[16/10] bg-muted rounded-xl overflow-hidden group">
        {/* Main Image */}
        <Image
          src={currentImage?.image_url || '/placeholder-car.jpg'}
          alt={`${title} - Gambar ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500"
          priority
          onError={() => setImageError(currentImage?.id || 'error')}
        />

        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 z-10">
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            {currentIndex + 1} / {sortedImages.length}
          </Badge>
        </div>

        {/* Zoom Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsZoomed(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                currentIndex === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                className="object-cover"
              />
              {img.is_primary && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">
                  Utama
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={currentImage?.image_url || '/placeholder-car.jpg'}
              alt={title}
              fill
              className="object-contain"
            />
            
            {/* Navigation in zoom mode */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Counter in zoom mode */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                {currentIndex + 1} / {sortedImages.length}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
