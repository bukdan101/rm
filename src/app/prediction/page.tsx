'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PredictionRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard prediction
    router.replace('/dashboard/prediction')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-muted-foreground">Mengalihkan ke AI Prediction...</p>
      </div>
    </div>
  )
}
