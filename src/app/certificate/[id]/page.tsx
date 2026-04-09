'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, XCircle, AlertTriangle, Shield, Car, Calendar, 
  MapPin, Gauge, Droplet, Cog, FileCheck, Download, Printer,
  Award, CheckSquare, XSquare
} from 'lucide-react'

interface InspectionData {
  inspection: any
  categories: any[]
  summary: {
    total_items: number
    passed: number
    failed: number
    score: number
    grade: string
  }
}

const gradeColors: Record<string, string> = {
  'A': 'bg-green-500 text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-yellow-500 text-white',
  'D': 'bg-red-500 text-white'
}

const gradeLabels: Record<string, string> = {
  'A': 'Sangat Baik',
  'B': 'Baik',
  'C': 'Cukup',
  'D': 'Perlu Perbaikan'
}

const categoryIcons: Record<string, any> = {
  'Engine': Cog,
  'Transmission': Cog,
  'Brake': Shield,
  'Suspension': Gauge,
  'Steering': Gauge,
  'Exterior': Car,
  'Interior': Car,
  'Electrical': Droplet,
  'Safety': Shield,
  'Wheels & Tires': Car,
  'Underbody': Car,
  'Body Structure': Car,
  'Features': CheckSquare,
  'Road Test': Gauge
}

export default function CertificatePage() {
  const params = useParams()
  const [data, setData] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const id = params.id || params.inspectionId

  useEffect(() => {
    if (!id) {
      return
    }

    fetch(`/api/inspections/${id}/certificate`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setData(data)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">ID Inspeksi Tidak Ditemukan</h2>
            <p className="text-muted-foreground">Silakan akses sertifikat melalui link yang valid</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat sertifikat...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sertifikat Tidak Ditemukan</h2>
            <p className="text-muted-foreground">{error || 'Data inspeksi tidak tersedia'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { inspection, categories, summary } = data
  const car = inspection.car_listings

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white p-4 md:p-8">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Kembali
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        {/* Certificate Header */}
        <Card className="mb-6 border-2 border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">SERTIFIKAT INSPEKSI</h1>
                  <p className="text-muted-foreground">AutoMarket Inspection Certificate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">No. Sertifikat</p>
                <p className="font-mono text-lg font-bold">{inspection.certificate_number}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Car Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kendaraan</p>
                    <p className="font-semibold text-lg">{car?.title || `${car?.brands?.name} ${car?.car_models?.name}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tahun</p>
                    <p className="font-semibold">{car?.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lokasi</p>
                    <p className="font-semibold">{car?.city}, {car?.province}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometer</p>
                    <p className="font-semibold">{car?.mileage?.toLocaleString()} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bahan Bakar</p>
                    <p className="font-semibold">{car?.fuel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cog className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transmisi</p>
                    <p className="font-semibold">{car?.transmission}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Grade */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-full ${gradeColors[summary.grade] || 'bg-gray-500'} flex items-center justify-center shadow-lg`}>
                    <div className="text-center">
                      <span className="text-4xl font-bold">{summary.grade}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Grade Kondisi</p>
                    <p className="text-2xl font-bold">{gradeLabels[summary.grade] || 'Tidak Dinilai'}</p>
                    <p className="text-muted-foreground mt-1">{summary.passed} dari {summary.total_items} item lulus</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{summary.score}%</div>
                  <p className="text-muted-foreground">Skor Keseluruhan</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress value={summary.score} className="h-3" />
              </div>
            </div>

            {/* Safety Checks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-3 rounded-lg text-center ${inspection.accident_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Shield className={`h-6 w-6 mx-auto mb-1 ${inspection.accident_free ? 'text-green-500' : 'text-red-500'}`} />
                <p className="text-xs text-muted-foreground">Bebas Kecelakaan</p>
                <p className={`font-semibold ${inspection.accident_free ? 'text-green-700' : 'text-red-700'}`}>
                  {inspection.accident_free ? 'YA' : 'TIDAK'}
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${inspection.flood_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Droplet className={`h-6 w-6 mx-auto mb-1 ${inspection.flood_free ? 'text-green-500' : 'text-red-500'}`} />
                <p className="text-xs text-muted-foreground">Bebas Banjir</p>
                <p className={`font-semibold ${inspection.flood_free ? 'text-green-700' : 'text-red-700'}`}>
                  {inspection.flood_free ? 'YA' : 'TIDAK'}
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${inspection.fire_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <AlertTriangle className={`h-6 w-6 mx-auto mb-1 ${inspection.fire_free ? 'text-green-500' : 'text-red-500'}`} />
                <p className="text-xs text-muted-foreground">Bebas Kebakaran</p>
                <p className={`font-semibold ${inspection.fire_free ? 'text-green-700' : 'text-red-700'}`}>
                  {inspection.fire_free ? 'YA' : 'TIDAK'}
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${!inspection.odometer_tampered ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Gauge className={`h-6 w-6 mx-auto mb-1 ${!inspection.odometer_tampered ? 'text-green-500' : 'text-red-500'}`} />
                <p className="text-xs text-muted-foreground">Odometer Asli</p>
                <p className={`font-semibold ${!inspection.odometer_tampered ? 'text-green-700' : 'text-red-700'}`}>
                  {!inspection.odometer_tampered ? 'YA' : 'TIDAK'}
                </p>
              </div>
            </div>

            {/* Certificate Validity */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground border-t pt-4">
              <div>
                <p>Tanggal Inspeksi: {new Date(inspection.inspection_date).toLocaleDateString('id-ID', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}</p>
              </div>
              <div className="text-right">
                <p>Berlaku hingga: {new Date(inspection.certificate_expires_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Detail Inspeksi ({summary.total_items} Item)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category: any) => {
                const Icon = categoryIcons[category.name] || CheckSquare
                const isExpanded = expandedCategory === category.id
                
                return (
                  <div key={category.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          category.score >= 80 ? 'bg-green-100 text-green-600' :
                          category.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.passed}/{category.items.length} item lulus
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            category.score >= 80 ? 'text-green-600' :
                            category.score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {category.score}%
                          </p>
                        </div>
                        <div className="w-24">
                          <Progress value={category.score} className="h-2" />
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        <div className="grid gap-2">
                          {category.items.map((item: any) => (
                            <div 
                              key={item.id} 
                              className={`flex items-center justify-between p-2 rounded ${
                                item.status === 'baik' ? 'bg-green-50' : 'bg-red-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {item.status === 'baik' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <div>
                                  <span className={item.is_critical ? 'font-semibold' : ''}>
                                    {item.name}
                                  </span>
                                  {item.is_critical && (
                                    <Badge variant="outline" className="ml-2 text-xs">Kritis</Badge>
                                  )}
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                              <Badge variant={item.status === 'baik' ? 'default' : 'destructive'}>
                                {item.status === 'baik' ? 'Baik' : 'Perlu Perbaikan'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className={`border-2 ${inspection.recommended ? 'border-green-500' : 'border-red-500'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {inspection.recommended ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-green-700">Kendaraan Direkomendasikan</h3>
                    <p className="text-muted-foreground">
                      Berdasarkan hasil inspeksi, kendaraan ini layak untuk dibeli
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-red-700">Perlu Pertimbangan</h3>
                    <p className="text-muted-foreground">
                      Kendaraan ini memiliki beberapa item yang memerlukan perbaikan
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground no-print">
          <p>Sertifikat ini diterbitkan oleh AutoMarket Inspection Service</p>
          <p className="mt-1">© {new Date().getFullYear()} AutoMarket - All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
