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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import {
  FileCheck,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
  ZoomIn,
  Download,
  Filter,
  Calendar,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KYCUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
}

interface KYCSubmission {
  id: string
  user_id: string
  full_name: string
  ktp_number: string
  phone_number: string
  province_id: string | null
  city_id: string | null
  district_id: string | null
  village_id: string | null
  full_address: string | null
  ktp_image_url: string
  selfie_image_url: string
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  user: KYCUser | null
  province_name: string | null
  city_name: string | null
  district_name: string | null
  village_name: string | null
  reviewer: { id: string; full_name: string | null; email: string } | null
}

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [imageZoom, setImageZoom] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      const response = await fetch(`/api/admin/kyc?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch KYC submissions')
      }
      
      const data = await response.json()
      setSubmissions(data.kyc_submissions || [])
    } catch (error) {
      console.error('Error fetching KYC submissions:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data KYC',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchSubmissions()
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const processedSubmissions = submissions.filter(s => s.status !== 'pending' && s.status !== 'not_submitted')

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return

    try {
      setProcessing(true)
      
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kyc_id: selectedSubmission.id,
          action: 'approve',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve KYC')
      }

      toast({
        title: 'Berhasil',
        description: 'KYC berhasil disetujui',
      })

      setReviewDialog(false)
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyetujui KYC',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan wajib diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)
      
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kyc_id: selectedSubmission.id,
          action: 'reject',
          rejection_reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject KYC')
      }

      toast({
        title: 'Berhasil',
        description: 'KYC telah ditolak',
      })

      setReviewDialog(false)
      setSelectedSubmission(null)
      setRejectionReason('')
      fetchSubmissions()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menolak KYC',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  // Helper to get user display info
  const getUserName = (submission: KYCSubmission) => {
    return submission.user?.full_name || submission.full_name || 'Unknown'
  }

  const getUserEmail = (submission: KYCSubmission) => {
    return submission.user?.email || '-'
  }

  const getUserPhone = (submission: KYCSubmission) => {
    return submission.phone_number || submission.user?.phone || '-'
  }

  const getUserAvatar = (submission: KYCSubmission) => {
    return submission.user?.avatar_url || null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <FileCheck className="h-5 w-5 text-white" />
            </div>
            KYC Review
          </h1>
          <p className="text-muted-foreground mt-1">
            Verifikasi identitas pengguna
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <ShieldCheck className="h-5 w-5 text-teal-500" />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.approved}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.rejected}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button onClick={handleSearch} variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Processed ({processedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-28 w-full rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                <p className="font-medium">Tidak ada KYC pending</p>
                <p className="text-sm mt-1">Semua submission sudah direview</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-teal-200 dark:border-teal-800">
                        <AvatarImage src={getUserAvatar(submission) || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                          {getUserName(submission)[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{getUserName(submission)}</CardTitle>
                        <CardDescription className="text-xs truncate">{getUserEmail(submission)}</CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIK:</span>
                        <span className="font-mono text-xs">{submission.ktp_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{getUserPhone(submission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="text-xs">{formatDate(submission.submitted_at || submission.created_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        {submission.ktp_image_url ? (
                          <Image
                            src={submission.ktp_image_url}
                            alt="KTP"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            No KTP
                          </div>
                        )}
                        {submission.ktp_image_url && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-1 right-1 h-6 w-6"
                            onClick={() => setImageZoom(submission.ktp_image_url)}
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
                        {submission.selfie_image_url ? (
                          <Image
                            src={submission.selfie_image_url}
                            alt="Selfie"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            No Selfie
                          </div>
                        )}
                        {submission.selfie_image_url && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-1 right-1 h-6 w-6"
                            onClick={() => setImageZoom(submission.selfie_image_url)}
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setDetailDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-teal-500 hover:bg-teal-600"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setReviewDialog(true)
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed">
          {loading ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : processedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 text-amber-500 opacity-50" />
                <p className="font-medium">Tidak ada KYC yang sudah diproses</p>
                <p className="text-sm mt-1">KYC yang sudah direview akan muncul di sini</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {processedSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getUserAvatar(submission) || undefined} />
                          <AvatarFallback>{getUserName(submission)[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getUserName(submission)}</p>
                          <p className="text-xs text-muted-foreground">{submission.ktp_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {submission.reviewed_at && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(submission.reviewed_at)}
                            </p>
                          )}
                          {submission.rejection_reason && (
                            <p className="text-xs text-red-500 max-w-[200px] truncate" title={submission.rejection_reason}>
                              {submission.rejection_reason}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(submission.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setDetailDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Detail</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getUserAvatar(selectedSubmission) || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xl">
                    {getUserName(selectedSubmission)[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{getUserName(selectedSubmission)}</h3>
                  <p className="text-sm text-muted-foreground">{getUserEmail(selectedSubmission)}</p>
                  <p className="text-sm text-muted-foreground">{getUserPhone(selectedSubmission)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">NIK</Label>
                  <p className="font-mono">{selectedSubmission.ktp_number}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Alamat</Label>
                  <p>{selectedSubmission.full_address || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Lokasi</Label>
                  <p>{[selectedSubmission.village_name, selectedSubmission.district_name, selectedSubmission.city_name, selectedSubmission.province_name].filter(Boolean).join(', ') || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p>{formatDate(selectedSubmission.submitted_at || selectedSubmission.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Reviewed</Label>
                  <p>{formatDate(selectedSubmission.reviewed_at)}</p>
                </div>
                {selectedSubmission.reviewer && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Reviewed By</Label>
                    <p>{selectedSubmission.reviewer.full_name || selectedSubmission.reviewer.email}</p>
                  </div>
                )}
                {selectedSubmission.rejection_reason && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-red-500">Alasan Penolakan</Label>
                    <p className="text-red-500">{selectedSubmission.rejection_reason}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">KTP Image</Label>
                  <div className="mt-2 relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                    {selectedSubmission.ktp_image_url ? (
                      <Image src={selectedSubmission.ktp_image_url} alt="KTP" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No KTP Image
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Selfie with KTP</Label>
                  <div className="mt-2 relative aspect-[4/5] rounded-lg overflow-hidden border bg-muted">
                    {selectedSubmission.selfie_image_url ? (
                      <Image src={selectedSubmission.selfie_image_url} alt="Selfie" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No Selfie Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
            <DialogDescription>Approve or reject this KYC submission</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">{getUserName(selectedSubmission)}</p>
                <p className="text-sm text-muted-foreground">NIK: {selectedSubmission.ktp_number}</p>
                <p className="text-sm text-muted-foreground">{getUserEmail(selectedSubmission)}</p>
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
              onClick={handleApprove}
              disabled={processing}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!imageZoom} onOpenChange={() => setImageZoom(null)}>
        <DialogContent className="sm:max-w-4xl">
          {imageZoom && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={imageZoom} alt="Preview" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
