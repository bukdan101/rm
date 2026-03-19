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

interface KYCSubmission {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string
  user_avatar: string | null
  ktp_number: string
  ktp_image_url: string
  selfie_image_url: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  notes: string | null
}

const mockKYCSubmissions: KYCSubmission[] = [
  {
    id: '1',
    user_id: 'u1',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    user_phone: '081234567890',
    user_avatar: null,
    ktp_number: '3171234567890001',
    ktp_image_url: 'https://picsum.photos/seed/ktp1/400/300',
    selfie_image_url: 'https://picsum.photos/seed/selfie1/400/500',
    status: 'pending',
    submitted_at: '2024-03-20T10:30:00Z',
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    notes: null,
  },
  {
    id: '2',
    user_id: 'u2',
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    user_phone: '082345678901',
    user_avatar: null,
    ktp_number: '3171234567890002',
    ktp_image_url: 'https://picsum.photos/seed/ktp2/400/300',
    selfie_image_url: 'https://picsum.photos/seed/selfie2/400/500',
    status: 'pending',
    submitted_at: '2024-03-19T15:45:00Z',
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    notes: null,
  },
  {
    id: '3',
    user_id: 'u3',
    user_name: 'Mike Wilson',
    user_email: 'mike@example.com',
    user_phone: '083456789012',
    user_avatar: null,
    ktp_number: '3171234567890003',
    ktp_image_url: 'https://picsum.photos/seed/ktp3/400/300',
    selfie_image_url: 'https://picsum.photos/seed/selfie3/400/500',
    status: 'approved',
    submitted_at: '2024-03-18T09:00:00Z',
    reviewed_at: '2024-03-18T14:30:00Z',
    reviewed_by: 'Admin',
    rejection_reason: null,
    notes: 'Dokumen lengkap dan valid',
  },
]

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [imageZoom, setImageZoom] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setSubmissions(mockKYCSubmissions)
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

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const processedSubmissions = submissions.filter(s => s.status !== 'pending')

  const filteredSubmissions = submissions.filter(s =>
    s.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ktp_number.includes(searchQuery)
  )

  const stats = {
    total: submissions.length,
    pending: pendingSubmissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return

    try {
      setProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmissions(prev => prev.map(s =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'approved' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Admin' }
          : s
      ))

      toast({
        title: 'Berhasil',
        description: 'KYC berhasil disetujui',
      })

      setReviewDialog(false)
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyetujui KYC',
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
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmissions(prev => prev.map(s =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'rejected' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', rejection_reason: rejectionReason }
          : s
      ))

      toast({
        title: 'Berhasil',
        description: 'KYC telah ditolak',
      })

      setReviewDialog(false)
      setSelectedSubmission(null)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menolak KYC',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
                    <Skeleton className="h-16 w-16 rounded-lg mx-auto" />
                    <Skeleton className="h-5 w-32 mx-auto mt-4" />
                    <Skeleton className="h-4 w-48 mx-auto mt-2" />
                    <Skeleton className="h-10 w-full mt-4" />
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
                        <AvatarImage src={submission.user_avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                          {submission.user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{submission.user_name}</CardTitle>
                        <CardDescription className="text-xs truncate">{submission.user_email}</CardDescription>
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
                        <span>{submission.user_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="text-xs">{formatDate(submission.submitted_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={submission.ktp_image_url}
                          alt="KTP"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-1 right-1 h-6 w-6"
                          onClick={() => setImageZoom(submission.ktp_image_url)}
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={submission.selfie_image_url}
                          alt="Selfie"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-1 right-1 h-6 w-6"
                          onClick={() => setImageZoom(submission.selfie_image_url)}
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
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
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {processedSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={submission.user_avatar || undefined} />
                        <AvatarFallback>{submission.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{submission.user_name}</p>
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
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <AvatarImage src={selectedSubmission.user_avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xl">
                    {selectedSubmission.user_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedSubmission.user_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.user_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.user_phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">KTP Image</Label>
                  <div className="mt-2 relative aspect-[4/3] rounded-lg overflow-hidden border">
                    <Image src={selectedSubmission.ktp_image_url} alt="KTP" fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Selfie with KTP</Label>
                  <div className="mt-2 relative aspect-[4/5] rounded-lg overflow-hidden border">
                    <Image src={selectedSubmission.selfie_image_url} alt="Selfie" fill className="object-cover" />
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
                <p className="font-medium">{selectedSubmission.user_name}</p>
                <p className="text-sm text-muted-foreground">NIK: {selectedSubmission.ktp_number}</p>
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
