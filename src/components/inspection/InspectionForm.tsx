'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  Download,
  Save,
  Send,
  Car,
  Wrench,
  Zap,
  Settings,
  CircleDot,
  Triangle,
  Circle,
  Plus,
  Droplets
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InspectionStatus } from '@/types/marketplace'

// Inspection status options
const STATUS_OPTIONS: { value: InspectionStatus; label: string; color: string }[] = [
  { value: 'istimewa', label: 'Istimewa', color: 'bg-purple-500' },
  { value: 'baik', label: 'Baik', color: 'bg-green-500' },
  { value: 'sedang', label: 'Sedang', color: 'bg-yellow-500' },
  { value: 'perlu_perbaikan', label: 'Perlu Perbaikan', color: 'bg-red-500' },
]

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Engine: Settings,
  Transmission: Settings,
  Brake: CircleDot,
  Suspension: Wrench,
  Steering: Circle,
  Exterior: Car,
  Interior: Droplets,
  Electrical: Zap,
  Safety: Shield,
  Wheels: CircleDot,
  Underbody: Triangle,
  Body: Car,
  Additional: Plus,
}

// Inspection Item type
interface InspectionItemData {
  id: number
  category: string
  name: string
  description: string
  display_order: number
}

// Inspection Result type for form
interface InspectionResultForm {
  item_id: number
  status: InspectionStatus
  notes: string
  image_url: string | null
}

// Props
interface InspectionFormProps {
  carListingId: string
  carTitle?: string
  existingInspection?: {
    id: string
    results: InspectionResultForm[]
    inspector_name?: string
    inspection_place?: string
    accident_free?: boolean
    flood_free?: boolean
    fire_free?: boolean
  } | null
  onSubmit: (data: InspectionFormData) => Promise<void>
  onSaveDraft?: (data: InspectionFormData) => Promise<void>
  onExportPdf?: (data: InspectionFormData) => Promise<void>
  isSubmitting?: boolean
}

export interface InspectionFormData {
  car_listing_id: string
  inspector_name: string
  inspection_place: string
  inspection_date: string
  accident_free: boolean
  flood_free: boolean
  fire_free: boolean
  odometer_tampered: boolean
  results: InspectionResultForm[]
}

export function InspectionForm({
  carListingId,
  carTitle,
  existingInspection,
  onSubmit,
  onSaveDraft,
  onExportPdf,
  isSubmitting = false
}: InspectionFormProps) {
  // State
  const [items, setItems] = useState<InspectionItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('Engine')
  
  // Form state
  const [inspectorName, setInspectorName] = useState(existingInspection?.inspector_name || '')
  const [inspectionPlace, setInspectionPlace] = useState(existingInspection?.inspection_place || '')
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0])
  const [accidentFree, setAccidentFree] = useState(existingInspection?.accident_free ?? true)
  const [floodFree, setFloodFree] = useState(existingInspection?.flood_free ?? true)
  const [fireFree, setFireFree] = useState(existingInspection?.fire_free ?? true)
  const [odometerTampered, setOdometerTampered] = useState(false)
  
  // Results state - keyed by item_id
  const [results, setResults] = useState<Record<number, InspectionResultForm>>(() => {
    if (existingInspection?.results) {
      const map: Record<number, InspectionResultForm> = {}
      existingInspection.results.forEach(r => {
        map[r.item_id] = r
      })
      return map
    }
    return {}
  })

  // Fetch inspection items
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/inspection-items')
        const data = await res.json()
        if (data.success) {
          setItems(data.data)
          
          // Initialize results for all items if not existing
          if (!existingInspection?.results) {
            const initialResults: Record<number, InspectionResultForm> = {}
            data.data.forEach((item: InspectionItemData) => {
              initialResults[item.id] = {
                item_id: item.id,
                status: 'baik',
                notes: '',
                image_url: null
              }
            })
            setResults(initialResults)
          }
        }
      } catch (error) {
        console.error('Error fetching inspection items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [existingInspection])

  // Group items by category
  const groupedItems = useMemo(() => {
    const grouped: Record<string, InspectionItemData[]> = {}
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [items])

  // Category order
  const categoryOrder = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      const firstItemA = groupedItems[a][0]?.display_order || 0
      const firstItemB = groupedItems[b][0]?.display_order || 0
      return firstItemA - firstItemB
    })
  }, [groupedItems])

  // Calculate stats
  const stats = useMemo(() => {
    const values = Object.values(results)
    return {
      total: values.length,
      istimewa: values.filter(r => r.status === 'istimewa').length,
      baik: values.filter(r => r.status === 'baik').length,
      sedang: values.filter(r => r.status === 'sedang').length,
      perlu_perbaikan: values.filter(r => r.status === 'perlu_perbaikan').length,
    }
  }, [results])

  // Calculate score
  const score = useMemo(() => {
    const passed = stats.istimewa + stats.baik
    return Math.round((passed / stats.total) * 100) || 0
  }, [stats])

  // Handle status change
  const handleStatusChange = (itemId: number, status: InspectionStatus) => {
    setResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status
      }
    }))
  }

  // Handle notes change
  const handleNotesChange = (itemId: number, notes: string) => {
    setResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }))
  }

  // Set all items to a status
  const setAllInCategory = (category: string, status: InspectionStatus) => {
    const categoryItems = groupedItems[category] || []
    setResults(prev => {
      const updated = { ...prev }
      categoryItems.forEach(item => {
        updated[item.id] = {
          ...updated[item.id],
          status
        }
      })
      return updated
    })
  }

  // Prepare form data
  const getFormData = (): InspectionFormData => ({
    car_listing_id: carListingId,
    inspector_name: inspectorName,
    inspection_place: inspectionPlace,
    inspection_date: inspectionDate,
    accident_free: accidentFree,
    flood_free: floodFree,
    fire_free: fireFree,
    odometer_tampered: odometerTampered,
    results: Object.values(results)
  })

  // Handle submit
  const handleSubmit = async () => {
    const formData = getFormData()
    await onSubmit(formData)
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      const formData = getFormData()
      await onSaveDraft(formData)
    }
  }

  // Handle export PDF
  const handleExportPdf = async () => {
    if (onExportPdf) {
      const formData = getFormData()
      await onExportPdf(formData)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Memuat item inspeksi...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div className="flex-1">
              <h2 className="font-bold text-lg">Form Inspeksi 160 Titik</h2>
              {carTitle && (
                <p className="text-white/80 text-sm">{carTitle}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{score}%</p>
              <p className="text-white/80 text-xs">Skor Kondisi</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {/* Inspector Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="inspector_name" className="text-sm text-gray-600">Nama Inspektor</Label>
              <Input
                id="inspector_name"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Nama lengkap inspektor"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="inspection_place" className="text-sm text-gray-600">Lokasi Inspeksi</Label>
              <Input
                id="inspection_place"
                value={inspectionPlace}
                onChange={(e) => setInspectionPlace(e.target.value)}
                placeholder="Tempat inspeksi"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="inspection_date" className="text-sm text-gray-600">Tanggal Inspeksi</Label>
              <Input
                id="inspection_date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Safety Checks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setAccidentFree(!accidentFree)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                accidentFree 
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {accidentFree ? (
                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
              )}
              <p className="text-xs font-medium">Bebas Kecelakaan</p>
            </button>

            <button
              type="button"
              onClick={() => setFloodFree(!floodFree)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                floodFree 
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {floodFree ? (
                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
              )}
              <p className="text-xs font-medium">Bebas Banjir</p>
            </button>

            <button
              type="button"
              onClick={() => setFireFree(!fireFree)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                fireFree 
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {fireFree ? (
                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
              )}
              <p className="text-xs font-medium">Bebas Kebakaran</p>
            </button>

            <button
              type="button"
              onClick={() => setOdometerTampered(!odometerTampered)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                !odometerTampered 
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {!odometerTampered ? (
                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
              )}
              <p className="text-xs font-medium">Odometer Original</p>
            </button>
          </div>

          {/* Stats Progress */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">{stats.istimewa}</p>
              <p className="text-xs text-gray-500">Istimewa</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">{stats.baik}</p>
              <p className="text-xs text-gray-500">Baik</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <p className="text-xl font-bold text-yellow-600">{stats.sedang}</p>
              <p className="text-xs text-gray-500">Sedang</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-xl font-bold text-red-600">{stats.perlu_perbaikan}</p>
              <p className="text-xs text-gray-500">Perlu Perbaikan</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress Inspeksi</span>
              <span className="font-medium">{stats.total} / {items.length} item</span>
            </div>
            <Progress value={(stats.total / items.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <div className="border-b px-2 overflow-x-auto">
              <TabsList className="h-auto flex-nowrap gap-1 bg-transparent p-1">
                {categoryOrder.map(category => {
                  const Icon = CATEGORY_ICONS[category] || CircleDot
                  const categoryItems = groupedItems[category] || []
                  const categoryStats = {
                    baik: categoryItems.filter(i => results[i.id]?.status === 'baik' || results[i.id]?.status === 'istimewa').length,
                    total: categoryItems.length
                  }
                  
                  return (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap",
                        "data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {category}
                      <Badge variant="outline" className="ml-1 text-[10px] px-1">
                        {categoryStats.baik}/{categoryStats.total}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {categoryOrder.map(category => {
              const categoryItems = groupedItems[category] || []
              
              return (
                <TabsContent key={category} value={category} className="p-4 mt-0">
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{category}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-500">Set Semua:</span>
                      {STATUS_OPTIONS.map(opt => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAllInCategory(category, opt.value)}
                          className="h-7 text-xs"
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Items List */}
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {categoryItems.map(item => {
                        const result = results[item.id]
                        if (!result) return null
                        
                        return (
                          <div
                            key={item.id}
                            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {/* Checkbox for visual */}
                              <div className="pt-1">
                                <Checkbox
                                  checked={result.status === 'istimewa' || result.status === 'baik'}
                                  onCheckedChange={(checked) => {
                                    handleStatusChange(item.id, checked ? 'baik' : 'perlu_perbaikan')
                                  }}
                                />
                              </div>
                              
                              {/* Item info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-medium text-sm text-gray-800 truncate">
                                    {item.name}
                                  </h4>
                                  <Select
                                    value={result.status}
                                    onValueChange={(value) => handleStatusChange(item.id, value as InspectionStatus)}
                                  >
                                    <SelectTrigger className="w-32 h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          <span className="flex items-center gap-2">
                                            <span className={cn("w-2 h-2 rounded-full", opt.color)} />
                                            {opt.label}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                                
                                {/* Notes */}
                                <Textarea
                                  value={result.notes}
                                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                  placeholder="Catatan (opsional)"
                                  className="h-16 text-xs resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Terakhir disimpan: {new Date().toLocaleTimeString('id-ID')}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {onSaveDraft && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Draft
                </Button>
              )}
              
              {onExportPdf && (
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  disabled={isSubmitting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    disabled={isSubmitting || !inspectorName || !inspectionPlace}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Menyimpan...' : 'Selesaikan Inspeksi'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Inspeksi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menyelesaikan inspeksi ini? 
                      Data akan disimpan dan dapat diekspor sebagai sertifikat PDF.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                      Ya, Selesaikan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
