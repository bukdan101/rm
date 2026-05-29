'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRegions, RegionProvince, RegionCity, RegionDistrict, RegionVillage } from '@/hooks/useRegions'
import { 
  Building2, 
  MapPin, 
  User, 
  FileText, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Loader2,
  FileCheck,
  X,
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react'

// Types
interface FormData {
  // Step 1: Dealer Info
  dealer_name: string
  dealer_phone: string
  dealer_email: string
  dealer_description: string
  dealer_logo_url: string
  
  // Step 2: Address
  province_id: string
  city_id: string
  district_id: string
  village_id: string
  full_address: string
  postal_code: string
  
  // Step 3: Owner KYC
  owner_name: string
  owner_ktp_number: string
  owner_phone: string
  owner_ktp_url: string
  owner_selfie_url: string
  
  // Step 4: Business Documents
  npwp_number: string
  npwp_document_url: string
  nib_number: string
  nib_document_url: string
  siup_number: string
  siup_document_url: string
  domicile_letter_url: string
}

interface FileUpload {
  file: File | null
  url: string
  uploading: boolean
  error: string | null
}

const initialFormData: FormData = {
  dealer_name: '',
  dealer_phone: '',
  dealer_email: '',
  dealer_description: '',
  dealer_logo_url: '',
  province_id: '',
  city_id: '',
  district_id: '',
  village_id: '',
  full_address: '',
  postal_code: '',
  owner_name: '',
  owner_ktp_number: '',
  owner_phone: '',
  owner_ktp_url: '',
  owner_selfie_url: '',
  npwp_number: '',
  npwp_document_url: '',
  nib_number: '',
  nib_document_url: '',
  siup_number: '',
  siup_document_url: '',
  domicile_letter_url: '',
}

const STEPS = [
  { id: 1, title: 'Data Dealer', description: 'Informasi nama dan kontak dealer', icon: Building2 },
  { id: 2, title: 'Alamat', description: 'Lokasi dealer/showroom', icon: MapPin },
  { id: 3, title: 'Data Pemilik', description: 'Verifikasi identitas pemilik', icon: User },
  { id: 4, title: 'Legalitas Usaha', description: 'Dokumen perizinan usaha', icon: FileText },
]

interface DealerOnboardingFormProps {
  userId: string
  userEmail?: string
  userName?: string
  onSubmit?: (data: FormData) => void
  onSaveDraft?: (data: FormData) => void
}

export function DealerOnboardingForm({ 
  userId, 
  userEmail = '', 
  userName = '',
  onSubmit,
  onSaveDraft 
}: DealerOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    dealer_email: userEmail,
    owner_name: userName,
  })
  const [fileUploads, setFileUploads] = useState<Record<string, FileUpload>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Region hooks
  const { 
    provinces, 
    regencies, 
    districts, 
    villages,
    loadingProvinces,
    loadingRegencies,
    loadingDistricts,
    loadingVillages,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  } = useRegions()

  // Handle input change
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Handle location change
  const handleProvinceChange = useCallback((provinceId: string) => {
    setFormData(prev => ({
      ...prev,
      province_id: provinceId,
      city_id: '',
      district_id: '',
      village_id: '',
    }))
    fetchRegencies(provinceId)
  }, [fetchRegencies])

  const handleCityChange = useCallback((cityId: string) => {
    setFormData(prev => ({
      ...prev,
      city_id: cityId,
      district_id: '',
      village_id: '',
    }))
    fetchDistricts(cityId)
  }, [fetchDistricts])

  const handleDistrictChange = useCallback((districtId: string) => {
    setFormData(prev => ({
      ...prev,
      district_id: districtId,
      village_id: '',
    }))
    fetchVillages(districtId)
  }, [fetchVillages])

  // Upload file
  const uploadFile = useCallback(async (
    file: File, 
    fileType: 'ktp' | 'selfie' | 'document' | 'logo',
    fieldName: string,
    documentType?: string
  ) => {
    const key = fieldName
    
    setFileUploads(prev => ({
      ...prev,
      [key]: { file, url: '', uploading: true, error: null }
    }))

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('file_type', fileType)
      formDataUpload.append('user_id', userId)
      if (documentType) {
        formDataUpload.append('document_type', documentType)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update form data with URL
      setFormData(prev => ({ ...prev, [fieldName]: result.url }))
      
      setFileUploads(prev => ({
        ...prev,
        [key]: { file, url: result.url, uploading: false, error: null }
      }))
    } catch (error) {
      setFileUploads(prev => ({
        ...prev,
        [key]: { file, url: '', uploading: false, error: (error as Error).message }
      }))
    }
  }, [userId])

  // Remove uploaded file
  const removeFile = useCallback((fieldName: string) => {
    setFileUploads(prev => {
      const newUploads = { ...prev }
      delete newUploads[fieldName]
      return newUploads
    })
    setFormData(prev => ({ ...prev, [fieldName]: '' }))
  }, [])

  // Validate step
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.dealer_name.trim()) {
          newErrors.dealer_name = 'Nama dealer wajib diisi'
        }
        break
      
      case 2:
        if (!formData.province_id) {
          newErrors.province_id = 'Provinsi wajib dipilih'
        }
        if (!formData.city_id) {
          newErrors.city_id = 'Kota/Kabupaten wajib dipilih'
        }
        if (!formData.full_address.trim()) {
          newErrors.full_address = 'Alamat lengkap wajib diisi'
        }
        break
      
      case 3:
        if (!formData.owner_name.trim()) {
          newErrors.owner_name = 'Nama pemilik wajib diisi'
        }
        if (!formData.owner_ktp_number.trim()) {
          newErrors.owner_ktp_number = 'NIK wajib diisi'
        } else if (!/^\d{16}$/.test(formData.owner_ktp_number)) {
          newErrors.owner_ktp_number = 'NIK harus 16 digit angka'
        }
        break
      
      case 4:
        if (!formData.npwp_number.trim()) {
          newErrors.npwp_number = 'NPWP wajib diisi'
        }
        if (!formData.npwp_document_url) {
          newErrors.npwp_document_url = 'Dokumen NPWP wajib diupload'
        }
        if (!formData.nib_number.trim()) {
          newErrors.nib_number = 'NIB wajib diisi'
        }
        if (!formData.nib_document_url) {
          newErrors.nib_document_url = 'Dokumen NIB wajib diupload'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Navigation
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }, [currentStep, validateStep])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  // Submit form
  const handleSubmit = useCallback(async (submitNow: boolean = true) => {
    if (!validateStep(4)) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/dealer-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
          submit_now: submitNow,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit')
      }

      if (onSubmit) {
        onSubmit(formData)
      }

      // Show success
      alert(submitNow 
        ? 'Pendaftaran dealer berhasil dikirim! Tim kami akan mereview dalam 1-2 hari kerja.'
        : 'Draft berhasil disimpan!'
      )
    } catch (error) {
      console.error('Submit error:', error)
      alert((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, userId, validateStep, onSubmit])

  // Progress
  const progress = (currentStep / 4) * 100

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pendaftaran Dealer
          </h2>
          <Badge variant="outline" className="text-sm">
            Langkah {currentStep} dari 4
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Step indicators */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            
            return (
              <button
                key={step.id}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                disabled={step.id > currentStep}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-center hidden sm:block">
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form Cards */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon
              return <Icon className="w-5 h-5" />
            })()}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Dealer Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="dealer_name" className="flex items-center gap-1">
                  Nama Dealer / Showroom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dealer_name"
                  value={formData.dealer_name}
                  onChange={(e) => handleInputChange('dealer_name', e.target.value)}
                  placeholder="Contoh: Auto Prima Motor"
                  className={errors.dealer_name ? 'border-red-500' : ''}
                />
                {errors.dealer_name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.dealer_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dealer_phone">Nomor Telepon Bisnis</Label>
                  <Input
                    id="dealer_phone"
                    value={formData.dealer_phone}
                    onChange={(e) => handleInputChange('dealer_phone', e.target.value)}
                    placeholder="021-1234567"
                  />
                </div>
                <div>
                  <Label htmlFor="dealer_email">Email Bisnis</Label>
                  <Input
                    id="dealer_email"
                    type="email"
                    value={formData.dealer_email}
                    onChange={(e) => handleInputChange('dealer_email', e.target.value)}
                    placeholder="dealer@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dealer_description">Deskripsi Singkat</Label>
                <Textarea
                  id="dealer_description"
                  value={formData.dealer_description}
                  onChange={(e) => handleInputChange('dealer_description', e.target.value)}
                  placeholder="Ceritakan tentang dealer Anda..."
                  rows={3}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <Label>Logo Dealer (Opsional)</Label>
                <div className="mt-2">
                  {formData.dealer_logo_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.dealer_logo_url} 
                        alt="Logo" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile('dealer_logo_url')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      {fileUploads.dealer_logo_url?.uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 mt-2">Upload Logo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'logo', 'dealer_logo_url')
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    Provinsi <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.province_id}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger className={errors.province_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingProvinces ? 'Memuat...' : 'Pilih Provinsi'} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p: RegionProvince) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.province_id}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={handleCityChange}
                    disabled={!formData.province_id || loadingRegencies}
                  >
                    <SelectTrigger className={errors.city_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={
                        !formData.province_id ? 'Pilih provinsi dulu' :
                        loadingRegencies ? 'Memuat...' : 'Pilih Kota/Kabupaten'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {regencies.map((r: RegionCity) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.city_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Kecamatan</Label>
                  <Select
                    value={formData.district_id}
                    onValueChange={handleDistrictChange}
                    disabled={!formData.city_id || loadingDistricts}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.city_id ? 'Pilih kota dulu' :
                        loadingDistricts ? 'Memuat...' : 'Pilih Kecamatan'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d: RegionDistrict) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Kelurahan/Desa</Label>
                  <Select
                    value={formData.village_id}
                    onValueChange={(v) => handleInputChange('village_id', v)}
                    disabled={!formData.district_id || loadingVillages}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.district_id ? 'Pilih kecamatan dulu' :
                        loadingVillages ? 'Memuat...' : 'Pilih Kelurahan'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map((v: RegionVillage) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={formData.full_address}
                  onChange={(e) => handleInputChange('full_address', e.target.value)}
                  placeholder="Nama jalan, nomor bangunan, patokan..."
                  rows={3}
                  className={errors.full_address ? 'border-red-500' : ''}
                />
                {errors.full_address && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_address}</p>
                )}
              </div>

              <div className="w-1/2">
                <Label>Kode Pos</Label>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Owner KYC */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Data pemilik akan diverifikasi untuk keamanan transaksi. Pastikan data sesuai dengan KTP.
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  Nama Lengkap (sesuai KTP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="Nama lengkap tanpa gelar"
                  className={errors.owner_name ? 'border-red-500' : ''}
                />
                {errors.owner_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.owner_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    NIK / Nomor KTP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.owner_ktp_number}
                    onChange={(e) => handleInputChange('owner_ktp_number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    className={errors.owner_ktp_number ? 'border-red-500' : ''}
                  />
                  {errors.owner_ktp_number && (
                    <p className="text-sm text-red-500 mt-1">{errors.owner_ktp_number}</p>
                  )}
                </div>

                <div>
                  <Label>Nomor HP Pemilik</Label>
                  <Input
                    value={formData.owner_phone}
                    onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                    placeholder="08123456789"
                  />
                </div>
              </div>

              {/* KTP Upload */}
              <div>
                <Label>Foto KTP</Label>
                <div className="mt-2">
                  {formData.owner_ktp_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.owner_ktp_url} 
                        alt="KTP" 
                        className="w-full max-w-md rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile('owner_ktp_url')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      {fileUploads.owner_ktp_url?.uploading ? (
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Klik untuk upload foto KTP</span>
                          <span className="text-xs text-gray-400 mt-1">JPG, PNG, max 10MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'ktp', 'owner_ktp_url')
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div>
                <Label>Foto Selfie dengan KTP</Label>
                <div className="mt-2">
                  {formData.owner_selfie_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.owner_selfie_url} 
                        alt="Selfie KTP" 
                        className="w-full max-w-md rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile('owner_selfie_url')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      {fileUploads.owner_selfie_url?.uploading ? (
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Klik untuk upload foto selfie dengan KTP</span>
                          <span className="text-xs text-gray-400 mt-1">Pastikan wajah dan KTP terlihat jelas</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'selfie', 'owner_selfie_url')
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Business Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Wajib:</strong> NPWP Perusahaan dan NIB (Nomor Induk Berusaha)
                  <br />
                  <strong>Opsional:</strong> SIUP, Surat Keterangan Domisili
                </p>
              </div>

              {/* NPWP */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">WAJIB</Badge>
                  <h4 className="font-semibold">NPWP Perusahaan</h4>
                </div>
                
                <div>
                  <Label className="flex items-center gap-1">
                    Nomor NPWP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.npwp_number}
                    onChange={(e) => handleInputChange('npwp_number', e.target.value)}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                    className={errors.npwp_number ? 'border-red-500' : ''}
                  />
                  {errors.npwp_number && (
                    <p className="text-sm text-red-500 mt-1">{errors.npwp_number}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Dokumen NPWP (PDF) <span className="text-red-500">*</span>
                  </Label>
                  {formData.npwp_document_url ? (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-400">Dokumen berhasil diupload</span>
                      <button
                        onClick={() => removeFile('npwp_document_url')}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 mt-2">
                      {fileUploads.npwp_document_url?.uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload dokumen NPWP (PDF)</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'document', 'npwp_document_url', 'npwp')
                        }}
                      />
                    </label>
                  )}
                  {errors.npwp_document_url && (
                    <p className="text-sm text-red-500 mt-1">{errors.npwp_document_url}</p>
                  )}
                </div>
              </div>

              {/* NIB */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">WAJIB</Badge>
                  <h4 className="font-semibold">NIB (Nomor Induk Berusaha)</h4>
                </div>
                
                <div>
                  <Label className="flex items-center gap-1">
                    Nomor NIB <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.nib_number}
                    onChange={(e) => handleInputChange('nib_number', e.target.value)}
                    placeholder="13 digit NIB"
                    className={errors.nib_number ? 'border-red-500' : ''}
                  />
                  {errors.nib_number && (
                    <p className="text-sm text-red-500 mt-1">{errors.nib_number}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Dokumen NIB (PDF) <span className="text-red-500">*</span>
                  </Label>
                  {formData.nib_document_url ? (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-400">Dokumen berhasil diupload</span>
                      <button
                        onClick={() => removeFile('nib_document_url')}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 mt-2">
                      {fileUploads.nib_document_url?.uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload dokumen NIB (PDF)</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'document', 'nib_document_url', 'nib')
                        }}
                      />
                    </label>
                  )}
                  {errors.nib_document_url && (
                    <p className="text-sm text-red-500 mt-1">{errors.nib_document_url}</p>
                  )}
                </div>
              </div>

              {/* SIUP - Optional */}
              <div className="p-4 border rounded-lg space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">OPSIONAL</Badge>
                  <h4 className="font-semibold">SIUP / TDP</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nomor SIUP</Label>
                    <Input
                      value={formData.siup_number}
                      onChange={(e) => handleInputChange('siup_number', e.target.value)}
                      placeholder="Nomor SIUP"
                    />
                  </div>
                  <div>
                    <Label>Dokumen SIUP (PDF)</Label>
                    {formData.siup_document_url ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <FileCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700">Uploaded</span>
                        <button
                          onClick={() => removeFile('siup_document_url')}
                          className="ml-auto"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full h-10 border border-dashed rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) uploadFile(file, 'document', 'siup_document_url', 'siup')
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Domicile Letter - Optional */}
              <div className="p-4 border rounded-lg space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">OPSIONAL</Badge>
                  <h4 className="font-semibold">Surat Keterangan Domisili</h4>
                </div>
                
                <div>
                  <Label>Upload Dokumen (PDF)</Label>
                  {formData.domicile_letter_url ? (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FileCheck className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700">Uploaded</span>
                      <button
                        onClick={() => removeFile('domicile_letter_url')}
                        className="ml-auto"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-10 border border-dashed rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 mt-2">
                      <Upload className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-xs text-gray-500">Upload surat domisili</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(file, 'document', 'domicile_letter_url', 'domicile')
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Sebelumnya
            </Button>

            <div className="flex gap-2">
              {currentStep === 4 && (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  Simpan Draft
                </Button>
              )}

              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Lanjutkan
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Kirim Pendaftaran
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
