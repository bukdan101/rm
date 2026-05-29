'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Shield, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Wrench, Engine, Car,
  Thermometer, Zap, Settings, Camera
} from 'lucide-react'

interface InspectionResult {
  id: string
  status: string
  notes: string | null
  image_url: string | null
  item: {
    id: number
    category: string
    name: string
    description?: string
    display_order?: number
  }
}

interface InspectionData {
  id: string
  inspector_name: string | null
  inspection_place: string | null
  inspection_date: string | null
  total_points: number | null
  passed_points: number | null
  accident_free: boolean | null
  flood_free: boolean | null
  fire_free: boolean | null
  risk_level: string | null
  overall_score: number | null
  status: string | null
  created_at: string
  results: InspectionResult[]
  results_by_category: Record<string, InspectionResult[]>
  stats: {
    total: number
    passed: number
    needRepair: number
    notRelated: number
    passedPercentage: number
  }
}

interface InspectionReportProps {
  inspection: InspectionData
}

const categoryIcons: Record<string, typeof Engine> = {
  'Engine': Engine,
  'Eksterior': Car,
  'Exterior': Car,
  'Interior': Settings,
  'Test Drive': Zap,
  'Tes Jalan': Zap,
  'Under Body': Wrench,
  'Bawah Body': Wrench,
  'AC': Thermometer,
  'Kelistrikan': Zap,
  'Electrical': Zap,
  'Documents': Camera,
  'Dokumen': Camera,
}

const categoryLabels: Record<string, string> = {
  'Engine': 'Mesin',
  'Eksterior': 'Eksterior',
  'Exterior': 'Eksterior',
  'Interior': 'Interior',
  'Test Drive': 'Tes Jalan',
  'Tes Jalan': 'Tes Jalan',
  'Under Body': 'Bawah Body',
  'Bawah Body': 'Bawah Body',
  'AC': 'AC',
  'Kelistrikan': 'Kelistrikan',
  'Electrical': 'Kelistrikan',
  'Documents': 'Dokumen',
  'Dokumen': 'Dokumen',
}

function getStatusBadge(status: string) {
  const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle; label: string; className: string }> = {
    'baik': { variant: 'default', icon: CheckCircle, label: 'Baik', className: 'bg-green-500 hover:bg-green-600' },
    'istimewa': { variant: 'default', icon: CheckCircle, label: 'Istimewa', className: 'bg-green-600 hover:bg-green-700' },
    'sedang': { variant: 'secondary', icon: AlertTriangle, label: 'Sedang', className: 'bg-yellow-500 hover:bg-yellow-600' },
    'perlu_perbaikan': { variant: 'destructive', icon: XCircle, label: 'Perlu Perbaikan', className: '' },
    'tidak_berkaitan': { variant: 'outline', icon: CheckCircle, label: 'N/A', className: 'text-muted-foreground' },
  }
  return configs[status] || configs['baik']
}

function InspectionItem({ result }: { result: InspectionResult }) {
  const statusConfig = getStatusBadge(result.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="shrink-0 mt-0.5">
        {result.status === 'baik' || result.status === 'istimewa' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : result.status === 'perlu_perbaikan' ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : result.status === 'sedang' ? (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        ) : (
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">{result.item.name}</span>
          <Badge variant={statusConfig.variant} className={`shrink-0 text-xs ${statusConfig.className}`}>
            {statusConfig.label}
          </Badge>
        </div>
        {result.item.description && (
          <p className="text-xs text-muted-foreground mt-1">{result.item.description}</p>
        )}
        {result.notes && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {result.notes}
          </p>
        )}
      </div>
    </div>
  )
}

function CategorySection({ category, results }: { category: string; results: InspectionResult[] }) {
  const [isOpen, setIsOpen] = useState(true)
  const Icon = categoryIcons[category] || Settings
  const label = categoryLabels[category] || category

  // Calculate stats for this category
  const passed = results.filter(r => r.status === 'baik' || r.status === 'istimewa').length
  const total = results.length
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{label}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {passed}/{total} item lulus ({percentage}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {percentage === 100 ? (
                  <Badge className="bg-green-500">Lulus Semua</Badge>
                ) : percentage >= 80 ? (
                  <Badge variant="secondary">Baik</Badge>
                ) : (
                  <Badge variant="destructive">Perlu Perhatian</Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-2">
              {results.map((result) => (
                <InspectionItem key={result.id} result={result} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function InspectionReport({ inspection }: InspectionReportProps) {
  const categories = Object.keys(inspection.results_by_category || {})

  if (!inspection || categories.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Laporan Inspeksi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {inspection.total_points || inspection.stats?.total || 160} Poin Pemeriksaan
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {inspection.stats?.passedPercentage || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Skor Kelulusan</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <p className="text-2xl font-bold text-green-600">{inspection.stats?.passed || 0}</p>
              <p className="text-xs text-muted-foreground">Lulus</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <p className="text-2xl font-bold text-red-600">{inspection.stats?.needRepair || 0}</p>
              <p className="text-xs text-muted-foreground">Diperbetulkan</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-xs text-muted-foreground">Untuk Diperbetulkan</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-2xl font-bold text-gray-600">{inspection.stats?.notRelated || 0}</p>
              <p className="text-xs text-muted-foreground">Tidak Berkaitan</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Safety Checks */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              inspection.accident_free ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
            }`}>
              {inspection.accident_free ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {inspection.accident_free ? 'Bebas Tabrakan' : 'Pernah Tabrakan'}
              </span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              inspection.flood_free ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
            }`}>
              {inspection.flood_free ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {inspection.flood_free ? 'Bebas Banjir' : 'Pernah Banjir'}
              </span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              inspection.fire_free ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
            }`}>
              {inspection.fire_free ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {inspection.fire_free ? 'Bebas Kebakaran' : 'Pernah Kebakaran'}
              </span>
            </div>
          </div>

          {/* Inspector Info */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Inspektor: {inspection.inspector_name || 'N/A'}</span>
            <span>Tempat: {inspection.inspection_place || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Sections */}
      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            results={inspection.results_by_category[category]}
          />
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400">Kesimpulan Inspeksi</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Secara fungsional kondisi unit <strong>baik</strong>. Unit telah lulus {inspection.stats?.passed} dari {inspection.stats?.total} pemeriksaan dengan skor {inspection.stats?.passedPercentage}%. Tingkat risiko: <strong className="text-green-600">{inspection.risk_level === 'low' ? 'Rendah' : inspection.risk_level === 'medium' ? 'Sedang' : 'Tinggi'}</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
