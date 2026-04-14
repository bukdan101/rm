'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.', onRetry, className }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-12 px-4 text-center ${className ?? ''}`}>
      {/* Icon */}
      <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">Terjadi Kesalahan</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2 mt-2"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
