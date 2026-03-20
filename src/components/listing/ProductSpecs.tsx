'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Car,
  Users,
  Palette,
  MapPin,
  Zap,
  FileText,
  Shield,
  CheckCircle
} from 'lucide-react'

interface ProductSpecsProps {
  condition: string
  priceType: string
  location: string
  viewCount: number
  createdAt: string
  isFeatured: boolean
  category: string
  // Car specific
  year?: number
  mileage?: number
  fuel?: string
  transmission?: string
  bodyType?: string
  seatCount?: number
  color?: string
  engineCapacity?: number
  // Features
  features?: Record<string, boolean>
  // Documents
  documents?: {
    license_plate?: string
    stnk_status?: string
    bpkb_status?: string
    sell_with_plate?: boolean
  }
}

const conditionConfig: Record<string, { label: string; color: string; description: string }> = {
  baru: { label: 'Baru', color: 'bg-emerald-500 text-white', description: 'Kendaraan baru, belum pernah dipakai' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500 text-white', description: 'Bekas tapi masih sangat bagus' },
  good: { label: 'Bagus', color: 'bg-amber-500 text-white', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  fair: { label: 'Cukup', color: 'bg-gray-500 text-white', description: 'Masih berfungsi dengan baik' },
  bekas: { label: 'Bekas', color: 'bg-amber-500 text-white', description: 'Kendaraan bekas' },
}

const fuelLabels: Record<string, string> = {
  bensin: 'Bensin',
  diesel: 'Diesel',
  electric: 'Listrik',
  hybrid: 'Hybrid',
  petrol_hybrid: 'Hybrid Bensin',
}

const transmissionLabels: Record<string, string> = {
  automatic: 'Otomatis',
  manual: 'Manual',
}

function formatMileage(km: number | null | undefined) {
  if (!km) return 'N/A'
  return new Intl.NumberFormat('id-ID').format(km) + ' km'
}

export function ProductSpecs({
  condition,
  priceType,
  location,
  viewCount,
  createdAt,
  isFeatured,
  category,
  year,
  mileage,
  fuel,
  transmission,
  bodyType,
  seatCount,
  color,
  engineCapacity,
  features,
  documents,
}: ProductSpecsProps) {
  const conditionData = conditionConfig[condition] || conditionConfig.good

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Main Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="flex flex-col items-center p-4 rounded-xl bg-background/80 shadow-sm hover:shadow-md transition-shadow">
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Tahun</span>
            <span className="font-bold text-lg">{year || '-'}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-background/80 shadow-sm hover:shadow-md transition-shadow">
            <Gauge className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Kilometer</span>
            <span className="font-bold">{formatMileage(mileage)}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-background/80 shadow-sm hover:shadow-md transition-shadow">
            <Fuel className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Bahan Bakar</span>
            <span className="font-bold text-sm">{fuelLabels[fuel || ''] || fuel || '-'}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-background/80 shadow-sm hover:shadow-md transition-shadow">
            <Cog className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Transmisi</span>
            <span className="font-bold text-sm">{transmissionLabels[transmission || ''] || transmission || '-'}</span>
          </div>
        </div>

        {/* Additional Specs */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tipe:</span>
              <span className="font-medium">{bodyType || '-'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kursi:</span>
              <span className="font-medium">{seatCount || '-'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Warna:</span>
              <span className="font-medium">{color || '-'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lokasi:</span>
              <span className="font-medium">{location}</span>
            </div>
          </div>

          {/* Engine Capacity */}
          {engineCapacity && (
            <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kapasitas Mesin:</span>
              <span className="font-medium">{engineCapacity} cc</span>
            </div>
          )}

          {/* Condition Badge */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <span className="text-sm text-muted-foreground">Kondisi: </span>
              <Badge className={conditionData.color}>{conditionData.label}</Badge>
              <p className="text-xs text-muted-foreground mt-1">{conditionData.description}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        {features && Object.values(features).some(v => v === true) && (
          <div className="p-6 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Fitur Utama
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {features.sunroof && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Sunroof</span>
                </div>
              )}
              {features.cruise_control && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cruise Control</span>
                </div>
              )}
              {features.rear_camera && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Kamera Mundur</span>
                </div>
              )}
              {features.keyless_start && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Keyless Start</span>
                </div>
              )}
              {features.service_book && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Buku Servis</span>
                </div>
              )}
              {features.airbag && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Airbag</span>
                </div>
              )}
              {features.abs && (
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>ABS</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents && (
          <div className="p-6 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Dokumen Kendaraan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">Nomor Polisi:</span>
                  <p className="font-medium text-sm">{documents.license_plate || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">STNK:</span>
                  <p className="font-medium text-sm">{documents.stnk_status || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">BPKB:</span>
                  <p className="font-medium text-sm">{documents.bpkb_status || '-'}</p>
                </div>
              </div>
            </div>
            {documents.sell_with_plate && (
              <Badge variant="outline" className="mt-2">Jual Bersama Polisi</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
