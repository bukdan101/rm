'use client'

import { useState, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Users,
  Calendar,
  ArrowUpRight,
  Download,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Payment {
  id: string
  invoice_number: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
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

const mockPayments: Payment[] = [
  {
    id: '1',
    invoice_number: 'INV-20240320-0001',
    user_id: 'u1',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    user_avatar: null,
    package_name: 'Basic',
    package_type: 'user',
    amount: 100000,
    credits_awarded: 110,
    payment_method: 'bni_va',
    va_number: '8808123456789012',
    status: 'pending',
    proof_url: null,
    paid_at: null,
    verified_at: null,
    expires_at: '2024-03-21T10:00:00Z',
    created_at: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    invoice_number: 'INV-20240320-0002',
    user_id: 'u2',
    user_name: 'Auto Prima Jakarta',
    user_email: 'finance@autoprima.com',
    user_avatar: null,
    package_name: 'Dealer Pro',
    package_type: 'dealer',
    amount: 500000,
    credits_awarded: 850,
    payment_method: 'bni_va',
    va_number: '8808123456789013',
    status: 'paid',
    proof_url: 'https://picsum.photos/seed/proof1/800/600',
    paid_at: '2024-03-20T11:30:00Z',
    verified_at: null,
    expires_at: '2024-03-21T09:00:00Z',
    created_at: '2024-03-20T09:00:00Z',
  },
  {
    id: '3',
    invoice_number: 'INV-20240319-0003',
    user_id: 'u3',
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    user_avatar: null,
    package_name: 'Premium',
    package_type: 'user',
    amount: 500000,
    credits_awarded: 575,
    payment_method: 'bni_va',
    va_number: '8808123456789014',
    status: 'verified',
    proof_url: 'https://picsum.photos/seed/proof2/800/600',
    paid_at: '2024-03-19T14:00:00Z',
    verified_at: '2024-03-19T15:30:00Z',
    expires_at: '2024-03-20T08:00:00Z',
    created_at: '2024-03-19T08:00:00Z',
  },
]

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setPayments(mockPayments)
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
  }

  const pendingPayments = payments.filter(p => p.status === 'paid' || p.status === 'pending')
  const verifiedPayments = payments.filter(p => p.status === 'verified')

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    verified: payments.filter(p => p.status === 'verified').length,
    totalAmount: payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  }

  const handleVerify = async () => {
    if (!selectedPayment) return

    try {
      setProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPayments(prev => prev.map(p =>
        p.id === selectedPayment.id
          ? { ...p, status: 'verified' as const, verified_at: new Date().toISOString() }
          : p
      ))

      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil diverifikasi',
      })

      setVerifyDialog(false)
      setSelectedPayment(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal verifikasi pembayaran',
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
    }).format(amount)
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
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            <CreditCard className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
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
          ) : payments.filter(p => p.status === 'paid').length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                <p className="font-medium">Tidak ada pembayaran menunggu verifikasi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.filter(p => p.status === 'paid').map((payment) => (
                <Card key={payment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:w-48 shrink-0 bg-muted/50 flex items-center justify-center">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden border bg-white">
                          <Image
                            src={payment.proof_url || ''}
                            alt="Payment Proof"
                            fill
                            className="object-cover"
                          />
                        </div>
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
                                <AvatarImage src={payment.user_avatar || undefined} />
                                <AvatarFallback>{payment.user_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{payment.user_name}</p>
                                <p className="text-xs text-muted-foreground">{payment.user_email}</p>
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
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.invoice_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={payment.user_avatar || undefined} />
                            <AvatarFallback>{payment.user_name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{payment.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.package_name}</p>
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
                  <p className="text-sm text-muted-foreground">{selectedPayment.package_name}</p>
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
                  <span className="font-medium">{selectedPayment.payment_method.toUpperCase()}</span>
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
                <p className="text-sm text-muted-foreground">{selectedPayment.credits_awarded} credits untuk {selectedPayment.user_name}</p>
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
    </div>
  )
}
