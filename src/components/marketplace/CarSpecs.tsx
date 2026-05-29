'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CarListing } from '@/types/marketplace'
import { formatPrice, formatMileage, getFuelLabel, getTransmissionLabel, timeAgo } from '@/lib/utils-marketplace'
import { cn } from '@/lib/utils'
import {
  Car,
  Calendar,
  Fuel,
  Settings,
  Gauge,
  Engine,
  Users,
  Palette,
  CreditCard,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Eye,
  Clock,
  Star,
  User,
  Building2,
  Phone,
  Award,
  Sparkles,
  Zap,
  FileCheck,
  ClipboardCheck,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CarSpecsProps {
  listing: CarListing
  className?: string
}

// Condition config with gradient badges
const conditionConfig: Record<string, { 
  label: string; 
  variant: 'success' | 'info' | 'warning' | 'secondary';
  description: string 
}> = {
  baru: { label: 'Baru', variant: 'success', description: 'Kendaraan baru, belum pernah dipakai' },
  istimewa: { label: 'Istimewa', variant: 'info', description: 'Kondisi sangat baik, seperti baru' },
  bekas: { label: 'Bekas', variant: 'warning', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  sedang: { label: 'Sedang', variant: 'secondary', description: 'Masih berfungsi dengan baik' },
}

// Grade config
const gradeConfig: Record<string, { color: string; label: string }> = {
  'A+': { color: 'from-emerald-500 to-green-500', label: 'Sangat Baik' },
  'A': { color: 'from-green-500 to-teal-500', label: 'Baik' },
  'B+': { color: 'from-blue-500 to-cyan-500', label: 'Cukup Baik' },
  'B': { color: 'from-cyan-500 to-sky-500', label: 'Normal' },
  'C': { color: 'from-amber-500 to-yellow-500', label: 'Perlu Perhatian' },
  'D': { color: 'from-orange-500 to-red-500', label: 'Perlu Perbaikan' },
  'E': { color: 'from-red-500 to-rose-500', label: 'Tidak Disarankan' },
}

// Document status
const documentTypes = [
  { type: 'stnk', label: 'STNK', icon: FileText },
  { type: 'bpkb', label: 'BPKB', icon: FileCheck },
  { type: 'faktur', label: 'Faktur', icon: ClipboardCheck },
  { type: 'manual', label: 'Buku Manual', icon: FileText },
  { type: 'service_book', label: 'Buku Servis', icon: FileText },
]

export function CarSpecs({ listing, className }: CarSpecsProps) {
  const conditionData = conditionConfig[listing.condition || 'sedang']
  const gradeData = listing.inspection?.overall_grade 
    ? gradeConfig[listing.inspection.overall_grade] 
    : null

  // Check if featured
  const isFeatured = listing.featured_until && new Date(listing.featured_until) > new Date()

  // Build location string
  const location = [listing.city, listing.province].filter(Boolean).join(', ') || 'Tidak disebutkan'

  return (
    <div className={cn("space-y-4", className)}>
      {/* ==================== MAIN SPECS ==================== */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-purple-600" />
            Spesifikasi Kendaraan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Basic Specs Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Condition */}
            <SpecItem
              icon={Sparkles}
              label="Kondisi"
              content={
                <Badge variant={conditionData.variant} className="shadow-md">
                  {conditionData.label}
                </Badge>
              }
              description={conditionData.description}
            />

            {/* Year */}
            <SpecItem
              icon={Calendar}
              label="Tahun"
              content={<span className="font-bold text-lg">{listing.year || '-'}</span>}
            />

            {/* Fuel */}
            <SpecItem
              icon={Fuel}
              label="Bahan Bakar"
              content={<span className="font-semibold">{getFuelLabel(listing.fuel)}</span>}
            />

            {/* Transmission */}
            <SpecItem
              icon={Settings}
              label="Transmisi"
              content={<span className="font-semibold">{getTransmissionLabel(listing.transmission)}</span>}
            />

            {/* Mileage */}
            <SpecItem
              icon={Gauge}
              label="Jarak Tempuh"
              content={<span className="font-semibold">{formatMileage(listing.mileage)}</span>}
            />

            {/* Engine Capacity */}
            <SpecItem
              icon={Engine}
              label="Kapasitas Mesin"
              content={<span className="font-semibold">{listing.engine_capacity ? `${listing.engine_capacity.toLocaleString()} cc` : '-'}</span>}
            />

            {/* Seat Count */}
            <SpecItem
              icon={Users}
              label="Jumlah Kursi"
              content={<span className="font-semibold">{listing.seat_count ? `${listing.seat_count} Penumpang` : '-'}</span>}
            />

            {/* Body Type */}
            <SpecItem
              icon={Car}
              label="Tipe Bodhi"
              content={<span className="font-semibold capitalize">{listing.body_type || '-'}</span>}
            />
          </div>

          {/* Divider */}
          <div className="border-t pt-3 mt-3" />

          {/* Extended Specs - Full Width */}
          <div className="grid grid-cols-1 gap-3">
            {/* Colors Row */}
            <div className="flex gap-3">
              {/* Exterior Color */}
              <div className="flex-1 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Palette className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Warna Eksterior</p>
                    <p className="font-semibold">{listing.exterior_color?.name || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Interior Color */}
              <div className="flex-1 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Palette className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Warna Interior</p>
                    <p className="font-semibold">{listing.interior_color?.name || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plate Number */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Polisi</p>
                    <p className="font-bold text-lg tracking-wider">{listing.plate_number || '-'}</p>
                  </div>
                </div>
                {listing.plate_number && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Terdaftar
                  </Badge>
                )}
              </div>
            </div>

            {/* VIN Number */}
            {listing.vin_number && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <FileText className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Rangka (VIN)</p>
                    <p className="font-mono font-semibold">{listing.vin_number}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ==================== PRICE INFO ==================== */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Informasi Harga
            </h3>
            <Badge 
              variant={listing.price_negotiable ? "warning" : "info"}
              className="shadow-md"
            >
              {listing.price_negotiable ? 'Bisa Nego' : 'Harga Pas'}
            </Badge>
          </div>

          {/* Cash Price */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 mb-3">
            <p className="text-sm text-muted-foreground mb-1">Harga Tunai</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {formatPrice(listing.price_cash)}
            </p>
          </div>

          {/* Credit Price */}
          {listing.price_credit && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <p className="text-sm text-muted-foreground mb-1">Harga Kredit</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatPrice(listing.price_credit)}
              </p>
              <p className="text-xs text-emerald-600/70 mt-1">*Cicilan mulai dari {formatPrice(Math.ceil((listing.price_credit || 0) / 60))}/bulan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== DOCUMENTS STATUS ==================== */}
      {listing.documents && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-green-600" />
              Kelengkapan Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentTypes.map(({ type, label, icon: Icon }) => {
                const doc = listing.documents as Record<string, unknown>
                const docData = doc as Record<string, { document_number?: string; verified?: boolean }>
                const hasDoc = docData?.[type]
                const isVerified = hasDoc && (docData[type] as { verified?: boolean })?.verified

                return (
                  <div 
                    key={type}
                    className={cn(
                      "p-3 rounded-xl flex items-center gap-2 transition-all",
                      hasDoc 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30" 
                        : "bg-gray-100 dark:bg-gray-800/50"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      hasDoc ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-200 dark:bg-gray-700"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        hasDoc ? "text-green-600" : "text-gray-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{label}</p>
                      {hasDoc && (
                        <p className="text-[10px] text-green-600 flex items-center gap-0.5">
                          {isVerified ? (
                            <>
                              <CheckCircle className="h-2.5 w-2.5" />
                              Terverifikasi
                            </>
                          ) : (
                            'Tersedia'
                          )}
                        </p>
                      )}
                    </div>
                    {hasDoc && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== INSPECTION STATUS ==================== */}
      {listing.inspection && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-emerald-600" />
              Status Inspeksi 160 Titik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Grade Badge */}
            {gradeData && (
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r",
                    gradeData.color,
                    "text-white font-bold text-xl shadow-lg"
                  )}>
                    {listing.inspection?.overall_grade}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Grade {listing.inspection?.overall_grade}</p>
                    <p className="text-sm text-muted-foreground">{gradeData.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {listing.inspection?.inspection_score || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Skor Inspeksi</p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600">{listing.inspection?.passed_points || 0}</p>
                <p className="text-xs text-green-600">Lolos</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                <p className="text-2xl font-bold text-red-600">{listing.inspection?.failed_points || 0}</p>
                <p className="text-xs text-red-600">Perlu Perbaikan</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <p className="text-2xl font-bold text-blue-600">{listing.inspection?.total_points || 160}</p>
                <p className="text-xs text-blue-600">Total Titik</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
                <p className="text-2xl font-bold text-purple-600 capitalize">{listing.inspection?.risk_level || 'low'}</p>
                <p className="text-xs text-purple-600">Risk Level</p>
              </div>
            </div>

            {/* Safety Checks */}
            <div className="grid grid-cols-2 gap-2">
              <SafetyCheck 
                label="Bebas Kecelakaan" 
                checked={listing.inspection?.accident_free ?? true} 
              />
              <SafetyCheck 
                label="Bebas Banjir" 
                checked={listing.inspection?.flood_free ?? true} 
              />
              <SafetyCheck 
                label="Bebas Kebakaran" 
                checked={listing.inspection?.fire_free ?? true} 
              />
              <SafetyCheck 
                label="Odometer Asli" 
                checked={!listing.inspection?.odometer_tampered} 
              />
            </div>

            {/* Certificate */}
            {listing.inspection?.certificate_number && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Sertifikat Inspeksi</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      No: {listing.inspection.certificate_number}
                    </p>
                  </div>
                  <Badge variant="premium" className="text-xs">
                    Terverifikasi
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== LOCATION & STATS ==================== */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-4 space-y-3">
          {/* Location */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <MapPin className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Lokasi Kendaraan</p>
                <p className="font-semibold">{location}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 text-center">
              <Eye className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-600">{listing.view_count?.toLocaleString() || 0}</p>
              <p className="text-[10px] text-muted-foreground">Dilihat</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 text-center">
              <Star className="h-4 w-4 text-pink-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-pink-600">{listing.favorite_count?.toLocaleString() || 0}</p>
              <p className="text-[10px] text-muted-foreground">Favorit</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 text-center">
              <Clock className="h-4 w-4 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-purple-600">{timeAgo(listing.created_at)}</p>
              <p className="text-[10px] text-muted-foreground">Diposting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================== SELLER INFO ==================== */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            {listing.dealer ? (
              <Building2 className="h-5 w-5 text-amber-600" />
            ) : (
              <User className="h-5 w-5 text-amber-600" />
            )}
            Informasi Penjual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {listing.dealer ? (
            /* Dealer Info */
            <Link href={`/dealer/${listing.dealer.id}`} className="block">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 transition-colors">
                {/* Dealer Logo */}
                <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                  {listing.dealer.logo_url ? (
                    <Image 
                      src={listing.dealer.logo_url}
                      alt={listing.dealer.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg truncate">{listing.dealer.name}</h4>
                    {listing.dealer.verified && (
                      <Badge variant="premium" className="text-[10px] shrink-0">
                        <CheckCircle className="h-3 w-3 mr-0.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{listing.dealer.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({listing.dealer.review_count || 0} ulasan)
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {listing.dealer.total_listings || 0} Mobil
                    </Badge>
                    {listing.dealer.subscription_tier && (
                      <Badge variant="warning" className="text-xs capitalize">
                        {listing.dealer.subscription_tier}
                      </Badge>
                    )}
                  </div>

                  {/* Contact */}
                  {listing.dealer.phone && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{listing.dealer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ) : listing.user ? (
            /* Individual Seller */
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {listing.user.avatar_url ? (
                  <Image 
                    src={listing.user.avatar_url}
                    alt={listing.user.name || 'User'}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                ) : (
                  listing.user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold">{listing.user.name || 'Pengguna'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {listing.user.phone_verified && (
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Terverifikasi
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {listing.user.role || 'user'}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            /* No seller info */
            <div className="text-center py-4 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Informasi penjual tidak tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== PREMIUM BADGE ==================== */}
      {isFeatured && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20">
              <Star className="h-6 w-6 fill-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Premium Listing</p>
              <p className="text-sm text-white/80">
                Iklan ini ditampilkan prioritas hingga {new Date(listing.featured_until!).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================

interface SpecItemProps {
  icon: React.ElementType
  label: string
  content: React.ReactNode
  description?: string
}

function SpecItem({ icon: Icon, label, content, description }: SpecItemProps) {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 transition-colors group">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <div>{content}</div>
      {description && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  )
}

interface SafetyCheckProps {
  label: string
  checked: boolean
}

function SafetyCheck({ label, checked }: SafetyCheckProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg",
      checked 
        ? "bg-green-50 dark:bg-green-950/30" 
        : "bg-red-50 dark:bg-red-950/30"
    )}>
      {checked ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      )}
      <span className={cn(
        "text-xs font-medium",
        checked ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
      )}>
        {label}
      </span>
    </div>
  )
}
