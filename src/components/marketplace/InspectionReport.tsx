'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CarInspection, InspectionResult, InspectionCategory } from '@/types/marketplace'
import { getInspectionStatusLabel, getInspectionStatusColor, getRiskLevelColor, getRiskLevelLabel } from '@/lib/utils-marketplace'
import { Shield, CheckCircle, AlertTriangle, CheckSquare } from 'lucide-react'

interface InspectionReportProps {
  inspection: CarInspection | null
  categories?: InspectionCategory[]
}

export function InspectionReport({ inspection, categories }: InspectionReportProps) {
  if (!inspection) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada data inspeksi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Inspeksi 160 Titik</h3>
              <p className="text-white/80 text-sm">
                {inspection.inspector_name || 'Inspeksi Profesional'} • {' '}
                {new Date(inspection.inspection_date).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {/* Risk Level */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Tingkat Risiko</span>
            <Badge className={`${getRiskLevelColor(inspection.risk_level || 'low')} text-white`}>
              {inspection.risk_level === 'low' ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {getRiskLevelLabel(inspection.risk_level || 'low')}
            </Badge>
          </div>

          {/* Score Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Skor Inspeksi</span>
              <span className="font-bold text-emerald-600">
                {inspection.passed_points || 0}/{inspection.total_points || 160}
              </span>
            </div>
            <Progress 
              value={(inspection.passed_points || 0) / (inspection.total_points || 160) * 100} 
              className="h-3"
            />
          </div>

          {/* Safety Checks */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`p-2 rounded-lg text-center ${inspection.accident_free ? 'bg-green-50' : 'bg-red-50'}`}>
              {inspection.accident_free ? (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
              )}
              <p className={`text-xs mt-1 ${inspection.accident_free ? 'text-green-600' : 'text-red-600'}`}>
                Bebas Kecelakaan
              </p>
            </div>
            <div className={`p-2 rounded-lg text-center ${inspection.flood_free ? 'bg-green-50' : 'bg-red-50'}`}>
              {inspection.flood_free ? (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
              )}
              <p className={`text-xs mt-1 ${inspection.flood_free ? 'text-green-600' : 'text-red-600'}`}>
                Bebas Banjir
              </p>
            </div>
            <div className={`p-2 rounded-lg text-center ${inspection.fire_free ? 'bg-green-50' : 'bg-red-50'}`}>
              {inspection.fire_free ? (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
              )}
              <p className={`text-xs mt-1 ${inspection.fire_free ? 'text-green-600' : 'text-red-600'}`}>
                Bebas Kebakaran
              </p>
            </div>
          </div>

          {/* Stats */}
          {inspection.stats && (
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{inspection.stats.baik}</p>
                <p className="text-xs text-gray-500">Baik</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{inspection.stats.istimewa}</p>
                <p className="text-xs text-gray-500">Istimewa</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{inspection.stats.sedang}</p>
                <p className="text-xs text-gray-500">Sedang</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{inspection.stats.perlu_perbaikan}</p>
                <p className="text-xs text-gray-500">Perlu Perbaikan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results by Category */}
      {inspection.results_by_category && Object.keys(inspection.results_by_category).length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              Detail Inspeksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(inspection.results_by_category).map(([category, results]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 font-medium text-sm flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">{results.length} item</Badge>
                </div>
                <div className="divide-y">
                  {(results as InspectionResult[]).slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-gray-600">{result.item?.name || 'Item'}</span>
                      <Badge variant="outline" className={getInspectionStatusColor(result.status)}>
                        {getInspectionStatusLabel(result.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
