'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Car, Camera, ClipboardCheck, Calculator, ArrowRight, ArrowLeft,
  Upload, CheckCircle, Loader2, Sparkles, TrendingUp, FileText
} from 'lucide-react'

// Steps configuration
const STEPS = [
  { id: 1, title: 'Data Kendaraan', icon: Car, description: 'Informasi dasar kendaraan' },
  { id: 2, title: 'Foto Kendaraan', icon: Camera, description: 'Upload foto untuk analisis AI' },
  { id: 3, title: 'Inspeksi 160 Titik', icon: ClipboardCheck, description: 'Self-inspection kendaraan' },
  { id: 4, title: 'Info Pembelian', icon: FileText, description: 'Harga beli (opsional)' },
  { id: 5, title: 'Hasil Prediksi', icon: Calculator, description: 'AI Price Prediction' },
]

// Inspection categories
const INSPECTION_CATEGORIES: Record<string, { items: string[], icon: string }> = {
  'Eksterior': {
    icon: '🚗',
    items: ['Bumper Depan', 'Bumper Belakang', 'Grille Depan', 'Kap Mesin', 'Lampu Utama Kiri', 'Lampu Utama Kanan']
  },
  'Interior': {
    icon: '🛋️',
    items: ['Dashboard', 'Panel Instrumen', 'Klakson', 'Setir', 'Kursi Depan', 'AC']
  },
  'Mesin': {
    icon: '⚙️',
    items: ['Blok Mesin', 'Oli Mesin', 'Radiator', 'Alternator', 'Starter Motor', 'Air Filter']
  },
  'Transmisi': {
    icon: '🔧',
    items: ['Transmisi', 'Kopling', 'Gardan', 'Persneling 1-5', 'Gigi Mundur']
  },
  'Rem': {
    icon: '🛑',
    items: ['Disc Brake Depan', 'Disc Brake Belakang', 'Brake Pad', 'Master Rem', 'ABS']
  },
}

const INSPECTION_STATUS = {
  istimewa: { label: 'Istimewa', color: 'bg-purple-500' },
  baik: { label: 'Baik', color: 'bg-green-500' },
  sedang: { label: 'Sedang', color: 'bg-yellow-500' },
  perlu_perbaikan: { label: 'Perlu Perbaikan', color: 'bg-red-500' }
}

// Photo types
const PHOTO_TYPES = [
  { id: 'exterior_front', label: 'Depan', required: true, icon: '🚗' },
  { id: 'exterior_rear', label: 'Belakang', required: true, icon: '🚙' },
  { id: 'exterior_side_left', label: 'Samping Kiri', required: true, icon: '🚘' },
  { id: 'exterior_side_right', label: 'Samping Kanan', required: true, icon: '🚖' },
  { id: 'interior_dashboard', label: 'Dashboard', required: true, icon: '🎛️' },
  { id: 'engine', label: 'Mesin', required: false, icon: '⚙️' },
]

interface FormData {
  brand_id: string
  model_id: string
  year: number
  transmission: string
  mileage: number
  photos: Array<{ type: string, url: string }>
  inspection: Record<string, Record<string, { status: string, notes: string }>>
  purchase_price: number
  predictionResult: any
}

const initialFormData: FormData = {
  brand_id: '',
  model_id: '',
  year: new Date().getFullYear(),
  transmission: '',
  mileage: 0,
  photos: [],
  inspection: {},
  purchase_price: 0,
  predictionResult: null,
}

export default function DashboardPredictionPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Master data
  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  
  // Calculate inspection progress
  const totalInspectionItems = Object.values(INSPECTION_CATEGORIES).reduce(
    (sum, cat) => sum + cat.items.length, 0
  )
  const inspectedItems = Object.values(formData.inspection).reduce(
    (sum, cat) => sum + Object.keys(cat).length, 0
  )
  const inspectionProgress = (inspectedItems / totalInspectionItems) * 100
  
  // Load master data
  useEffect(() => {
    loadMasterData()
  }, [])
  
  const loadMasterData = async () => {
    try {
      const brandsRes = await fetch('/api/brands')
      const brandsData = await brandsRes.json()
      if (brandsData.success) setBrands(brandsData.data || [])
    } catch (error) {
      console.error('Error loading master data:', error)
    }
  }
  
  // Load models when brand changes
  useEffect(() => {
    if (formData.brand_id) {
      loadModels(formData.brand_id)
    }
  }, [formData.brand_id])
  
  const loadModels = async (brandId: string) => {
    try {
      const res = await fetch(`/api/models?brand_id=${brandId}`)
      const data = await res.json()
      if (data.success) setModels(data.data || [])
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }
  
  const handlePhotoUpload = async (type: string, file: File) => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', 'prediction')
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })
      const data = await res.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos.filter(p => p.type !== type), { type, url: data.url }]
        }))
        toast({ title: 'Foto berhasil diupload' })
      }
    } catch (error) {
      toast({ title: 'Gagal upload foto', variant: 'destructive' })
    }
  }
  
  const handleInspectionChange = (category: string, item: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      inspection: {
        ...prev.inspection,
        [category]: {
          ...(prev.inspection[category] || {}),
          [item]: { status, notes: '' }
        }
      }
    }))
  }
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.brand_id && formData.model_id && formData.year)
      case 2:
        const requiredPhotos = PHOTO_TYPES.filter(p => p.required)
        return requiredPhotos.every(rp => formData.photos.some(p => p.type === rp.id))
      case 3:
        return inspectionProgress >= 50
      default:
        return true
    }
  }
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    } else {
      toast({
        title: 'Data belum lengkap',
        description: 'Mohon lengkapi semua field yang diperlukan',
        variant: 'destructive'
      })
    }
  }
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const submitPrediction = async () => {
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: formData.brand_id,
          model_id: formData.model_id,
          year: formData.year,
          transmission: formData.transmission || null,
          mileage: formData.mileage || null,
          photos: formData.photos.map(p => ({ type: p.type, url: p.url })),
          inspection: Object.entries(formData.inspection).map(([category, items]) => ({
            category,
            items: Object.entries(items).map(([name, data]) => ({
              name,
              status: data.status,
              notes: data.notes
            }))
          }))
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, predictionResult: data.data }))
        setCurrentStep(5)
        toast({
          title: 'Prediksi Berhasil!',
          description: 'AI telah menganalisis kendaraan Anda'
        })
      } else {
        throw new Error(data.error || 'Failed to create prediction')
      }
    } catch (error) {
      toast({
        title: 'Gagal membuat prediksi',
        description: String(error),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            AI Price Prediction
          </h1>
          <p className="text-muted-foreground">
            Prediksi harga kendaraan dengan teknologi AI
          </p>
        </div>
      </div>
      
      {/* Progress Steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentStep === step.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : currentStep > step.id
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium text-sm">{step.title}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-2 text-gray-300 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Step 1: Vehicle Data */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              Data Kendaraan
            </CardTitle>
            <CardDescription>
              Masukkan informasi dasar kendaraan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Merek *</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value, model_id: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih merek" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select
                  value={formData.model_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value }))}
                  disabled={!formData.brand_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tahun *</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Transmisi</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih transmisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>KM Tempuh</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Photos */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Foto Kendaraan
            </CardTitle>
            <CardDescription>
              Upload minimal 5 foto untuk analisis AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PHOTO_TYPES.map(photoType => {
                const uploadedPhoto = formData.photos.find(p => p.type === photoType.id)
                
                return (
                  <div key={photoType.id} className="relative">
                    <Label className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{photoType.icon}</span>
                      {photoType.label}
                      {photoType.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    <div
                      className={`aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                        uploadedPhoto
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {uploadedPhoto ? (
                        <div className="relative w-full h-full">
                          <img
                            src={uploadedPhoto.url}
                            alt={photoType.label}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 p-4 cursor-pointer w-full h-full">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handlePhotoUpload(photoType.id, file)
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">
                  Foto: {formData.photos.length}/5
                </span>
                <Badge variant={formData.photos.length >= 5 ? 'default' : 'secondary'}>
                  {formData.photos.length >= 5 ? 'Lengkap' : `${5 - formData.photos.length} lagi`}
                </Badge>
              </div>
              <Progress value={(formData.photos.length / 5) * 100} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Inspection */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Inspeksi 160 Titik</h3>
                  <p className="text-white/80 text-sm">Minimal 50% harus diisi</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{inspectedItems}</div>
                  <div className="text-sm text-white/80">dari {totalInspectionItems}</div>
                </div>
              </div>
              <Progress value={inspectionProgress} className="mt-3 h-2 bg-white/30" />
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newInspection: any = {}
                Object.entries(INSPECTION_CATEGORIES).forEach(([cat, data]) => {
                  newInspection[cat] = {}
                  data.items.forEach(item => {
                    newInspection[cat][item] = { status: 'baik', notes: '' }
                  })
                })
                setFormData(prev => ({ ...prev, inspection: newInspection }))
              }}
            >
              ✅ Isi Semua "Baik"
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, inspection: {} }))}
            >
              🔄 Reset
            </Button>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {Object.entries(INSPECTION_CATEGORIES).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-xl">{data.icon}</span>
                      {category}
                      <Badge variant="outline" className="ml-auto">
                        {Object.keys(formData.inspection[category] || {}).length}/{data.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.items.map(item => {
                        const itemData = formData.inspection[category]?.[item]
                        
                        return (
                          <div key={item} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <span className="flex-1 text-sm">{item}</span>
                            <div className="flex gap-1">
                              {Object.entries(INSPECTION_STATUS).map(([status, config]) => (
                                <button
                                  key={status}
                                  onClick={() => handleInspectionChange(category, item, status)}
                                  className={`px-2 py-1 text-xs rounded transition-all ${
                                    itemData?.status === status
                                      ? `${config.color} text-white`
                                      : 'bg-gray-200 hover:bg-gray-300'
                                  }`}
                                >
                                  {config.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Step 4: Purchase Info */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Informasi Pembelian (Opsional)
            </CardTitle>
            <CardDescription>
              Masukkan harga beli untuk analisis profit/loss
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Pembelian</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 350000000"
                  value={formData.purchase_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Result */}
      {currentStep === 5 && formData.predictionResult && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Badge className="bg-white/20 text-white mb-4">
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Prediction
                </Badge>
                <h2 className="text-xl font-bold mb-2">Harga Prediksi</h2>
                <div className="text-4xl font-bold mb-2">
                  {formatPrice(formData.predictionResult.predicted_price_recommended)}
                </div>
                <p className="text-white/80">
                  Range: {formatPrice(formData.predictionResult.predicted_price_low)} - {formatPrice(formData.predictionResult.predicted_price_high)}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{formData.predictionResult.prediction_confidence}%</div>
                  <div className="text-sm text-white/80">Confidence</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{formData.predictionResult.vehicle_rating || 'A'}</div>
                  <div className="text-sm text-white/80">Rating</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{formData.predictionResult.market_demand || 'Tinggi'}</div>
                  <div className="text-sm text-white/80">Demand</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={() => router.push('/dashboard/listings/create')}
            >
              Buat Iklan dari Prediksi Ini
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setFormData(initialFormData)
                setCurrentStep(1)
              }}
            >
              Prediksi Baru
            </Button>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sebelumnya
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Selanjutnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submitPrediction} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Lihat Prediksi
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
