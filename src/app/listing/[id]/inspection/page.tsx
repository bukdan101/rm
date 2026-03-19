'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { InspectionForm, type InspectionFormData } from '@/components/inspection/InspectionForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Shield,
  Download,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

interface Inspection {
  id: string
  car_listing_id: string
  inspector_name: string | null
  inspection_place: string | null
  inspection_date: string
  total_points: number
  passed_points: number | null
  inspection_score: number | null
  accident_free: boolean
  flood_free: boolean
  fire_free: boolean
  odometer_tampered: boolean
  risk_level: string
  overall_grade: string | null
  certificate_number: string | null
  status: string
  results?: Array<{
    item_id: number
    status: string
    notes: string | null
    item?: {
      id: number
      category: string
      name: string
      description: string
    }
  }>
}

interface Listing {
  id: string
  title: string | null
  listing_number: string | null
  brand?: { name: string }
  model?: { name: string }
  year: number | null
  plate_number: string | null
  inspection?: Inspection
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function InspectionPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch listing and inspection data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch listing
        const listingRes = await fetch(`/api/listings/${id}`)
        const listingData = await listingRes.json()
        
        if (!listingData.success) {
          setError(listingData.error || 'Listing tidak ditemukan')
          return
        }
        
        setListing(listingData.data)
        
        // Fetch existing inspection
        const inspectionRes = await fetch(`/api/inspections?car_listing_id=${id}`)
        const inspectionData = await inspectionRes.json()
        
        if (inspectionData.success && inspectionData.data) {
          setInspection(inspectionData.data)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])

  // Handle save inspection
  const handleSaveInspection = async (data: InspectionFormData) => {
    setSaving(true)
    
    try {
      // Calculate stats
      const passedPoints = data.results.filter(r => r.status === 'baik' || r.status === 'istimewa').length
      const score = Math.round((passedPoints / data.results.length) * 100)
      
      // Determine grade
      let grade = 'E'
      if (score >= 95) grade = 'A+'
      else if (score >= 90) grade = 'A'
      else if (score >= 85) grade = 'B+'
      else if (score >= 75) grade = 'B'
      else if (score >= 60) grade = 'C'
      else if (score >= 40) grade = 'D'
      
      // Determine risk level
      let riskLevel = 'low'
      if (!data.accident_free || !data.flood_free || !data.fire_free || data.odometer_tampered) {
        riskLevel = 'high'
      } else if (score < 75) {
        riskLevel = 'medium'
      }
      
      const inspectionId = inspection?.id || uuidv4()
      const certificateNumber = `INS-${Date.now().toString(36).toUpperCase()}-${id.slice(0, 4).toUpperCase()}`
      
      // Save inspection
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inspectionId,
          car_listing_id: id,
          inspector_name: data.inspector_name,
          inspection_place: data.inspection_place,
          inspection_date: data.inspection_date,
          total_points: data.results.length,
          passed_points: passedPoints,
          accident_free: data.accident_free,
          flood_free: data.flood_free,
          fire_free: data.fire_free,
          odometer_tampered: data.odometer_tampered,
          risk_level: riskLevel,
          overall_grade: grade,
          certificate_number: certificateNumber,
          status: 'completed',
          results: data.results
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setInspection(result.data)
        return inspectionId
      } else {
        throw new Error(result.error || 'Gagal menyimpan inspeksi')
      }
    } catch (err) {
      console.error('Error saving inspection:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Handle export PDF
  const handleExportPdf = async (data: InspectionFormData) => {
    setExporting(true)
    
    try {
      // First save the inspection
      await handleSaveInspection(data)
      
      // Then export PDF
      const res = await fetch('/api/inspections/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection_id: inspection?.id,
          car_listing_id: id,
          inspection_data: {
            ...data,
            id: inspection?.id,
            car_listing_id: id,
            overall_grade: inspection?.overall_grade,
            risk_level: inspection?.risk_level,
            certificate_number: inspection?.certificate_number
          }
        })
      })
      
      if (!res.ok) throw new Error('Failed to export PDF')
      
      // Download the PDF
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inspeksi-${listing?.listing_number || id.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      console.error('Error exporting PDF:', err)
      alert('Gagal mengekspor PDF')
    } finally {
      setExporting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-500">Memuat data inspeksi...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error || !listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-gray-500 mb-4">{error || 'Listing tidak ditemukan'}</p>
              <Link href="/">
                <Button>Kembali ke Beranda</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Get car title
  const carTitle = listing.title || 
    `${listing.brand?.name || ''} ${listing.model?.name || ''} ${listing.year || ''}`.trim()

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/listing/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Listing
            </Button>
          </Link>
          
          {/* Existing inspection badge */}
          {inspection && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={
                  inspection.overall_grade?.startsWith('A') ? 'border-green-500 text-green-600' :
                  inspection.overall_grade?.startsWith('B') ? 'border-blue-500 text-blue-600' :
                  inspection.overall_grade?.startsWith('C') ? 'border-amber-500 text-amber-600' :
                  'border-red-500 text-red-600'
                }
              >
                Grade: {inspection.overall_grade || '-'}
              </Badge>
              <Badge variant="outline">
                Skor: {inspection.inspection_score || '-'}%
              </Badge>
            </div>
          )}
        </div>

        {/* Header Card */}
        <Card className="border-0 shadow-lg mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <h1 className="font-bold text-lg">
                  {inspection ? 'Edit Inspeksi' : 'Inspeksi Kendaraan'}
                </h1>
                <p className="text-white/80 text-sm">
                  {carTitle} • 160 Titik Pemeriksaan
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick info */}
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">No. Listing</p>
                <p className="font-medium">{listing.listing_number || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">No. Polisi</p>
                <p className="font-medium">{listing.plate_number || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status Inspeksi</p>
                <p className="font-medium">
                  {inspection ? (
                    <Badge className="bg-green-500">Selesai</Badge>
                  ) : (
                    <Badge variant="outline">Belum</Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Form */}
        <InspectionForm
          carListingId={id}
          carTitle={carTitle}
          existingInspection={inspection ? {
            id: inspection.id,
            results: inspection.results?.map(r => ({
              item_id: r.item_id,
              status: r.status as 'baik' | 'sedang' | 'perlu_perbaikan' | 'istimewa',
              notes: r.notes,
              image_url: null
            })) || [],
            inspector_name: inspection.inspector_name,
            inspection_place: inspection.inspection_place,
            accident_free: inspection.accident_free,
            flood_free: inspection.flood_free,
            fire_free: inspection.fire_free
          } : null}
          onSubmit={handleSaveInspection}
          onExportPdf={handleExportPdf}
          isSubmitting={saving || exporting}
        />
      </div>
    </MainLayout>
  )
}
