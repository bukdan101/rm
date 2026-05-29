'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import {
  FileCheck, Gauge, Shield, CheckCircle2, AlertTriangle, 
  Download, Share2, ArrowLeft, Loader2, Star, MapPin,
  Calendar, Clock, Car, Wrench, Zap, Circle
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  'istimewa': 'bg-green-500',
  'baik': 'bg-blue-500',
  'sedang': 'bg-yellow-500',
  'perlu_perbaikan': 'bg-red-500',
}

const CATEGORY_ICONS: Record<string, typeof Car> = {
  'Engine': Wrench,
  'Transmission': Gauge,
  'Brake': Shield,
  'Suspension': Car,
  'Steering': Car,
  'Exterior': Car,
  'Interior': Car,
  'Electrical': Zap,
  'Safety': Shield,
  'Wheels': Car,
  'Underbody': Car,
  'Body': Car,
  'Features': Star,
  'Road Test': Gauge,
}

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [inspection, setInspection] = useState<Record<string, unknown> | null>(null)
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [buyingCertificate, setBuyingCertificate] = useState(false)

  useEffect(() => {
    fetchInspection()
  }, [params.id])

  const fetchInspection = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inspections?car_listing_id=${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setInspection(data.data)
        setResults(data.data?.results || [])
      }
    } catch (error) {
      console.error('Error fetching inspection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCertificate = async () => {
    setBuyingCertificate(true)
    try {
      const res = await fetch('/api/inspections/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection_id: inspection?.id,
          user_id: 'current-user',
          car_listing_id: inspection?.car_listing_id
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Deduct tokens and confirm payment
        await fetch('/api/inspections/certificate', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchase_id: data.data.purchase.id,
            inspection_id: inspection?.id
          })
        })
        
        // Refresh inspection data
        fetchInspection()
      }
    } catch (error) {
      console.error('Error buying certificate:', error)
    } finally {
      setBuyingCertificate(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-500 text-white'
      case 'B+':
      case 'B': return 'bg-blue-500 text-white'
      case 'C': return 'bg-yellow-500 text-white'
      default: return 'bg-red-500 text-white'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      default: return 'bg-red-100 text-red-700'
    }
  }

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    const item = result.item as Record<string, unknown>
    const category = (item?.category as string) || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(result)
    return acc
  }, {} as Record<string, Record<string, unknown>[]>)

  // Calculate stats
  const stats = {
    total: results.length,
    istimewa: results.filter(r => r.status === 'istimewa').length,
    baik: results.filter(r => r.status === 'baik').length,
    sedang: results.filter(r => r.status === 'sedang').length,
    perlu_perbaikan: results.filter(r => r.status === 'perlu_perbaikan').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail inspeksi...</p>
        </div>
      </div>
    )
  }

  if (!inspection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Inspeksi tidak ditemukan</h2>
          <p className="text-muted-foreground mb-4">
            Data inspeksi yang Anda cari tidak tersedia
          </p>
          <Button asChild>
            <Link href="/dashboard/inspeksi">Kembali ke Daftar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Inspeksi</h1>
            <p className="text-muted-foreground">
              ID: {inspection.id?.toString().slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Bagikan
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className={cn("text-2xl px-4 py-2", getGradeColor(inspection.overall_grade as string))}>
                {inspection.overall_grade as string}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Grade Keseluruhan</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {inspection.inspection_score as number}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Skor Inspeksi</p>
              <Progress value={inspection.inspection_score as number} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className={cn("text-lg px-4 py-1", getRiskColor(inspection.risk_level as string))}>
                Risiko: {(inspection.risk_level as string)?.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Tingkat Risiko</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {inspection.has_certificate ? (
                <div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-600">Tersertifikasi</p>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Beli Sertifikat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Beli Sertifikat Inspeksi</DialogTitle>
                      <DialogDescription>
                        Tingkatkan kepercayaan pembeli dengan sertifikat resmi
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span>Biaya Sertifikat</span>
                        <span className="font-bold">25 Token</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sertifikat valid selama 90 hari. Berisi detail inspeksi lengkap, skor, dan QR code verifikasi.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Batal</Button>
                      <Button onClick={handleBuyCertificate} disabled={buyingCertificate}>
                        {buyingCertificate ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileCheck className="h-4 w-4 mr-2" />
                        )}
                        Konfirmasi
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Price Analysis */}
      {(inspection.ai_price_min || inspection.ai_price_recommended) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Estimasi Harga AI
            </CardTitle>
            <CardDescription>
              Berdasarkan kondisi kendaraan dan data pasar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Harga Minimum</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency((inspection.ai_price_min as number) || 0)}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
                <div className="text-sm text-muted-foreground mb-1">Harga Rekomendasi</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((inspection.ai_price_recommended as number) || 0)}
                </div>
                <Badge className="mt-2 bg-green-500">Optimal</Badge>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Harga Maksimum</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency((inspection.ai_price_max as number) || 0)}
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Margin Estimasi</span>
                <span className="font-bold text-green-600">
                  {inspection.ai_profit_margin as number}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Permintaan Pasar</span>
                <Badge variant="outline">
                  {(inspection.ai_demand_level as string)?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Estimasi Hari Terjual</span>
                <span className="font-bold">
                  {inspection.days_to_sell_estimate as number} hari
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pemeriksaan Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className={cn(
              "p-4 rounded-lg border",
              inspection.accident_free ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2">
                {inspection.accident_free ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {inspection.accident_free ? "Bebas Kecelakaan" : "Pernah Kecelakaan"}
                </span>
              </div>
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              inspection.flood_free ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2">
                {inspection.flood_free ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {inspection.flood_free ? "Bebas Banjir" : "Pernah Terendam"}
                </span>
              </div>
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              inspection.fire_free ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2">
                {inspection.fire_free ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {inspection.fire_free ? "Bebas Kebakaran" : "Pernah Terbakar"}
                </span>
              </div>
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              !inspection.odometer_tampered ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2">
                {!inspection.odometer_tampered ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {!inspection.odometer_tampered ? "Odometer Original" : "Odometer Dimanipulasi"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Inspeksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Item</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.istimewa}</div>
              <div className="text-sm text-muted-foreground">Istimewa</div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.istimewa / stats.total) * 100}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.baik}</div>
              <div className="text-sm text-muted-foreground">Baik</div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.baik / stats.total) * 100}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.sedang}</div>
              <div className="text-sm text-muted-foreground">Sedang</div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.sedang / stats.total) * 100}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.perlu_perbaikan}</div>
              <div className="text-sm text-muted-foreground">Perlu Perbaikan</div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.perlu_perbaikan / stats.total) * 100}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Inspeksi per Kategori</CardTitle>
          <CardDescription>
            {Object.keys(groupedResults).length} kategori diperiksa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(groupedResults)[0]}>
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start mb-4">
                {Object.entries(groupedResults).map(([category, items]) => {
                  const Icon = CATEGORY_ICONS[category] || Car
                  const categoryScore = items.filter(i => i.status === 'baik' || i.status === 'istimewa').length / items.length * 100
                  return (
                    <TabsTrigger key={category} value={category} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {category}
                      <Badge variant="outline" className="ml-1">
                        {Math.round(categoryScore)}%
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </ScrollArea>

            {Object.entries(groupedResults).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-2">
                  {items.map((result, idx) => {
                    const item = result.item as Record<string, unknown>
                    return (
                      <div 
                        key={result.id as string}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          idx % 2 === 0 ? "bg-muted/50" : "bg-background"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            STATUS_COLORS[result.status as string]
                          )} />
                          <div>
                            <div className="font-medium">{item?.name as string}</div>
                            <div className="text-sm text-muted-foreground">
                              {item?.description as string}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {result.status as string}
                          </Badge>
                          {result.notes && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {result.notes as string}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Diperiksa pada: {format(new Date(inspection.inspection_date as string || inspection.created_at as string), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{inspection.inspection_place as string || 'Self Assessment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Tipe: {(inspection.inspection_type as string) === 'self' ? 'Inspeksi Mandiri' : 'Inspeksi Profesional'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
