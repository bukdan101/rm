'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Payment {
  id: string
  invoice_number: string
  user_id: string
  user?: {
    full_name: string
    email: string
    avatar_url: string | null
  }
  dealer?: {
    name: string
  }
  package?: {
    name: string
  }
  package_name: string
  package_type: 'user' | 'dealer'
  amount: number
  credits_awarded: number
  payment_method: string
  va_number: string | null
  status: 'pending' | 'paid' | 'verified' | 'cancelled' | 'expired'
  proof_url: string | null
  paid_at: string | null
  verified_at: string | null
  expires_at: string
  created_at: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const { toast } = useToast()

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: ((pagination.page - 1) * pagination.limit).toString()
      })
      
      const response = await fetch(`/api/admin/payments?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }
      
      const data = await response.json()
      setPayments(data.payments || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pembayaran',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, toast])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filteredPayments = searchQuery
    ? payments.filter(p => 
        p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dealer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    verified: payments.filter(p => p.status === 'verified').length,
    totalAmount: payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + (p.amount || 0), 0),
    pendingAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
  }

  const handleVerify = async () => {
    if (!selectedPayment) return

    try {
      setProcessing(true)
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          action: 'verify'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to verify payment')
      }

      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil diverifikasi',
      })

      setVerifyDialog(false)
      setSelectedPayment(null)
      fetchPayments()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal verifikasi pembayaran',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPayment) return

    try {
      setProcessing(true)
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          action: 'reject'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject payment')
      }

      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil ditolak',
      })

      setRejectDialog(false)
      setSelectedPayment(null)
      fetchPayments()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menolak pembayaran',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
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
      case 'paid':
        return <Badge className="bg-amber-500 gap-1"><AlertCircle className="h-3 w-3" />Awaiting Verification</Badge>
      case 'verified':
        return <Badge className="bg-emerald-500 gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>
      case 'expired':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>
      default:
        return null
    }
  }

  const getUserName = (payment: Payment) => {
    return payment.user?.full_name || payment.dealer?.name || 'Unknown'
  }

  const getUserEmail = (payment: Payment) => {
    return payment.user?.email || '-'
  }

  const getUserAvatar = (payment: Payment) => {
    return payment.user?.avatar_url || null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Payment Verification
          </h1>
          <p className="text-muted-foreground mt-1">
            Verifikasi pembayaran token
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-16 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-rose-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
                <CreditCard className="h-5 w-5 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pagination.total}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting Verification</CardTitle>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.paid}</div>
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(stats.pendingAmount)}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.verified}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verification" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Awaiting Verification ({stats.paid})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          {loading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : filteredPayments.filter(p => p.status === 'paid').length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                <p className="font-medium">Tidak ada pembayaran menunggu verifikasi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.filter(p => p.status === 'paid').map((payment) => (
                <Card key={payment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:w-48 shrink-0 bg-muted/50 flex items-center justify-center">
                        {payment.proof_url ? (
                          <div className="relative w-32 h-20 rounded-lg overflow-hidden border bg-white">
                            <Image
                              src={payment.proof_url}
                              alt="Payment Proof"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-20 rounded-lg border bg-muted flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm">{payment.invoice_number}</span>
                              {getStatusBadge(payment.status)}
                            </div>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={getUserAvatar(payment) || undefined} />
                                <AvatarFallback>{getUserName(payment)[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getUserName(payment)}</p>
                                <p className="text-xs text-muted-foreground">{getUserEmail(payment)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                              <p className="text-sm text-muted-foreground">{payment.credits_awarded} credits</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setDetailDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setVerifyDialog(true)
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari invoice atau nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {loading ? (
                <div className="p-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.invoice_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={getUserAvatar(payment) || undefined} />
                              <AvatarFallback>{getUserName(payment)[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{getUserName(payment)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{payment.package?.name || payment.package_name}</p>
                            <p className="text-xs text-muted-foreground">{payment.credits_awarded} credits</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setDetailDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Detail</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-mono text-lg">{selectedPayment.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.package?.name || selectedPayment.package_name}</p>
                </div>
                {getStatusBadge(selectedPayment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Credits</p>
                  <p className="text-xl font-bold">{selectedPayment.credits_awarded}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{selectedPayment.payment_method?.toUpperCase()}</span>
                </div>
                {selectedPayment.va_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VA Number:</span>
                    <span className="font-mono">{selectedPayment.va_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(selectedPayment.created_at)}</span>
                </div>
                {selectedPayment.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid at:</span>
                    <span>{formatDate(selectedPayment.paid_at)}</span>
                  </div>
                )}
                {selectedPayment.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified at:</span>
                    <span>{formatDate(selectedPayment.verified_at)}</span>
                  </div>
                )}
              </div>

              {selectedPayment.proof_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Payment Proof</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={selectedPayment.proof_url} alt="Proof" fill className="object-contain bg-muted" />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>Confirm this payment verification</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-mono text-sm">{selectedPayment.invoice_number}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(selectedPayment.amount)}</p>
                <p className="text-sm text-muted-foreground">{selectedPayment.credits_awarded} credits untuk {getUserName(selectedPayment)}</p>
              </div>

              {selectedPayment.proof_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image src={selectedPayment.proof_url} alt="Proof" fill className="object-contain bg-muted" />
                </div>
              )}

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Setelah verifikasi, {selectedPayment.credits_awarded} token akan ditambahkan ke akun pengguna.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={processing} className="bg-emerald-500 hover:bg-emerald-600">
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>Reject this payment submission</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-mono text-sm">{selectedPayment.invoice_number}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Pembayaran akan ditandai sebagai dibatalkan dan tidak ada token yang diberikan.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button onClick={handleReject} disabled={processing} variant="destructive">
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
