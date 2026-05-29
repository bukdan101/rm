'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileCheck, Car, Calendar, Gauge, MapPin, Eye,
  Award, CheckCircle, AlertTriangle
} from 'lucide-react'

interface Inspection {
  id: string
  certificate_number: string
  inspection_score: number
  overall_grade: string
  passed_points: number
  failed_points: number
  accident_free: boolean
  flood_free: boolean
  fire_free: boolean
  recommended: boolean
  inspection_date: string
  certificate_expires_at: string
  car_listings: {
    id: string
    title: string
    year: number
    mileage: number
    city: string
    province: string
    brands: { name: string }
    car_models: { name: string }
    car_images: { image_url: string; is_primary: boolean }[]
  }
}

const gradeColors: Record<string, string> = {
  'A': 'bg-green-500 text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-yellow-500 text-white',
  'D': 'bg-red-500 text-white'
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    avgScore: 0
  })

  useEffect(() => {
    fetch('/api/inspections')
      .then(res => res.json())
      .then(data => {
        if (data.inspections) {
          setInspections(data.inspections)
          
          // Calculate stats
          const passed = data.inspections.filter((i: Inspection) => i.recommended).length
          const avgScore = Math.round(
            data.inspections.reduce((sum: number, i: Inspection) => sum + (i.inspection_score || 0), 0) / data.inspections.length
          )
          
          setStats({
            total: data.inspections.length,
            passed,
            avgScore
          })
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data inspeksi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" />
            Sertifikat Inspeksi
          </h1>
          <p className="text-muted-foreground mt-2">
            {stats.total} kendaraan telah diinspeksi dengan 160 item per kendaraan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Inspeksi</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                </div>
                <FileCheck className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Direkomendasikan</p>
                  <p className="text-4xl font-bold">{stats.passed}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Rata-rata Skor</p>
                  <p className="text-4xl font-bold">{stats.avgScore}%</p>
                </div>
                <Award className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inspection Cards */}
        <div className="grid gap-4">
          {inspections.map((inspection) => {
            const car = inspection.car_listings
            const primaryImage = car?.car_images?.find((img: any) => img.is_primary)?.image_url || car?.car_images?.[0]?.image_url
            
            return (
              <Card key={inspection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Car Image or Placeholder */}
                    <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                      {primaryImage ? (
                        <img 
                          src={primaryImage} 
                          alt={car?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{car?.title || `${car?.brands?.name} ${car?.car_models?.name}`}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {car?.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-4 w-4" />
                              {car?.mileage?.toLocaleString()} km
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {car?.city}, {car?.province}
                            </span>
                          </div>
                          
                          {/* Safety badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {inspection.accident_free && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Bebas Kecelakaan
                              </Badge>
                            )}
                            {inspection.flood_free && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Bebas Banjir
                              </Badge>
                            )}
                            {inspection.fire_free && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Bebas Kebakaran
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Grade & Score */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`w-14 h-14 rounded-full ${gradeColors[inspection.overall_grade] || 'bg-gray-500'} flex items-center justify-center`}>
                              <span className="text-2xl font-bold">{inspection.overall_grade}</span>
                            </div>
                            <p className="text-sm mt-1">{inspection.inspection_score}%</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">No. Sertifikat</p>
                            <p className="font-mono text-sm">{inspection.certificate_number}</p>
                            <Link href={`/certificate/${inspection.id}`}>
                              <Button size="sm" className="mt-2">
                                <Eye className="h-4 w-4 mr-1" />
                                Lihat Sertifikat
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Skor Inspeksi</span>
                          <span>{inspection.passed_points}/160 item lulus</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              inspection.inspection_score >= 80 ? 'bg-green-500' :
                              inspection.inspection_score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${inspection.inspection_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {inspections.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Belum Ada Inspeksi</h3>
              <p className="text-muted-foreground mt-2">
                Data inspeksi belum tersedia saat ini.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
