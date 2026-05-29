'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  User, 
  MapPin, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface KycFormData {
  full_name: string
  ktp_number: string
  phone_number: string
  provinceId: string
  regencyId: string
  districtId?: string
  villageId?: string
  full_address?: string
  ktp_image_url?: string
  selfie_image_url?: string
}

interface Province {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

interface KycData {
  id: string
  user_id: string
  full_name: string | null
  ktp_number: string | null
  phone_number: string | null
  province_id: string | null
  city_id: string | null
  full_address: string | null
  ktp_image_url: string | null
  selfie_image_url: string | null
  status: string
}

interface KYCFormProps {
  userId: string
  existingKyc?: KycData | null
  onSubmit: (data: KycFormData) => Promise<boolean>
}

type FormStep = 'personal' | 'address' | 'documents' | 'review'

const STEPS: { id: FormStep; label: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Data Diri', icon: User },
  { id: 'address', label: 'Alamat', icon: MapPin },
  { id: 'documents', label: 'Dokumen', icon: FileText },
  { id: 'review', label: 'Review', icon: CheckCircle },
]

export function KYCForm({ userId, existingKyc, onSubmit }: KYCFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [formData, setFormData] = useState<KycFormData>({
    full_name: existingKyc?.full_name || '',
    ktp_number: existingKyc?.ktp_number || '',
    phone_number: existingKyc?.phone_number || '',
    provinceId: existingKyc?.province_id || '',
    regencyId: existingKyc?.city_id || '',
    districtId: '',
    villageId: '',
    full_address: existingKyc?.full_address || '',
    ktp_image_url: existingKyc?.ktp_image_url || '',
    selfie_image_url: existingKyc?.selfie_image_url || '',
  })
  
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Fetch provinces on mount
  useState(() => {
    async function fetchProvinces() {
      try {
        const res = await fetch('/api/locations/provinces')
        const data = await res.json()
        if (data.success) {
          setProvinces(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      }
    }
    fetchProvinces()
  })

  // Fetch cities when province changes
  const fetchCities = async (provinceId: string) => {
    if (!provinceId) {
      setCities([])
      return
    }
    
    try {
      const res = await fetch(`/api/locations/cities?province_id=${provinceId}`)
      const data = await res.json()
      if (data.success) {
        setCities(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  // Update field
  const updateField = <K extends keyof KycFormData>(field: K, value: KycFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Fetch cities when province changes
    if (field === 'provinceId') {
      fetchCities(value as string)
      setFormData(prev => ({ ...prev, regencyId: '' }))
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'ktp' | 'selfie'): Promise<string | null> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', 'kyc')
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })
      const data = await res.json()
      if (data.success && data.url) {
        return data.url
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
    return null
  }

  // Current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Validation
  const canGoNext = () => {
    switch (currentStep) {
      case 'personal':
        return formData.full_name && formData.ktp_number && formData.phone_number
      case 'address':
        return formData.provinceId && formData.regencyId && formData.full_address
      case 'documents':
        return formData.ktp_image_url && formData.selfie_image_url
      case 'review':
        return termsAccepted
      default:
        return false
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!termsAccepted) return
    
    setSubmitting(true)
    try {
      const success = await onSubmit(formData)
      if (success) {
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Error submitting KYC:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Verifikasi Identitas (KYC)
          </CardTitle>
          <CardDescription className="text-white/80">
            Lengkapi data untuk memulai berjualan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Langkah {currentStepIndex + 1} dari {STEPS.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-6 overflow-x-auto gap-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    "flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-lg transition-colors",
                    isActive && "bg-purple-100 text-purple-700",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-400"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center",
                    isActive && "bg-purple-500 text-white",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-gray-200"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{step.label}</span>
                </button>
              )
            })}
          </div>

          {/* Personal Step */}
          {currentStep === 'personal' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Data Diri</h3>
              
              <div>
                <Label htmlFor="full_name">Nama Lengkap (sesuai KTP) *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ktp_number">No. KTP *</Label>
                <Input
                  id="ktp_number"
                  value={formData.ktp_number}
                  onChange={(e) => updateField('ktp_number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="16 digit nomor KTP"
                  className="mt-1"
                  maxLength={16}
                />
                {formData.ktp_number && formData.ktp_number.length !== 16 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No. KTP harus 16 digit
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone_number">No. HP *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Address Step */}
          {currentStep === 'address' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Alamat Sesuai KTP</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Provinsi *</Label>
                  <Select 
                    value={formData.provinceId} 
                    onValueChange={(v) => updateField('provinceId', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kota/Kabupaten *</Label>
                  <Select 
                    value={formData.regencyId} 
                    onValueChange={(v) => updateField('regencyId', v)}
                    disabled={!formData.provinceId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Alamat Lengkap *</Label>
                <Textarea
                  value={formData.full_address}
                  onChange={(e) => updateField('full_address', e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === 'documents' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Upload Dokumen</h3>
              
              {/* KTP */}
              <div>
                <Label>Foto KTP *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.ktp_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.ktp_image_url}
                        alt="KTP"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => updateField('ktp_image_url', '')}
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const url = await handleFileUpload(e.target.files[0], 'ktp')
                            if (url) updateField('ktp_image_url', url)
                          }
                        }}
                        className="hidden"
                        id="ktp-upload"
                      />
                      <label htmlFor="ktp-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Klik untuk upload foto KTP</p>
                        <p className="text-gray-400 text-xs mt-1">JPG, PNG (max 5MB)</p>
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              {/* Selfie */}
              <div>
                <Label>Foto Selfie dengan KTP *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.selfie_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.selfie_image_url}
                        alt="Selfie"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => updateField('selfie_image_url', '')}
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const url = await handleFileUpload(e.target.files[0], 'selfie')
                            if (url) updateField('selfie_image_url', url)
                          }
                        }}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <label htmlFor="selfie-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Klik untuk upload foto selfie</p>
                        <p className="text-gray-400 text-xs mt-1">Foto wajah dengan KTP</p>
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Pastikan foto:</p>
                  <ul className="mt-1 space-y-0.5">
                    <li>• Jelas dan tidak blur</li>
                    <li>• Data KTP terbaca dengan baik</li>
                    <li>• Wajah terlihat jelas di foto selfie</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Konfirmasi Data</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs text-gray-500 mb-1">Nama Lengkap</h4>
                  <p className="font-medium">{formData.full_name}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs text-gray-500 mb-1">No. KTP</h4>
                  <p className="font-medium">{formData.ktp_number}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs text-gray-500 mb-1">No. HP</h4>
                  <p className="font-medium">{formData.phone_number}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs text-gray-500 mb-1">Alamat</h4>
                  <p className="font-medium">{formData.full_address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-xs text-gray-500 mb-1">Foto KTP</h4>
                    {formData.ktp_image_url && (
                      <img src={formData.ktp_image_url} alt="KTP" className="h-20 rounded" />
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-xs text-gray-500 mb-1">Foto Selfie</h4>
                    {formData.selfie_image_url && (
                      <img src={formData.selfie_image_url} alt="Selfie" className="h-20 rounded" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  Saya menyatakan bahwa data yang saya berikan adalah benar dan saya menyetujui 
                  syarat dan ketentuan AutoMarket.
                </Label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>
            
            {currentStep !== 'review' ? (
              <Button
                onClick={goNext}
                disabled={!canGoNext()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !canGoNext()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Kirim Verifikasi
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Verifikasi Berhasil Dikirim!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen Anda sedang dalam proses verifikasi. Proses ini biasanya memakan waktu 1-2 hari kerja.
              Kami akan menghubungi Anda melalui email/WhatsApp setelah verifikasi selesai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
