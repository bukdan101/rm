'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DealerOwner {
  id: string
  full_name: string | null
  email: string
  phone: string | null
}

interface Dealer {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  address: string | null
  city_id: string | null
  province_id: string | null
  city_name: string | null
  province_name: string | null
  verified: boolean
  rating: number
  total_listings: number
  is_active: boolean
  created_at: string
  owner: DealerOwner | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    active: 0
  })
  const { toast } = useToast()

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      if (statusFilter === 'verified') {
        params.append('verified', 'true')
      } else if (statusFilter === 'pending') {
        params.append('verified', 'false')
      } else if (statusFilter === 'active') {
        params.append('is_active', 'true')
      }
      
      params.append('limit', pagination.limit.toString())
      params.append('offset', ((pagination.page - 1) * pagination.limit).toString())
      
      const response = await fetch(`/api/admin/dealers?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dealers')
      }
      
      const data = await response.json()
      setDealers(data.dealers || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))
      
      // Calculate stats from data
      setStats({
        total: data.total || 0,
        pending: (data.dealers || []).filter((d: Dealer) => !d.verified).length,
        verified: (data.dealers || []).filter((d: Dealer) => d.verified).length,
        active: (data.dealers || []).filter((d: Dealer) => d.is_active).length
      })
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
  }, [searchQuery, statusFilter, pagination.page, pagination.limit, toast])

  useEffect(() => {
    fetchDealers()
  }, [fetchDealers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleVerify = async (dealer: Dealer, verify: boolean) => {
    try {
      setProcessing(true)
      
      const response = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealer_id: dealer.id,
          verified: verify,
          is_active: verify // When verifying, also activate
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update dealer')
      }
      
      // Update local state
      setDealers(prev => prev.map(d =>
        d.id === dealer.id ? { ...d, verified: verify, is_active: verify } : d
      ))
      
      toast({
        title: 'Berhasil',
        description: `${dealer.name} telah ${verify ? 'diverifikasi' : 'diverifikasi ulang'}`,
      })
      
      setApprovalDialog(false)
      setSelectedDealer(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui dealer',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleActivate = async (dealer: Dealer, activate: boolean) => {
    try {
      setProcessing(true)
      
      const response = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealer_id: dealer.id,
          is_active: activate
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update dealer')
      }
      
      // Update local state
      setDealers(prev => prev.map(d =>
        d.id === dealer.id ? { ...d, is_active: activate } : d
      ))
      
      toast({
        title: 'Berhasil',
        description: `${dealer.name} telah ${activate ? 'diaktifkan' : 'dinonaktifkan'}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui dealer',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getStatusBadge = (dealer: Dealer) => {
    if (!dealer.verified) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
    }
    if (dealer.is_active) {
      return <Badge className="bg-emerald-500 gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>
    }
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Inactive</Badge>
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
            Dealer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan verifikasi dealer di platform
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
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.pending}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.verified}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.active}</div>
            )}
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
                placeholder="Cari dealer, slug, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
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
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('verified')}
                size="sm"
              >
                Verified
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealer Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dealers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Tidak ada dealer ditemukan</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Belum ada dealer terdaftar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dealers.map((dealer) => (
            <Card key={dealer.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{dealer.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {dealer.city_name || dealer.province_name || 'No location'}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(dealer)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dealer.owner && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{dealer.owner.full_name || 'No name'}</span>
                  </div>
                )}
                {dealer.owner && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{dealer.owner.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {new Date(dealer.created_at).toLocaleDateString('id-ID')}</span>
                </div>

                {dealer.verified && (
                  <div className="flex gap-4 text-sm pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{dealer.total_listings} listings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{dealer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}

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
                    Detail
                  </Button>
                  {!dealer.verified ? (
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => {
                        setSelectedDealer(dealer)
                        setApprovalDialog(true)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={dealer.is_active ? "destructive" : "default"}
                      className="flex-1"
                      onClick={() => handleActivate(dealer, !dealer.is_active)}
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : dealer.is_active ? (
                        <XCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      {dealer.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let page: number
              if (pagination.totalPages <= 5) {
                page = i + 1
              } else if (pagination.page <= 3) {
                page = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                page = pagination.totalPages - 4 + i
              } else {
                page = pagination.page - 2 + i
              }
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dealer Details</DialogTitle>
            <DialogDescription>
              Complete dealer information
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
                  <p className="text-sm text-muted-foreground">{selectedDealer.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedDealer)}
                    {selectedDealer.verified && (
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1 text-amber-500" />
                        {selectedDealer.rating.toFixed(1)} rating
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              {selectedDealer.owner && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="text-sm font-medium">Owner Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.owner.full_name || 'No name provided'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.owner.email}
                    </div>
                    {selectedDealer.owner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedDealer.owner.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Location */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <p className="text-sm font-medium">Business Location</p>
                <div className="space-y-2 text-sm">
                  {selectedDealer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedDealer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {selectedDealer.city_name && selectedDealer.province_name
                      ? `${selectedDealer.city_name}, ${selectedDealer.province_name}`
                      : 'Location not specified'}
                  </div>
                  {selectedDealer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedDealer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {selectedDealer.verified && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 text-center">
                    <Car className="h-5 w-5 mx-auto text-cyan-600 mb-1" />
                    <p className="font-semibold">{selectedDealer.total_listings}</p>
                    <p className="text-xs text-muted-foreground">Listings</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
                    <Star className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                    <p className="font-semibold">{selectedDealer.rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                    <p className="font-semibold">{selectedDealer.is_active ? 'Active' : 'Inactive'}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              )}

              {/* Important Note for Pending */}
              {!selectedDealer.verified && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Pending Verification</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Dealer ini menunggu verifikasi. Periksa dokumen dan informasi bisnis sebelum menyetujui.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {!selectedDealer?.verified && selectedDealer && (
              <Button
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => {
                  setDetailDialog(false)
                  setApprovalDialog(true)
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Dealer
              </Button>
            )}
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
            <DialogTitle>Dealer Verification</DialogTitle>
            <DialogDescription>
              Verify or reject this dealer registration
            </DialogDescription>
          </DialogHeader>
          {selectedDealer && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedDealer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDealer.city_name && selectedDealer.province_name
                    ? `${selectedDealer.city_name}, ${selectedDealer.province_name}`
                    : 'No location'}
                </p>
                {selectedDealer.owner && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Owner: {selectedDealer.owner.full_name || selectedDealer.owner.email}
                  </p>
                )}
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
              onClick={() => {
                if (!rejectionReason.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Alasan penolakan wajib diisi',
                    variant: 'destructive',
                  })
                  return
                }
                // For now, just deactivate since we don't have a reject endpoint
                if (selectedDealer) {
                  handleActivate(selectedDealer, false)
                  setApprovalDialog(false)
                  setRejectionReason('')
                }
              }}
              disabled={processing || !rejectionReason.trim()}
              className="w-full sm:w-auto"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject
            </Button>
            <Button
              onClick={() => selectedDealer && handleVerify(selectedDealer, true)}
              disabled={processing}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Verify & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
