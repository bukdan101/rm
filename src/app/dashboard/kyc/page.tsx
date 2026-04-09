'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { useRegions } from '@/hooks/useRegions'
import { LocationPicker } from '@/components/location/LocationPicker'
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  AlertCircle,
  FileText,
  Camera,
  User,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
} from 'lucide-react'

interface KYCData {
  id: string
  full_name: string | null
  ktp_number: string | null
  phone_number: string | null
  province_id: string | null
  city_id: string | null
  district_id: string | null
  village_id: string | null
  full_address: string | null
  ktp_image_url: string | null
  selfie_image_url: string | null
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  submitted_at: string | null
  reviewed_at: string | null
}

const statusConfig = {
  not_submitted: {
    label: 'Belum Verifikasi',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: AlertCircle,
  },
  pending: {
    label: 'Menunggu Review',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
  },
  approved: {
    label: 'Terverifikasi',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
}

export default function KYCPage() {
  const { user, profile } = useAuth()
  const { provinces, cities, loading: regionsLoading } = useRegions()
  
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<'ktp' | 'selfie' | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    ktp_number: '',
    phone_number: '',
    province_id: '',
    city_id: '',
    district_id: '',
    village_id: '',
    full_address: '',
    ktp_image_url: '',
    selfie_image_url: '',
  })

  useEffect(() => {
    async function fetchKYC() {
      try {
        const res = await fetch('/api/kyc')
        const data = await res.json()
        if (data.success && data.kyc) {
          setKycData(data.kyc)
          // Populate form if data exists
          if (data.kyc.status !== 'not_submitted') {
            setFormData({
              full_name: data.kyc.full_name || '',
              ktp_number: data.kyc.ktp_number || '',
              phone_number: data.kyc.phone_number || '',
              province_id: data.kyc.province_id || '',
              city_id: data.kyc.city_id || '',
              district_id: data.kyc.district_id || '',
              village_id: data.kyc.village_id || '',
              full_address: data.kyc.full_address || '',
              ktp_image_url: data.kyc.ktp_image_url || '',
              selfie_image_url: data.kyc.selfie_image_url || '',
            })
          }
        }
      } catch (error) {
        console.error('Error fetching KYC:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchKYC()
  }, [])

  const handleImageUpload = async (type: 'ktp' | 'selfie', file: File) => {
    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          [`${type}_image_url`]: data.url,
        }))
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      
      if (data.success) {
        setKycData(data.kyc)
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const status = kycData?.status || 'not_submitted'
  const StatusIcon = statusConfig[status].icon

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  // Approved state
  if (status === 'approved') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Verifikasi KYC</h1>
          <p className="text-muted-foreground">Status verifikasi akun Anda</p>
        </div>

        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              Akun Terverifikasi!
            </h2>
            <p className="text-muted-foreground mb-4">
              Akun Anda sudah terverifikasi. Anda dapat memasang iklan sekarang.
            </p>
            <Badge className={statusConfig.approved.color}>
              Verified Seller
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pending state
  if (status === 'pending') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Verifikasi KYC</h1>
          <p className="text-muted-foreground">Status verifikasi akun Anda</p>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-2">
              Sedang Diverifikasi
            </h2>
            <p className="text-muted-foreground mb-4">
              Dokumen Anda sedang dalam proses review. Proses verifikasi membutuhkan waktu 1-3 hari kerja.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Submitted: {kycData?.submitted_at ? new Date(kycData.submitted_at).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form state (not_submitted or rejected)
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verifikasi KYC</h1>
        <p className="text-muted-foreground">
          Verifikasi identitas Anda untuk mulai berjualan
        </p>
      </div>

      {/* Rejection Alert */}
      {status === 'rejected' && kycData?.rejection_reason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Verifikasi Ditolak</AlertTitle>
          <AlertDescription>{kycData.rejection_reason}</AlertDescription>
        </Alert>
      )}

      {/* Requirements Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Persyaratan Verifikasi
          </CardTitle>
          <CardDescription>Dokumen yang diperlukan untuk User Biasa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Foto KTP</p>
                <p className="text-sm text-muted-foreground">Foto KTP yang jelas dan terbaca</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Selfie dengan KTP</p>
                <p className="text-sm text-muted-foreground">Foto selfie sambil memegang KTP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Verifikasi</CardTitle>
          <CardDescription>Lengkapi data berikut untuk proses verifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Data Pribadi
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap (sesuai KTP)</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ktp_number">NIK (16 digit)</Label>
                <Input
                  id="ktp_number"
                  value={formData.ktp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, ktp_number: e.target.value }))}
                  placeholder="Masukkan NIK"
                  maxLength={16}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alamat KTP
            </h3>
            
            <LocationPicker
              provinceId={formData.province_id}
              cityId={formData.city_id}
              onProvinceChange={(id, name) => setFormData(prev => ({ ...prev, province_id: id }))}
              onCityChange={(id, name) => setFormData(prev => ({ ...prev, city_id: id }))}
            />
            
            <div className="space-y-2">
              <Label htmlFor="full_address">Alamat Lengkap</Label>
              <Input
                id="full_address"
                value={formData.full_address}
                onChange={(e) => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
                placeholder="Jalan, nomor rumah, RT/RW"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Dokumen
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* KTP Upload */}
              <div className="space-y-2">
                <Label>Foto KTP</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="ktp-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload('ktp', file)
                    }}
                  />
                  <label
                    htmlFor="ktp-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {formData.ktp_image_url ? (
                      <img 
                        src={formData.ktp_image_url} 
                        alt="KTP" 
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : uploading === 'ktp' ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload KTP</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label>Selfie dengan KTP</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="selfie-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload('selfie', file)
                    }}
                  />
                  <label
                    htmlFor="selfie-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {formData.selfie_image_url ? (
                      <img 
                        src={formData.selfie_image_url} 
                        alt="Selfie" 
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : uploading === 'selfie' ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload Selfie</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={submitting || !formData.full_name || !formData.ktp_number || !formData.ktp_image_url || !formData.selfie_image_url}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Kirim Verifikasi
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Proses verifikasi membutuhkan waktu 1-3 hari kerja
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
