'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import {
  Sparkles,
  Clock,
  Eye,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Car,
  Shield,
  RefreshCw,
  Coins,
} from 'lucide-react'

interface Prediction {
  id: string
  brand: { name: string } | null
  model: { name: string } | null
  variant: { name: string } | null
  year: number
  predicted_price_min: number
  predicted_price_max: number
  confidence_score: number
  inspection_grade: string | null
  inspection_score: number | null
  status: string
  created_at: string
  expires_at: string | null
  listing_created: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatShortCurrency(amount: number) {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}Jt`
  }
  return formatCurrency(amount)
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const hoursLeft = prediction.expires_at
    ? Math.max(0, Math.ceil((new Date(prediction.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null

  const isExpired = hoursLeft !== null && hoursLeft <= 0
  const isSample = prediction.status === 'sample'
  const isCompleted = prediction.status === 'completed'

  return (
    <Card className={`overflow-hidden ${isExpired ? 'opacity-70' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Car placeholder image */}
          <div className="h-24 w-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Car className="h-10 w-10 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">
                  {prediction.brand?.name || 'Unknown'} {prediction.model?.name || ''} {prediction.year}
                </h3>
                {prediction.variant?.name && (
                  <p className="text-sm text-muted-foreground">{prediction.variant.name}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                {isSample && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Estimasi Dasar
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    <Shield className="h-3 w-3 mr-1" />
                    AI Analisis
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                {hoursLeft !== null && !isExpired && !isSample && (
                  <Badge variant="outline" className="text-amber-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {hoursLeft}h tersisa
                  </Badge>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Estimasi Harga:</p>
              <p className="text-lg font-bold text-primary">
                {formatShortCurrency(prediction.predicted_price_min)} - {formatShortCurrency(prediction.predicted_price_max)}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isSample ? 'bg-blue-500' : 'bg-emerald-500'}`}
                  style={{ width: `${prediction.confidence_score}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{prediction.confidence_score}% akurasi</span>
            </div>

            {/* Inspection Result */}
            {prediction.inspection_grade && (
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">
                  Inspeksi: Grade {prediction.inspection_grade} ({prediction.inspection_score}/100)
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {isSample ? (
                <>
                  <Link href={`/dashboard/listings/${prediction.id.replace('listing-', '')}/inspection`}>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      Inspeksi 160 Titik (GRATIS)
                    </Button>
                  </Link>
                  <Link href={`/listing/${prediction.id.replace('listing-', '')}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat Iklan
                    </Button>
                  </Link>
                </>
              ) : isExpired ? (
                <Link href="/prediction">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Prediksi Ulang (5 Token)
                  </Button>
                </Link>
              ) : prediction.listing_created ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Sudah dijadikan iklan</Badge>
                  <Link href={`/listing/${prediction.id.replace('listing-', '')}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href={`/dashboard/listings/create?prediction=${prediction.id}`}>
                    <Button size="sm">
                      <Car className="h-4 w-4 mr-1" />
                      Jadikan Iklan
                    </Button>
                  </Link>
                  <Link href={`/prediction/result/${prediction.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PredictionsPage() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [tokenBalance, setTokenBalance] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch predictions
        const predRes = await fetch('/api/my-predictions')
        const predData = await predRes.json()
        if (predData.success) {
          setPredictions(predData.predictions || [])
        }

        // Fetch token balance
        const tokenRes = await fetch('/api/user-tokens')
        const tokenData = await tokenRes.json()
        if (tokenData.success) {
          setTokenBalance(tokenData.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const hasInsufficientTokens = tokenBalance < 5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Prediction</h1>
          <p className="text-muted-foreground">Riwayat prediksi harga mobil Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{tokenBalance} Token</span>
          </div>
          <Link href="/prediction">
            <Button disabled={hasInsufficientTokens}>
              <Sparkles className="h-4 w-4 mr-2" />
              Prediksi Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Token Warning */}
      {hasInsufficientTokens && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-medium">Token tidak cukup</p>
              <p className="text-sm text-muted-foreground">Anda membutuhkan 5 token untuk melakukan prediksi</p>
            </div>
            <Link href="/dashboard/tokens">
              <Button variant="outline">Beli Token</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium">AI Price Prediction</p>
              <p className="text-sm text-muted-foreground">
                Prediksi harga mobil Anda menggunakan AI dengan akurasi tinggi. 
                Sertakan inspeksi 160 titik (GRATIS) untuk hasil yang lebih akurat.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  5 Token per prediksi
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Hasil tersimpan 24 jam
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Inspeksi GRATIS
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Belum ada prediksi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gunakan AI untuk memprediksi harga mobil Anda dengan akurat
            </p>
            <Link href="/prediction">
              <Button disabled={hasInsufficientTokens}>
                <Sparkles className="h-4 w-4 mr-2" />
                Mulai Prediksi
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
