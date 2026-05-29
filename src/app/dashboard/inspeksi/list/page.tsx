'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, Plus, FileCheck, Clock, CheckCircle2, AlertTriangle,
  Car, Calendar, ChevronRight, Loader2, Gauge
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Inspection {
  id: string
  car_listing_id: string
  inspection_type: string
  inspection_score: number
  overall_grade: string
  risk_level: string
  has_certificate: boolean
  status: string
  created_at: string
  ai_price_recommended?: number
  ai_demand_level?: string
  car_listings?: {
    id: string
    title: string
    year: number
    price: number
    brands?: { name: string }
    car_models?: { name: string }
  }
}

export default function InspectionListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inspections?user_id=current')
      const data = await res.json()
      
      if (data.success) {
        setInspections(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch = insp.car_listings?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    const matchesStatus = statusFilter === 'all' || insp.status === statusFilter
    const matchesType = typeFilter === 'all' || insp.inspection_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-500 text-white'
      case 'B+':
      case 'B': return 'bg-blue-500 text-white'
      case 'C': return 'bg-yellow-500 text-white'
      default: return 'bg-red-500 text-white'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      default: return 'text-red-600 bg-red-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data inspeksi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inspeksi Kendaraan</h1>
          <p className="text-muted-foreground">
            Kelola dan lihat hasil inspeksi kendaraan Anda
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inspeksi/baru">
            <Plus className="h-4 w-4 mr-2" />
            Inspeksi Baru
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inspections.length}</div>
                <div className="text-sm text-muted-foreground">Total Inspeksi</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {inspections.filter(i => i.has_certificate).length}
                </div>
                <div className="text-sm text-muted-foreground">Dengan Sertifikat</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {inspections.filter(i => i.inspection_type === 'self').length}
                </div>
                <div className="text-sm text-muted-foreground">Inspeksi Mandiri</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gauge className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {inspections.filter(i => i.inspection_type === 'professional').length}
                </div>
                <div className="text-sm text-muted-foreground">Inspeksi Pro</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama kendaraan..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="self">Mandiri</SelectItem>
                <SelectItem value="professional">Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="certified">Bersertifikat</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredInspections.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Belum ada inspeksi</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai inspeksi pertama Anda untuk mendapatkan analisis AI
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/inspeksi/baru">
                      <Plus className="h-4 w-4 mr-2" />
                      Mulai Inspeksi
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((insp) => (
                <Link key={insp.id} href={`/dashboard/inspeksi/${insp.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Car className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {insp.car_listings?.title || 'Kendaraan'}
                              </h3>
                              {insp.has_certificate && (
                                <Badge className="bg-green-500 text-white">
                                  <FileCheck className="h-3 w-3 mr-1" />
                                  Sertifikat
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insp.car_listings?.brands?.name} {insp.car_listings?.car_models?.name} - {insp.car_listings?.year}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {formatDistanceToNow(new Date(insp.created_at), { 
                                    addSuffix: true, 
                                    locale: id 
                                  })}
                                </span>
                              </div>
                              <Badge variant="outline" className={cn("capitalize", getRiskColor(insp.risk_level))}>
                                Risiko: {insp.risk_level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge className={getGradeColor(insp.overall_grade)}>
                              Grade: {insp.overall_grade}
                            </Badge>
                            {insp.ai_price_recommended && (
                              <div className="text-sm font-semibold text-green-600 mt-1">
                                {formatCurrency(insp.ai_price_recommended)}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certified" className="mt-4">
          {filteredInspections.filter(i => i.has_certificate).length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Tidak ada inspeksi bersertifikat</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInspections.filter(i => i.has_certificate).map((insp) => (
                <Link key={insp.id} href={`/dashboard/inspeksi/${insp.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{insp.car_listings?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Grade: {insp.overall_grade} • Skor: {insp.inspection_score}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Tersertifikasi
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {filteredInspections.filter(i => i.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Tidak ada inspeksi pending</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInspections.filter(i => i.status === 'pending').map((insp) => (
                <Card key={insp.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{insp.car_listings?.title}</h3>
                        <p className="text-sm text-muted-foreground">Menunggu proses</p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
