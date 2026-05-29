'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Wallet,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CreditCard,
  Coins,
  Calendar,
  User,
  ExternalLink,
  FileText,
  Banknote,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface TopupRequest {
  id: string
  topup_number: string | null
  user_id: string
  amount: number
  tokens: number
  payment_method: string
  payment_proof_url: string | null
  payment_reference: string | null
  status: 'pending' | 'confirmed' | 'rejected'
  rejection_reason: string | null
  processed_by: string | null
  processed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    phone: string | null
  } | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminTopupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<TopupRequest[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedRecord, setSelectedRecord] = useState<TopupRequest | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTopupRequests()
  }, [pagination.page, statusFilter])

  const fetchTopupRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/topup?${params}`)
      const data = await res.json()

      if (data.success) {
        setRecords(data.data || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching topup requests:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data topup',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTopupRequests()
  }

  const handleConfirm = async (record: TopupRequest) => {
    if (!confirm('Apakah Anda yakin ingin mengkonfirmasi topup ini? Token akan ditambahkan ke akun pengguna.')) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/topup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topupId: record.id,
          status: 'confirmed',
          adminId: 'admin', // In real app, use actual admin user ID
          notes: adminNotes || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Berhasil',
          description: `Topup berhasil dikonfirmasi. ${record.tokens} token ditambahkan ke akun pengguna.`,
        })
        setShowDetail(false)
        setAdminNotes('')
        fetchTopupRequests()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRecord) return
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan harus diisi',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/topup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topupId: selectedRecord.id,
          status: 'rejected',
          adminId: 'admin', // In real app, use actual admin user ID
          rejectionReason: rejectionReason.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Berhasil',
          description: 'Topup berhasil ditolak',
        })
        setShowReject(false)
        setShowDetail(false)
        setRejectionReason('')
        fetchTopupRequests()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      e_wallet: 'E-Wallet',
      cash: 'Cash',
      qris: 'QRIS',
      va: 'Virtual Account',
    }
    return methods[method] || method
  }

  const openDetailModal = (record: TopupRequest) => {
    setSelectedRecord(record)
    setAdminNotes(record.notes || '')
    setShowDetail(true)
  }

  const openRejectModal = () => {
    setShowReject(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-orange-500" />
            Topup Requests
          </h1>
          <p className="text-gray-400 mt-1">Kelola permintaan topup token manual</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
            {pagination.total} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Cari nomor topup atau referensi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="pending" className="text-white hover:bg-gray-700">Pending</SelectItem>
                <SelectItem value="confirmed" className="text-white hover:bg-gray-700">Confirmed</SelectItem>
                <SelectItem value="rejected" className="text-white hover:bg-gray-700">Rejected</SelectItem>
                <SelectItem value="" className="text-white hover:bg-gray-700">Semua Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Topup Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Tidak ada data topup ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Request ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Tokens</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Payment Method</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => openDetailModal(record)}
                    >
                      <td className="p-4">
                        <span className="font-mono text-white text-sm">
                          {record.topup_number || record.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.user?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs">
                              {record.user?.full_name?.[0]?.toUpperCase() || record.user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white text-sm">{record.user?.full_name || 'No name'}</p>
                            <p className="text-xs text-gray-400">{record.user?.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-white">{formatCurrency(record.amount)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-white">{record.tokens}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-white text-sm">{getPaymentMethodLabel(record.payment_method)}</span>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4 text-gray-400 text-sm">{formatDate(record.created_at)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {record.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedRecord(record)
                                  handleConfirm(record)
                                }}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedRecord(record)
                                  openRejectModal()
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetailModal(record)
                            }}
                            className="border-gray-700 text-gray-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} record
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Detail Topup Request
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Informasi lengkap permintaan topup token
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedRecord.user?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xl">
                    {selectedRecord.user?.full_name?.[0]?.toUpperCase() || selectedRecord.user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{selectedRecord.user?.full_name || 'No name'}</h3>
                  <p className="text-gray-400">{selectedRecord.user?.email || '-'}</p>
                  {selectedRecord.user?.phone && (
                    <p className="text-sm text-gray-500">{selectedRecord.user.phone}</p>
                  )}
                </div>
                <div>{getStatusBadge(selectedRecord.status)}</div>
              </div>

              {/* Topup Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Request ID</p>
                      <p className="text-white font-medium font-mono">{selectedRecord.topup_number || selectedRecord.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Jumlah Transfer</p>
                      <p className="text-white font-bold text-lg">{formatCurrency(selectedRecord.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Coins className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Token Diterima</p>
                      <p className="text-orange-400 font-bold text-lg">{selectedRecord.tokens} Token</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Metode Pembayaran</p>
                      <p className="text-white font-medium">{getPaymentMethodLabel(selectedRecord.payment_method)}</p>
                    </div>
                  </div>
                  {selectedRecord.payment_reference && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Referensi Pembayaran</p>
                        <p className="text-white font-medium font-mono">{selectedRecord.payment_reference}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Request</p>
                      <p className="text-white font-medium">{formatDate(selectedRecord.created_at)}</p>
                    </div>
                  </div>
                  {selectedRecord.processed_at && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Diproses</p>
                        <p className="text-white font-medium">{formatDate(selectedRecord.processed_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Proof */}
              {selectedRecord.payment_proof_url && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Bukti Pembayaran</p>
                  <a
                    href={selectedRecord.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group"
                  >
                    <img
                      src={selectedRecord.payment_proof_url}
                      alt="Payment Proof"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <ExternalLink className="h-6 w-6 text-white" />
                      <span className="ml-2 text-white">Lihat Full Size</span>
                    </div>
                  </a>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRecord.status === 'rejected' && selectedRecord.rejection_reason && (
                <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Alasan Penolakan</p>
                  </div>
                  <p className="text-gray-300">{selectedRecord.rejection_reason}</p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRecord.status === 'pending' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Catatan Admin (Opsional)</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk konfirmasi..."
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>
              )}

              {/* Action Buttons for Pending */}
              {selectedRecord.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <Button
                    onClick={() => handleConfirm(selectedRecord)}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Konfirmasi & Tambah Token
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetail(false)
                      openRejectModal()
                    }}
                    disabled={saving}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              Tolak Topup Request
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Berikan alasan penolakan untuk pengguna
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Alasan Penolakan</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReject(false)
                setRejectionReason('')
              }}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={saving || !rejectionReason.trim()}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tolak Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
