'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, XCircle, AlertTriangle, Shield, Car, Calendar, 
  MapPin, Gauge, Droplet, Cog, FileCheck, Printer,
  Award, CheckSquare
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

const SAMPLE_INSPECTION_ID = '239c7453-3e40-4c4f-aaa0-058ea8bc1e34'

const gradeColors: Record<string, string> = {
  'A': 'bg-green-500 text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-yellow-500 text-white',
  'D': 'bg-red-500 text-white'
}

const gradeLabels: Record<string, string> = {
  'A': 'SANGAT BAIK',
  'B': 'BAIK',
  'C': 'CUKUP',
  'D': 'PERLU PERBAIKAN'
}

const gradeLabelsShort: Record<string, string> = {
  'A': 'Sangat Baik',
  'B': 'Baik',
  'C': 'Cukup',
  'D': 'Perlu Perbaikan'
}

export default function InspectionPreviewPage() {
  const [data, setData] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/inspections/${SAMPLE_INSPECTION_ID}/certificate`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat sertifikat...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Data Tidak Ditemukan</h2>
        </div>
      </div>
    )
  }

  const { inspection, categories, summary } = data
  const car = inspection.car_listings

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white print:p-0">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 8mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: auto; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4 no-print bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-xl font-bold">Preview Sertifikat Inspeksi</h1>
            <p className="text-sm text-gray-500">Klik tombol di kanan untuk cetak/download PDF</p>
          </div>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Cetak / Download PDF
          </Button>
        </div>

        {/* ========== PAGE 1: COVER & SUMMARY ========== */}
        <div className="print-page bg-white shadow-lg mb-4 print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 print:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center print:w-12 print:h-12">
                  <FileCheck className="h-7 w-7 text-blue-600 print:h-6 print:w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold print:text-xl">SERTIFIKAT INSPEKSI</h1>
                  <p className="text-blue-200 text-sm">AutoMarket Inspection Certificate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs">No. Sertifikat</p>
                <p className="font-mono text-lg font-bold">{inspection.certificate_number}</p>
              </div>
            </div>
          </div>

          <div className="p-6 print:p-4">
            {/* Vehicle Info */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-700">
                <Car className="h-4 w-4" />
                INFORMASI KENDARAAN
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Kendaraan</p>
                  <p className="font-semibold">{car?.brands?.name} {car?.car_models?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tahun</p>
                  <p className="font-semibold">{car?.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Transmisi</p>
                  <p className="font-semibold capitalize">{car?.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Bahan Bakar</p>
                  <p className="font-semibold capitalize">{car?.fuel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Kilometer</p>
                  <p className="font-semibold">{car?.mileage?.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tipe Bod</p>
                  <p className="font-semibold capitalize">{car?.body_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Lokasi</p>
                  <p className="font-semibold">{car?.city}, {car?.province}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Harga</p>
                  <p className="font-semibold">Rp {car?.price_cash?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Score & Grade */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-700">
                <Award className="h-4 w-4" />
                HASIL INSPEKSI
              </h2>
              <div className="flex items-center justify-center gap-8 py-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full ${gradeColors[summary.grade]} flex items-center justify-center shadow-lg mb-2`}>
                    <span className="text-4xl font-bold">{summary.grade}</span>
                  </div>
                  <p className="font-bold">{gradeLabels[summary.grade]}</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600">{summary.score}%</p>
                  <p className="text-gray-500 text-sm">Skor Keseluruhan</p>
                  <p className="text-xs text-gray-400 mt-1">{summary.passed}/{summary.total_items} item lulus</p>
                </div>
              </div>
              <div className="max-w-sm mx-auto mt-3">
                <Progress value={summary.score} className="h-2" />
              </div>
            </div>

            {/* Safety Status */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-700">
                <Shield className="h-4 w-4" />
                STATUS KEAMANAN
              </h2>
              <div className="grid grid-cols-4 gap-2">
                <div className={`p-2 rounded-lg text-center ${inspection.accident_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <Shield className={`h-5 w-5 mx-auto mb-1 ${inspection.accident_free ? 'text-green-500' : 'text-red-500'}`} />
                  <p className="text-xs text-gray-500">Bebas Kecelakaan</p>
                  <p className={`font-bold text-sm ${inspection.accident_free ? 'text-green-600' : 'text-red-600'}`}>
                    {inspection.accident_free ? '✓ YA' : '✗ TIDAK'}
                  </p>
                </div>
                <div className={`p-2 rounded-lg text-center ${inspection.flood_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <Droplet className={`h-5 w-5 mx-auto mb-1 ${inspection.flood_free ? 'text-green-500' : 'text-red-500'}`} />
                  <p className="text-xs text-gray-500">Bebas Banjir</p>
                  <p className={`font-bold text-sm ${inspection.flood_free ? 'text-green-600' : 'text-red-600'}`}>
                    {inspection.flood_free ? '✓ YA' : '✗ TIDAK'}
                  </p>
                </div>
                <div className={`p-2 rounded-lg text-center ${inspection.fire_free ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${inspection.fire_free ? 'text-green-500' : 'text-red-500'}`} />
                  <p className="text-xs text-gray-500">Bebas Kebakaran</p>
                  <p className={`font-bold text-sm ${inspection.fire_free ? 'text-green-600' : 'text-red-600'}`}>
                    {inspection.fire_free ? '✓ YA' : '✗ TIDAK'}
                  </p>
                </div>
                <div className={`p-2 rounded-lg text-center ${!inspection.odometer_tampered ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <Gauge className={`h-5 w-5 mx-auto mb-1 ${!inspection.odometer_tampered ? 'text-green-500' : 'text-red-500'}`} />
                  <p className="text-xs text-gray-500">Odometer Asli</p>
                  <p className={`font-bold text-sm ${!inspection.odometer_tampered ? 'text-green-600' : 'text-red-600'}`}>
                    {!inspection.odometer_tampered ? '✓ YA' : '✗ TIDAK'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Summary */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-700">
                <Cog className="h-4 w-4" />
                RINGKASAN PER KATEGORI
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {categories.map((category: any) => (
                  <div key={category.id} className="p-2 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs">{category.name}</span>
                      <span className={`font-bold text-xs ${
                        category.score >= 80 ? 'text-green-600' :
                        category.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {category.score}%
                      </span>
                    </div>
                    <Progress value={category.score} className="h-1.5" />
                    <p className="text-xs text-gray-400 mt-1">{category.passed}/{category.items.length} lulus</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg ${inspection.recommended ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-center gap-3">
                {inspection.recommended ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-bold text-green-700">KENDARAAN DIREKOMENDASIKAN</h3>
                      <p className="text-green-600 text-sm">Kendaraan ini layak untuk dibeli</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div>
                      <h3 className="font-bold text-red-700">PERLU PERTIMBANGAN</h3>
                      <p className="text-red-600 text-sm">Ada item yang memerlukan perbaikan</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Validity */}
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <div>
                <p className="font-medium">Tanggal Inspeksi:</p>
                <p>{new Date(inspection.inspection_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Berlaku Hingga:</p>
                <p>{new Date(inspection.certificate_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== PAGE 2: DETAILED ITEMS ========== */}
        <div className="print-page bg-white shadow-lg print:shadow-none">
          <div className="p-6 print:p-4">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-blue-700">
              <CheckSquare className="h-4 w-4" />
              DETAIL 160 ITEM INSPEKSI
            </h2>
            
            {categories.map((category: any) => (
              <div key={category.id} className="mb-4 border rounded-lg overflow-hidden">
                <div className={`p-2 text-white font-semibold text-sm ${
                  category.score >= 80 ? 'bg-green-600' :
                  category.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {category.name} - {category.score}% ({category.passed}/{category.items.length} lulus)
                </div>
                <div className="divide-y">
                  {category.items.map((item: any, idx: number) => (
                    <div key={item.id} className={`flex items-center justify-between p-2 text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        {item.status === 'baik' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.is_critical && (
                            <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-600">Kritis</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={item.status === 'baik' ? 'default' : 'destructive'} className="text-xs">
                        {item.status === 'baik' ? 'Baik' : 'Perlu Perbaikan'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
              <p className="font-semibold">AutoMarket Inspection Service</p>
              <p>Sertifikat ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah</p>
              <p className="mt-1">© {new Date().getFullYear()} AutoMarket - All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
