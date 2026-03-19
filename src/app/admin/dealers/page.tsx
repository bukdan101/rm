'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Building2,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Calendar,
  Loader2,
  FileCheck,
  AlertCircle,
  Users,
  TrendingUp,
  Car,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Dealer {
  id: string
  name: string
  slug: string
  owner_name: string
  owner_email: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  logo_url: string | null
  cover_url: string | null
  description: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected'
  rating: number
  review_count: number
  total_listings: number
  created_at: string
  submitted_at: string
  documents: {
    id: string
    type: string
    name: string
    url: string
    verified: boolean
  }[]
}

const mockDealers: Dealer[] = [
  {
    id: '1',
    name: 'Auto Prima Jakarta',
    slug: 'auto-prima-jakarta',
    owner_name: 'Budi Santoso',
    owner_email: 'budi@autoprima.com',
    phone: '021-5678901',
    email: 'info@autoprima.com',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    logo_url: null,
    cover_url: null,
    description: 'Dealer mobil terpercaya dengan koleksi lengkap',
    website: 'https://autoprima.com',
    status: 'pending',
    rating: 0,
    review_count: 0,
    total_listings: 0,
    created_at: '2024-03-18',
    submitted_at: '2024-03-19',
    documents: [
      { id: '1', type: 'siup', name: 'SIUP.pdf', url: '#', verified: false },
      { id: '2', type: 'npwp', name: 'NPWP.pdf', url: '#', verified: false },
      { id: '3', type: 'ktp', name: 'KTP_Pemilik.pdf', url: '#', verified: false },
      { id: '4', type: 'showroom', name: 'Foto_Showroom.jpg', url: '#', verified: false },
    ]
  },
  {
    id: '2',
    name: 'Mobil Mantap Surabaya',
    slug: 'mobil-mantap-surabaya',
    owner_name: 'Andi Wijaya',
    owner_email: 'andi@mobilmentap.com',
    phone: '031-987654',
    email: 'sales@mobilmentap.com',
    address: 'Jl. Ahmad Yani No. 456, Surabaya',
    city: 'Surabaya',
    province: 'Jawa Timur',
    logo_url: null,
    cover_url: null,
    description: 'Spesialis mobil second berkualitas',
    website: null,
    status: 'pending',
    rating: 0,
    review_count: 0,
    total_listings: 0,
    created_at: '2024-03-17',
    submitted_at: '2024-03-18',
    documents: [
      { id: '5', type: 'siup', name: 'SIUP.pdf', url: '#', verified: false },
      { id: '6', type: 'npwp', name: 'NPWP.pdf', url: '#', verified: false },
      { id: '7', type: 'ktp', name: 'KTP_Pemilik.pdf', url: '#', verified: false },
      { id: '8', type: 'showroom', name: 'Foto_Showroom.jpg', url: '#', verified: false },
    ]
  },
  {
    id: '3',
    name: 'Sentra Motor Bandung',
    slug: 'sentra-motor-bandung',
    owner_name: 'Dedi Kurnia',
    owner_email: 'dedi@sentramotor.com',
    phone: '022-789012',
    email: 'info@sentramotor.com',
    address: 'Jl. Dipatiukur No. 789, Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    logo_url: null,
    cover_url: null,
    description: 'Dealer resmi dengan garansi penuh',
    website: 'https://sentramotor.com',
    status: 'approved',
    rating: 4.8,
    review_count: 45,
    total_listings: 32,
    created_at: '2024-02-15',
    submitted_at: '2024-02-16',
    documents: [
      { id: '9', type: 'siup', name: 'SIUP.pdf', url: '#', verified: true },
      { id: '10', type: 'npwp', name: 'NPWP.pdf', url: '#', verified: true },
      { id: '11', type: 'ktp', name: 'KTP_Pemilik.pdf', url: '#', verified: true },
      { id: '12', type: 'showroom', name: 'Foto_Showroom.jpg', url: '#', verified: true },
    ]
  },
]

export default function AdminDealers() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDealers()
  }, [])

  async function fetchDealers() {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setDealers(mockDealers)
    } catch (error) {
      console.error('Error fetching dealers:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data dealer',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch =
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dealer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: dealers.length,
    pending: dealers.filter(d => d.status === 'pending').length,
    approved: dealers.filter(d => d.status === 'approved').length,
    rejected: dealers.filter(d => d.status === 'rejected').length,
  }

  const handleApprove = async (dealer: Dealer) => {
    try {
      setProcessing(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDealers(prev => prev.map(d =>
        d.id === dealer.id ? { ...d, status: 'approved' as const } : d
      ))

      toast({
        title: 'Berhasil',
        description: `${dealer.name} telah disetujui sebagai dealer`,
      })

      setApprovalDialog(false)
      setSelectedDealer(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyetujui dealer',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDealer || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan wajib diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDealers(prev => prev.map(d =>
        d.id === selectedDealer.id ? { ...d, status: 'rejected' as const } : d
      ))

      toast({
        title: 'Berhasil',
        description: `${selectedDealer.name} telah ditolak`,
      })

      setApprovalDialog(false)
      setSelectedDealer(null)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menolak dealer',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-emerald-500 gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      default:
        return null
    }
  }

  const getDocumentType = (type: string) => {
    const types: Record<string, string> = {
      siup: 'SIUP',
      npwp: 'NPWP',
      ktp: 'KTP Pemilik',
      showroom: 'Foto Showroom',
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Dealer Approval
          </h1>
          <p className="text-muted-foreground mt-1">
            Review dan setujui pendaftaran dealer baru
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dealers</CardTitle>
            <Building2 className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dealer, pemilik, atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
                size="sm"
              >
                Approved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealer Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{dealer.name}</CardTitle>
                      <CardDescription className="text-xs">{dealer.city}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(dealer.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{dealer.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{dealer.owner_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Submitted: {new Date(dealer.submitted_at).toLocaleDateString('id-ID')}</span>
                </div>

                {dealer.status === 'approved' && (
                  <div className="flex gap-4 text-sm pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{dealer.total_listings} listings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{dealer.rating}</span>
                    </div>
                  </div>
                )}

                {dealer.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedDealer(dealer)
                        setDetailDialog(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => {
                        setSelectedDealer(dealer)
                        setApprovalDialog(true)
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dealer Registration Details</DialogTitle>
            <DialogDescription>
              Review all information before approval
            </DialogDescription>
          </DialogHeader>
          {selectedDealer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                  <Building2 className="h-8 w-8 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedDealer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDealer.description}</p>
                  {selectedDealer.website && (
                    <a href={selectedDealer.website} className="text-sm text-cyan-600 hover:underline flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      {selectedDealer.website}
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="text-sm font-medium">Owner Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.owner_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.owner_email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.phone}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="text-sm font-medium">Business Location</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedDealer.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.city}, {selectedDealer.province}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-medium mb-3">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedDealer.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{getDocumentType(doc.type)}</p>
                          <p className="text-xs text-muted-foreground">{doc.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.verified ? (
                          <Badge className="bg-emerald-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Note */}
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Pastikan semua dokumen sudah diverifikasi sebelum menyetujui dealer. 
                      Foto showroom depan wajib ada untuk verifikasi lokasi fisik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dealer Approval</DialogTitle>
            <DialogDescription>
              Approve or reject this dealer registration
            </DialogDescription>
          </DialogHeader>
          {selectedDealer && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedDealer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDealer.city}</p>
              </div>

              <div>
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="w-full sm:w-auto"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject
            </Button>
            <Button
              onClick={() => selectedDealer && handleApprove(selectedDealer)}
              disabled={processing}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
