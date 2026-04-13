'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  message = 'Maaf, sesuatu yang tidak terduga terjadi. Silakan coba lagi.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className ?? ''}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
